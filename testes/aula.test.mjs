import { test } from "node:test";
import assert from "node:assert/strict";
import { limpaTexto, ehTitulo, blocos, palavrasChave, resumoExtrativo, montaMaterialDaAula, textoCompleto, LIMITE_TEXTO } from "../js/aula.js";
import { cartoesDoTexto, lacunasDoTexto } from "../js/gerador.js";
import { pareceEscaneado } from "../js/importar.js";
import { corpoAula, estadoAula, descreveOrigem, separaArquivos, sugereTitulo, MAX_ARQUIVOS } from "../js/ui/dialogo-aula.js";
import { corpoMaterial, salvaCartoesDoMaterial, ROTULO_TIPO } from "../js/ui/leitor.js";
import { normMaterial } from "../js/normaliza.js";
import { criaLoja } from "../js/loja.js";

const AULA = `UNIVERSIDADE FEDERAL - BIOLOGIA CELULAR
1
MEMBRANA PLASMÁTICA
A membrana plasmática é a estrutura que delimita a célula e controla a entrada e a saída de sub-
stâncias. Ela é formada por uma bicamada de fosfolipídios com proteínas inseridas.
• Modelo do mosaico fluido: proposto por Singer e Nicolson em 1972
• As proteínas da membrana plasmática podem ser integrais ou periféricas
UNIVERSIDADE FEDERAL - BIOLOGIA CELULAR
2
Transporte pela membrana
Difusão simples é a passagem de moléculas a favor do gradiente de concentração, sem gasto de energia.
A difusão facilitada usa proteínas transportadoras, também sem gasto de energia.
O transporte ativo é o movimento contra o gradiente de concentração, com gasto de ATP.
A bomba de sódio e potássio é o exemplo clássico de transporte ativo: ela usa ATP para levar sódio para fora e potássio para dentro.
UNIVERSIDADE FEDERAL - BIOLOGIA CELULAR
3
Osmose
Osmose é a passagem de água através da membrana semipermeável, do meio menos concentrado para o mais concentrado.
Em meio hipotônico a célula animal incha e pode se romper.`;

test("limpaTexto junta hifenização e tira número de página, cabeçalho repetido e marcadores estranhos", () => {
  const t = limpaTexto(AULA);
  assert.match(t, /substâncias/);
  assert.doesNotMatch(t, /UNIVERSIDADE FEDERAL/);
  assert.doesNotMatch(t, /^\d+$/m);
  assert.match(t, /^- Modelo do mosaico fluido/m);
  assert.equal(limpaTexto("Página 3 de 10\n||| ~~\nTexto bom aqui"), "Texto bom aqui");
});

test("ehTitulo reconhece títulos curtos e recusa frases e itens de lista", () => {
  assert.equal(ehTitulo("MEMBRANA PLASMÁTICA"), true);
  assert.equal(ehTitulo("Transporte pela membrana"), true);
  assert.equal(ehTitulo("Osmose é a passagem de água."), false);
  assert.equal(ehTitulo("- Modelo do mosaico"), false);
});

test("blocos separa a aula pelos títulos", () => {
  const bs = blocos(limpaTexto(AULA));
  assert.deepEqual(bs.map((b) => b.titulo), ["Membrana plasmática", "Transporte pela membrana", "Osmose"]);
  assert.ok(bs[0].linhas.some((l) => l.startsWith("A membrana plasmática é a estrutura")));
});

test("palavrasChave junta termos compostos e conta repetições", () => {
  const ts = palavrasChave(["O transporte ativo gasta ATP.", "No transporte ativo a célula gasta ATP.", "A célula vive."]);
  const chaves = ts.map((t) => t.chave);
  assert.ok(chaves.includes("transporte ativo"));
  assert.ok(!chaves.includes("transporte"), "a palavra solta some quando a dupla cobre quase todas as vezes");
});

test("resumoExtrativo pega ao menos uma frase de cada tópico, na ordem do texto", () => {
  const frases = [
    "A célula é a unidade básica de todos os seres vivos.",
    "Ela tem membrana, citoplasma e material genético.",
    "Existem células procariontes e eucariontes no mundo.",
    "A mitocôndria é a organela da respiração celular.",
    "Ela produz a maior parte do ATP da célula.",
  ];
  const r = resumoExtrativo(frases, 2, [0, 0, 0, 1, 1]);
  assert.equal(r.length, 2);
  assert.match(r[0], /célula é a unidade/);
  assert.match(r[1], /mitocôndria/);
});

test("montaMaterialDaAula monta todas as seções e um texto com termos para lacunas", () => {
  const r = montaMaterialDaAula({ texto: AULA, titulo: "Membrana", origem: "o PDF “Aula 3”", agora: new Date(2026, 10, 8) });
  assert.equal(r.erro, "");
  for (const s of ["## Resumo", "## Palavras-chave", "## Conceitos", "## Mapa do conteúdo", "## Perguntas para treinar", "## Plano de revisão"]) assert.ok(r.content.includes(s), s);
  assert.match(r.content, /o PDF “Aula 3”/);
  assert.match(r.content, /\*\*09\/11\*\*.*\n.*\*\*11\/11\*\*.*\n.*\*\*15\/11\*\*.*\n.*\*\*23\/11\*\*/);
  assert.match(r.content, /O que é osmose\?/);
  assert.doesNotMatch(r.content, /O que é - /);
  assert.match(r.fonte, /^### Membrana plasmática/m);
  assert.ok(cartoesDoTexto(r.fonte).length >= 5);
  assert.ok(lacunasDoTexto(r.fonte).length >= 5);
  assert.equal(r.cortado, false);
});

test("montaMaterialDaAula recusa texto curto e corta texto longo demais", () => {
  assert.match(montaMaterialDaAula({ texto: "Oi, tudo bem?" }).erro, /curto/);
  const longo = Array.from({ length: 1200 }, (_, i) => `A frase número ${i} fala de um conceito importante da aula.`).join("\n");
  const r = montaMaterialDaAula({ texto: longo });
  assert.equal(r.cortado, true);
  assert.ok(r.fonte.replace(/\*\*/g, "").length <= LIMITE_TEXTO + 2000);
});

test("textoCompleto junta o material montado e o texto da aula", () => {
  assert.equal(textoCompleto({ content: "A" }), "A");
  assert.equal(textoCompleto({ content: "A", fonte: "B" }), "A\n\n## Texto da aula\n\nB");
  assert.equal(textoCompleto(null), "");
});

test("pareceEscaneado: PDF sem letras por página é escaneado", () => {
  assert.equal(pareceEscaneado("", 3), true);
  assert.equal(pareceEscaneado("a".repeat(500), 3), false);
});

test("diálogo da aula: origem, separação de arquivos e título sugerido", () => {
  assert.equal(descreveOrigem([]), "texto colado");
  assert.equal(descreveOrigem([{ tipo: "foto", nome: "a.jpg" }, { tipo: "foto", nome: "b.jpg" }, { tipo: "pdf", nome: "Aula 3.pdf" }]), "2 fotos do quadro e o PDF “Aula 3”");
  const s = separaArquivos([
    { name: "a.pdf", type: "application/pdf", size: 1000 },
    { name: "b.jpg", type: "image/jpeg", size: 1000 },
    { name: "c.docx", type: "application/msword", size: 1000 },
    { name: "d.png", type: "image/png", size: 30 * 1024 * 1024 },
  ]);
  assert.equal(s.pdfs.length, 1);
  assert.equal(s.fotos.length, 1);
  assert.match(s.erro, /d\.png/);
  assert.match(separaArquivos(Array.from({ length: MAX_ARQUIVOS + 1 }, (_, i) => ({ name: `${i}.jpg`, type: "image/jpeg", size: 1 }))).erro, /até/);
  assert.equal(sugereTitulo("1\nMEMBRANA PLASMÁTICA\nA membrana é."), "MEMBRANA PLASMÁTICA");
});

test("corpoAula desenha cada fase e escapa o texto lido", () => {
  const escolher = corpoAula(estadoAula());
  assert.match(escolher, /data-arquivo-aula/);
  assert.match(escolher, /capture="environment"/);
  assert.match(escolher, /data-acao="colar"/);
  const lendo = corpoAula({ ...estadoAula(), fase: "lendo", foto: true, rotulo: "Lendo foto 1 de 2…" });
  assert.match(lendo, /Lendo foto 1 de 2/);
  assert.match(lendo, /10 MB/);
  const rev = corpoAula({ ...estadoAula("Bio"), fase: "revisar", texto: "<script>x</script>" }, [{ name: "Bio" }]);
  assert.match(rev, /&lt;script&gt;/);
  assert.match(rev, /data-acao="montar"/);
  assert.match(rev, /<option value="Bio">/);
  assert.match(corpoAula({ ...estadoAula(), fase: "revisar", texto: "x".repeat(LIMITE_TEXTO + 1) }), /Só os primeiros 30 mil/);
});

test("material da aula: normaliza guarda o tipo e o texto; o leitor mostra tudo e os cartões saem do texto", () => {
  const r = montaMaterialDaAula({ texto: AULA });
  const m = normMaterial({ id: "a1", title: "Membrana", subject: "Bio", kind: "aula", content: r.content, fonte: r.fonte });
  assert.equal(m.kind, "aula");
  assert.equal(m.fonte, r.fonte);
  assert.equal(normMaterial({ kind: "x" }).fonte, "");
  assert.equal(ROTULO_TIPO.aula, "Material da aula");
  const h = corpoMaterial(m);
  assert.match(h, /Texto da aula/);
  assert.match(h, /Plano de revisão/);
  const loja = criaLoja({ armazenamento: null });
  const n = salvaCartoesDoMaterial(loja, m);
  assert.ok(n >= 8);
  assert.ok(loja.lista("cartoes").every((c) => c.subject === "Bio"));
  assert.equal(salvaCartoesDoMaterial(loja, m), 0, "não repete cartões");
});

test("aviso da leitura (PDF escaneado) aparece neutro, não como erro", () => {
  const h = corpoAula({ ...estadoAula(), fase: "revisar", texto: "abc", aviso: "“x.pdf” é escaneado" });
  assert.match(h, /role="status"[^>]*>“x\.pdf” é escaneado/);
  assert.doesNotMatch(h, /role="alert"/);
});

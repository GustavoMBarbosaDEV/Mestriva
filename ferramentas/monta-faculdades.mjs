// Gera conteudo/faculdades.json (faculdades e cursos de graduação) a partir dos microdados do
// Censo da Educação Superior do INEP. Os CSVs (≈450 MB) não entram no repositório.
// Uso: node ferramentas/monta-faculdades.mjs <pasta com MICRODADOS_ED_SUP_IES_AAAA.CSV e MICRODADOS_CADASTRO_CURSOS_AAAA.CSV>
// Fonte: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-da-educacao-superior
//
// Entram: todas as federais; as estaduais de MG, SP e RJ; e as particulares com mais matrículas
// nesses três estados (cursos presenciais e a distância oferecidos lá).
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const ESTADOS = new Set(["MG", "SP", "RJ"]);
const MIN_MATRICULAS_PARTICULAR = 1500; // matrículas na IES dentro de MG/SP/RJ
const MAX_PARTICULARES = 300;
const FEDERAL = "1";
const ESTADUAL = "2";
const PARTICULARES = new Set(["4", "5", "6", "7"]); // com e sem fins lucrativos, especial, comunitária

async function* linhas(arq) {
  const rl = readline.createInterface({ input: fs.createReadStream(arq, { encoding: "latin1" }), crlfDelay: Infinity });
  let cab = null;
  for await (const l of rl) {
    const c = l.split(";").map((v) => v.replace(/^"|"$/g, ""));
    if (!cab) { cab = Object.fromEntries(c.map((n, i) => [n, i])); continue; }
    yield (/** @type {string} */ nome) => c[cab[nome]] ?? "";
  }
}

/** "CIÊNCIAS CONTÁBEIS" → "Ciências Contábeis" (preposições em minúsculas, siglas mantidas). */
export function titulo(s) {
  const minusc = new Set(["de", "da", "do", "das", "dos", "e", "em", "para", "a", "o", "com", "na", "no", "ao", "à"]);
  return String(s)
    .trim()
    .replace(/^ABI\s*-\s*/i, "") // "ABI" = área básica de ingresso: a pessoa procura pelo nome do curso
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((p, i) => {
      if (i > 0 && minusc.has(p)) return p;
      if (/^(i|ii|iii|iv|v|vi)$/.test(p)) return p.toUpperCase();
      return p.replace(/(^|[-/(])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
    })
    .join(" ");
}

async function principal(pasta) {
  const arqs = fs.readdirSync(pasta);
  const ies = arqs.find((f) => /^MICRODADOS_ED_SUP_IES_\d+\.CSV$/i.test(f));
  const cursos = arqs.find((f) => /^MICRODADOS_CADASTRO_CURSOS_\d+\.CSV$/i.test(f));
  if (!ies || !cursos) throw new Error("Faltam os CSVs do INEP na pasta informada.");
  const ano = Number(ies.match(/(\d{4})/)[1]);

  /** @type {Map<string, {nome:string, sigla:string, uf:string, cidade:string, cat:string}>} */
  const todas = new Map();
  for await (const g of linhas(path.join(pasta, ies))) {
    todas.set(g("CO_IES"), { nome: g("NO_IES"), sigla: g("SG_IES"), uf: g("SG_UF_IES"), cidade: g("NO_MUNICIPIO_IES"), cat: g("TP_CATEGORIA_ADMINISTRATIVA") });
  }

  /** @type {Map<string, {mat:number, cursos:Map<string, number>, ufs:Set<string>}>} */
  const porIes = new Map();
  for await (const g of linhas(path.join(pasta, cursos))) {
    if (g("TP_NIVEL_ACADEMICO") !== "1") continue; // só graduação
    const co = g("CO_IES");
    const inst = todas.get(co);
    if (!inst) continue;
    const uf = g("SG_UF");
    const entra = inst.cat === FEDERAL || ((inst.cat === ESTADUAL || PARTICULARES.has(inst.cat)) && ESTADOS.has(uf));
    if (!entra) continue;
    const mat = Number(g("QT_MAT")) || 0;
    const nome = g("NO_CURSO");
    if (!nome) continue;
    const r = porIes.get(co) || { mat: 0, cursos: new Map(), ufs: new Set() };
    r.mat += mat;
    r.cursos.set(nome, (r.cursos.get(nome) || 0) + mat);
    if (uf) r.ufs.add(uf);
    porIes.set(co, r);
  }

  const escolhidas = [];
  const particulares = [];
  for (const [co, r] of porIes) {
    const inst = todas.get(co);
    if (inst.cat === FEDERAL || inst.cat === ESTADUAL) escolhidas.push([co, r]);
    else if (r.mat >= MIN_MATRICULAS_PARTICULAR) particulares.push([co, r]);
  }
  particulares.sort((a, b) => b[1].mat - a[1].mat);
  escolhidas.push(...particulares.slice(0, MAX_PARTICULARES));

  // Nomes de curso num dicionário (muitos se repetem): cada faculdade guarda só os números.
  const nomesCurso = new Map();
  const idDoCurso = (n) => {
    const t = titulo(n);
    if (!nomesCurso.has(t)) nomesCurso.set(t, nomesCurso.size);
    return nomesCurso.get(t);
  };
  const tipo = { [FEDERAL]: "federal", [ESTADUAL]: "estadual" };
  const faculdades = escolhidas
    .map(([co, r]) => {
      const inst = todas.get(co);
      const cursosOrdenados = [...r.cursos.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => idDoCurso(n));
      return {
        id: Number(co),
        nome: titulo(inst.nome),
        sigla: inst.sigla.trim(),
        uf: inst.uf,
        cidade: titulo(inst.cidade),
        tipo: tipo[inst.cat] || "particular",
        cursos: [...new Set(cursosOrdenados)],
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt"));

  const saida = { versao: 1, fonte: `INEP, Censo da Educação Superior ${ano}`, cursos: [...nomesCurso.keys()], faculdades };
  const destino = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "conteudo", "faculdades.json");
  fs.writeFileSync(destino, JSON.stringify(saida) + "\n");
  const n = (t) => faculdades.filter((f) => f.tipo === t).length;
  console.log(`conteudo/faculdades.json: ${faculdades.length} faculdades (${n("federal")} federais, ${n("estadual")} estaduais, ${n("particular")} particulares), ${nomesCurso.size} nomes de curso, ${(fs.statSync(destino).size / 1024).toFixed(0)} KB`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  if (!process.argv[2]) {
    console.error("Uso: node ferramentas/monta-faculdades.mjs <pasta dos CSVs do INEP>");
    process.exit(1);
  }
  await principal(process.argv[2]);
}

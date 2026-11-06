// Tutor por regras (estilo MoneBot): responde no próprio aparelho sobre métodos de estudo, a agenda,
// as notas e o conteúdo do banco. Sem IA e sem enviar nada para fora. Devolve markdown (o chat escapa tudo).
import { normalizaNome, topicosCitados, raizesSignificativas } from "./conteudo.js";
import { mediaNotas } from "./curriculo.js";
import { parseData, formataData, contagem, diasAte } from "./datas.js";
import { metaTipo } from "./eventos.js";

const br = (n) => n.toFixed(1).replace(".", ",");

/** Palavras com 5+ letras do texto, cortadas em 6 (pega plural e variações). */
const raizes = (t) => normalizaNome(t).split(" ").filter((p) => p.length >= 5).map((p) => p.slice(0, 6));

/** Tópico do banco citado na pergunta (o que tiver mais palavras em comum). */
export function achaTopico(pergunta, indice) {
  const [melhor] = topicosCitados(pergunta, indice);
  return melhor ? { materia: melhor.materia, topico: melhor.topico } : null;
}

/** Tópico da matéria cujo resumo mais cita as palavras de conteúdo da pergunta (usado com a matéria de contexto). */
export function topicoPeloResumo(pergunta, materia) {
  const rq = raizesSignificativas(pergunta);
  if (!rq.length || !materia) return null;
  let melhor = null;
  let pontos = 0;
  for (const t of materia.topicos || []) {
    const doResumo = new Set(raizesSignificativas(`${t.nome} ${t.resumo} ${t.revisao}`));
    const n = rq.filter((r) => doResumo.has(r)).length;
    if (n > pontos) { pontos = n; melhor = t; }
  }
  return melhor;
}

/** A pergunta tem alguma palavra de conteúdo (não só "explique", "quero saber"...)? */
export const temConteudo = (pergunta) => raizesSignificativas(pergunta).length > 0;

/** Nota que falta na próxima avaliação (pesos iguais, escala 0–10) para chegar ao alvo; null se passar de 10. */
export function notaNecessaria(notas, alvo) {
  const x = alvo * (notas.length + 1) - notas.reduce((s, n) => s + n, 0);
  if (x > 10) return null;
  return Math.max(0, Math.round(x * 10) / 10);
}

/** Matéria da grade citada na pergunta. */
function materiaCitada(q, materias) {
  const rq = new Set(raizes(q));
  return materias.find((m) => raizes(m.name).some((r) => rq.has(r))) || null;
}

const METODOS = {
  pomodoro: (tdah) =>
    `**Pomodoro** é estudar 25 minutos sem interrupção e descansar 5. A cada 4 ciclos, faça uma pausa maior (15 a 30 minutos).\n\n- Antes de começar, escreva **uma** tarefa pequena (ex.: "resolver 5 exercícios de derivada").\n- Celular longe e notificações desligadas durante o foco.\n- Na pausa, levante e beba água — nada de redes sociais.\n\nO Mestriva tem o cronômetro em **Estudar** e no **modo foco**, e cada ciclo vira registro no painel.${
      tdah
        ? `\n\n### Adaptação para TDAH\n- Comece com **15 minutos** de foco e 5 de pausa; aumente aos poucos.\n- Deixe à vista o que você vai fazer naquele ciclo.\n- Use o corpo na pausa (caminhar, alongar) e troque de matéria a cada 2 ciclos se a atenção cair.\n- Barulho branco ou música sem letra ajuda algumas pessoas.`
        : ""
    }`,
  recall: () =>
    `**Recall ativo** é tentar lembrar antes de reler: feche o material e escreva (ou fale) tudo o que sabe sobre o tema. Depois confira e marque o que faltou.\n\n- O esforço de puxar da memória é o que fixa.\n- Reler e grifar dá sensação de domínio, mas rende pouco.\n- O **quiz** do Mestriva e os **cartões** das suas anotações são recall ativo prontos.`,
  espacada: () =>
    `**Repetição espaçada** é revisar em intervalos crescentes — por exemplo, depois de **1, 3, 7 e 15 dias** — em vez de tudo na véspera.\n\n- Cada revisão no momento em que você está quase esquecendo reforça a memória.\n- O quiz do Mestriva já faz isso: as questões que você erra voltam antes, as que acerta demoram mais.`,
  feynman: () =>
    `**Técnica de Feynman**: explicar o conteúdo com palavras simples, como se ensinasse alguém que nunca viu o assunto.\n\n1. Escreva o nome do conceito.\n2. Explique em voz alta ou no papel, sem jargão.\n3. Onde travar ou precisar "decorar", é onde falta base — volte ao material.\n4. Simplifique de novo e use um exemplo.`,
  cornell: () =>
    `**Método Cornell** divide a folha em três partes: anotações da aula (direita), perguntas e palavras-chave (coluna esquerda) e um resumo de 2–3 linhas no rodapé.\n\nNa revisão, cubra a direita e responda as perguntas da esquerda — vira recall ativo.`,
  intercalacao: () =>
    `**Intercalação** é misturar tipos de exercício ou assuntos na mesma sessão (ex.: derivada, integral, limite) em vez de fazer 20 iguais seguidos.\n\nCansa mais, mas ensina a reconhecer **qual** método usar — exatamente o que a prova cobra.`,
  distribuida: () =>
    `**Prática distribuída** é espalhar o estudo em várias sessões curtas ao longo dos dias, em vez de uma maratona.\n\nTrês sessões de 40 minutos em dias diferentes rendem mais que duas horas seguidas na véspera.`,
  autoexplicacao: () =>
    `**Autoexplicação** é parar a cada passo de um exemplo resolvido e se perguntar "por que isso?". Explicar o porquê de cada etapa ajuda a transferir o raciocínio para exercícios novos.`,
};

const VISAO_GERAL = `Os métodos com mais evidência para aprender de verdade:\n\n- **Recall ativo** — testar-se antes de reler.\n- **Repetição espaçada** — revisar em 1, 3, 7 e 15 dias.\n- **Prática distribuída** — várias sessões curtas em vez de uma maratona.\n- **Intercalação** — misturar tipos de exercício.\n- **Feynman e autoexplicação** — explicar com as próprias palavras e perguntar "por quê?".\n- **Pomodoro** — blocos de 25 minutos para manter o foco.\n\nPergunte sobre qualquer um deles que eu explico como aplicar.`;

const AJUDA = `Eu respondo aqui mesmo no seu aparelho, sem enviar nada para fora. Posso:\n\n- explicar **métodos de estudo** (Pomodoro, recall ativo, repetição espaçada, Feynman, Cornell…);\n- montar um **plano para a semana** com base nas suas provas e nas suas horas de estudo;\n- dizer **o que você tem** nos próximos dias;\n- calcular sua **média** e **quanto precisa tirar** para chegar a uma nota;\n- abrir o **resumo de um conteúdo** do banco do Mestriva (ex.: "explique derivadas") e sugerir um quiz.`;

function plano(ctx) {
  const evs = ctx.eventos.filter((e) => { const d = diasAte(e.date, ctx.agora); return d !== null && d >= 0 && d <= 14 && !e.done; }).sort((a, b) => parseData(a.date).getTime() - parseData(b.date).getTime());
  const horas = ctx.perfil?.weekly_hours;
  const linhas = [`Um plano para os próximos dias${horas ? `, pensando nas suas **${horas}** por semana` : ""}:`, ""];
  if (evs.length) {
    linhas.push("**Prioridades (em ordem de data):**");
    for (const e of evs) linhas.push(`- ${metaTipo(e.type).label}: **${e.title}**${e.subject ? ` (${e.subject})` : ""} — ${formataData(e.date, "d MMM")}, ${contagem(e.date, ctx.agora)}`);
    linhas.push("");
  } else linhas.push("Você não tem provas nem entregas marcadas nos próximos 14 dias. Use a semana para revisar o que já viu.", "");
  linhas.push(
    "**Como distribuir:**",
    "- Estude em **blocos de 25 minutos** (Pomodoro), 2 a 4 blocos por dia.",
    "- Comece cada dia pela prova mais próxima e termine com uma revisão rápida de outra matéria (intercalação).",
    "- Na véspera, nada de conteúdo novo: faça um quiz e revise só os erros.",
    "- Reserve um bloco a cada 2 dias para refazer exercícios que você errou."
  );
  return linhas.join("\n");
}

function agenda(ctx) {
  const evs = ctx.eventos.filter((e) => { const d = diasAte(e.date, ctx.agora); return d !== null && d >= 0 && d <= 7 && !e.done; }).sort((a, b) => parseData(a.date).getTime() - parseData(b.date).getTime());
  if (!evs.length) return "Nada marcado nos próximos 7 dias. Quer adicionar uma prova ou entrega no **Calendário**?";
  return ["Nos próximos 7 dias:", "", ...evs.map((e) => `- **${e.title}** — ${metaTipo(e.type).label}${e.subject ? `, ${e.subject}` : ""}, ${formataData(e.date, "d MMM 'às' HH:mm")} (${contagem(e.date, ctx.agora)})`)].join("\n");
}

function notasDa(ctx, materia) {
  return ctx.notas.filter((n) => !materia || n.subject === materia.name);
}

/**
 * @param {string} pergunta
 * @param {{perfil:any, materias:any[], eventos:any[], notas:any[], indice:any, carregadas:Record<string,any>, agora?:Date}} ctx
 * @returns {null | {texto:string, acoes?:{rotulo:string, href:string}[], precisaCarregar?:string}}
 */
export function responde(pergunta, ctx) {
  const bruto = String(pergunta || "").slice(0, 300);
  const q = normalizaNome(bruto);
  if (!q) return null;
  const c = { ...ctx, agora: ctx.agora || new Date() };
  const tem = (re) => re.test(q);

  if (tem(/^(ajuda|me ajuda|socorro)$|\bo que (voce|vc) (sabe|faz|pode)\b|\bcomo (te|voce) (uso|usar|funciona)\b/)) return { texto: AJUDA };
  if (q.length <= 20 && tem(/^(oi|ola|bom dia|boa tarde|boa noite|e ai|opa)\b/)) {
    const nome = c.perfil?.display_name;
    return { texto: `Oi${nome ? `, ${nome}` : ""}! Quer montar um plano para a semana, entender um método de estudo ou revisar um conteúdo?` };
  }
  if (tem(/\b(quanto preciso|preciso tirar|quanto (eu )?tenho que tirar)\b/)) {
    const m = materiaCitada(bruto, c.materias);
    // Lê o alvo do texto original: depois de normalizar, "Cálculo II" viraria "calculo 2" e "6,5" viraria "6 5".
    const alvo = Number((/m[eé]dia\s*(?:de\s*|final\s*)?(\d+(?:[.,]\d+)?)/i.exec(bruto) || [])[1]?.replace(",", ".")) || 6;
    const notas = notasDa(c, m).filter((n) => typeof n.value === "number" && Number(n.max_value) > 0).map((n) => (n.value / n.max_value) * 10);
    if (!notas.length) return { texto: `Ainda não há notas${m ? ` de ${m.name}` : ""} lançadas. Lance em **Notas** e eu calculo.` };
    const x = notaNecessaria(notas, alvo);
    return {
      texto:
        x === null
          ? `Com as notas atuais${m ? ` de ${m.name}` : ""}, não dá para chegar a média ${br(alvo)} em só mais uma avaliação de mesmo peso. Converse com o professor sobre recuperação ou trabalhos extras.`
          : `Para ficar com média **${br(alvo)}**${m ? ` em ${m.name}` : ""}, você precisa tirar **${br(x)}** na próxima avaliação (considerando pesos iguais e escala de 0 a 10).${x === 0 ? " Você já está acima do alvo." : ""}\n\nSe a sua faculdade usa pesos diferentes, a conta muda — confira o plano de ensino.`,
    };
  }
  // Só é a média do estudante com "minha média", "média geral" ou "média em <matéria da grade>"; "o que é média" é conteúdo.
  const mCitada = materiaCitada(bruto, c.materias);
  if (tem(/\b(minha|meu|minhas) medias?\b|\bmedia geral\b/) || (tem(/\bmedia (em|de|no|na)\b/) && mCitada)) {
    const m = mCitada;
    const { media, n } = mediaNotas(notasDa(c, m));
    if (media === null) return { texto: `Ainda não há notas${m ? ` de ${m.name}` : ""} lançadas. Lance em **Notas** e eu calculo.` };
    return { texto: `Sua média${m ? ` em **${m.name}**` : " geral"} é **${br(media)}** (de ${n} ${n === 1 ? "nota" : "notas"}, em escala de 0 a 10).` };
  }
  if (tem(/\b(cronograma|plano de estudos?|organizar (os |meus )?estudos|semana de provas|rotina de estudos?)\b/)) return { texto: plano(c) };
  if (tem(/\b(agenda|essa semana|esta semana|proximos dias|proximas provas|quais (provas|entregas|compromissos)|o que (eu )?tenho (para|pra|nessa|nesta|essa|esta|hoje|amanha))\b/)) return { texto: agenda(c) };

  const tdah = /tdah|deficit de atencao/.test(q) || /tdah|deficit de atencao/.test(normalizaNome(c.perfil?.accessibility_notes || ""));
  if (tem(/\bpomodoro\b/)) return { texto: METODOS.pomodoro(tdah), acoes: [{ rotulo: "Abrir o Pomodoro", href: "/estudar" }] };
  if (tem(/\b(recall|lembrar ativ)/)) return { texto: METODOS.recall() };
  if (tem(/\b(repeticao espacada|espacad|curva do esquecimento)/)) return { texto: METODOS.espacada() };
  if (tem(/\bfeynman\b/)) return { texto: METODOS.feynman() };
  if (tem(/\bcornell\b/)) return { texto: METODOS.cornell() };
  if (tem(/\bintercala/)) return { texto: METODOS.intercalacao() };
  if (tem(/\b(pratica distribuida|distribuida)\b/)) return { texto: METODOS.distribuida() };
  if (tem(/\bautoexplica/)) return { texto: METODOS.autoexplicacao() };
  if (tem(/\b(metodos?|tecnicas?) de estudo|como estudar|estudar melhor|metodos que funcionam/)) return { texto: VISAO_GERAL };

  const achado = achaTopico(bruto, c.indice);
  if (achado) {
    const materia = c.carregadas?.[achado.materia];
    if (!materia) return { texto: "", precisaCarregar: achado.materia };
    const t = materia.topicos.find((x) => x.id === achado.topico);
    if (t) return respostaDoTopico(materia, t);
  }
  return null;
}

/** Resposta com o resumo de um tópico do banco e os atalhos para o quiz e o material. */
export function respostaDoTopico(materia, t) {
  return {
    texto: `### ${t.nome} · ${materia.nome}\n\n${t.resumo}\n\n**Para revisar:** ${t.revisao}`,
    acoes: [
      { rotulo: "Fazer quiz deste conteúdo", href: `/quiz?subject=${encodeURIComponent(`banco:${materia.id}`)}&topic=${encodeURIComponent(t.nome)}` },
      { rotulo: "Ver o material da matéria", href: "/estudar" },
    ],
  };
}

export const SUGESTOES = [
  "Como montar um cronograma para a semana de provas?",
  "Me explique os métodos de estudo que realmente funcionam",
  "Como adaptar o Pomodoro para quem tem TDAH?",
  "Explique derivadas",
  "O que tenho essa semana?",
  "Quanto preciso tirar para ficar com média 7?",
];

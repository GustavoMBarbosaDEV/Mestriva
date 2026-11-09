// Normalizadores: completam campos ausentes, cortam textos, descartam o que não faz parte do formato.
// É isso que permite ler dado antigo, backup importado e dado de outro aparelho sem quebrar.
// Campos de cada entidade (perfil, matéria, evento, nota, material, cartão, quiz).
import { uid } from "./util.js";

/** @param {unknown} v @param {number} max */
const txt = (v, max) => (typeof v === "string" || typeof v === "number" ? String(v).trim().slice(0, max) : "");
/** @param {unknown} v @param {string[]} opcoes */
const um = (v, opcoes) => (opcoes.includes(/** @type {string} */ (v)) ? /** @type {string} */ (v) : opcoes[0]);
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
/** @param {unknown} v */
const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
/** @param {unknown} v @param {number} min @param {number} max */
const inteiro = (v, min, max) => Math.min(max, Math.max(min, Math.trunc(num(v) ?? 0)));
/** @param {unknown} v @param {number} qtd @param {number} max */
const textos = (v, qtd, max) => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, qtd).map((x) => x.trim().slice(0, max)) : []);
/** @param {unknown} v */
const iso = (v) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : "");
/** @param {unknown} v @param {RegExp} re */
const formato = (v, re) => (typeof v === "string" && re.test(v) ? v : "");

const DATA_HORA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d$/;
const DATA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const COR = /^#[0-9a-fA-F]{6}$/;

const base = (d) => ({ id: txt(d.id, 40) || uid(), criado_em: iso(d.criado_em), atualizado_em: iso(d.atualizado_em) });

/** O que a pessoa estuda (o primeiro é o padrão de quem veio antes da escolha existir). */
export const PUBLICOS = ["faculdade", "ensino_medio", "cursinho", "mestrado", "doutorado", "concurso", "enem", "medicina"];

export function normPerfil(v) {
  const d = obj(v);
  const t = obj(d.termos);
  return {
    display_name: txt(d.display_name, 80),
    publico: um(d.publico, PUBLICOS),
    institution: txt(d.institution, 120),
    course: txt(d.course, 120),
    ies: Number.isInteger(num(d.ies)) && num(d.ies) > 0 ? num(d.ies) : null,
    period: txt(d.period, 20),
    weekly_hours: txt(d.weekly_hours, 20),
    goal: txt(d.goal, 300),
    methods_used: textos(d.methods_used, 12, 60),
    accommodations: textos(d.accommodations, 12, 60),
    accessibility_notes: txt(d.accessibility_notes, 600),
    onboarding_completed: d.onboarding_completed === true,
    termos: d.termos && txt(t.v, 20) ? { v: txt(t.v, 20), em: iso(t.em) } : null,
  };
}

export function normMateria(v) {
  const d = obj(v);
  return {
    ...base(d),
    name: txt(d.name, 120),
    period: txt(d.period, 20),
    professor: txt(d.professor, 120),
    status: um(d.status, ["cursando", "concluida"]),
    order: num(d.order) ?? 0,
    topics: txt(d.topics, 2000),
    color: formato(d.color, COR),
    banco: txt(d.banco, 60),
  };
}

export function normEvento(v) {
  const d = obj(v);
  return {
    ...base(d),
    title: txt(d.title, 160),
    type: um(d.type, ["outro", "prova", "trabalho", "apresentacao", "palestra"]),
    date: formato(d.date, DATA_HORA),
    subject: txt(d.subject, 120),
    notes: txt(d.notes, 2000),
    done: d.done === true,
  };
}

export function normNota(v) {
  const d = obj(v);
  return {
    ...base(d),
    subject: txt(d.subject, 120),
    activity: txt(d.activity, 160),
    value: num(d.value),
    max_value: num(d.max_value),
    wrong_topics: txt(d.wrong_topics, 2000),
    notes: txt(d.notes, 2000),
    date: formato(d.date, DATA),
  };
}

export function normSessao(v) {
  const d = obj(v);
  return { ...base(d), subject: txt(d.subject, 120), method: um(d.method, ["livre", "pomodoro"]), minutes: inteiro(d.minutes, 0, 600) };
}

function normQuestao(v) {
  const d = obj(v);
  const options = Array.isArray(d.options) ? d.options.slice(0, 5).map((o) => txt(o, 400)) : [];
  if (options.length < 2 || !txt(d.question, 600)) return null;
  return {
    question: txt(d.question, 600),
    options,
    answer_index: inteiro(d.answer_index, 0, options.length - 1),
    explanation: txt(d.explanation, 800),
    origem: um(d.origem, ["estudante", "banco"]),
    ref: txt(d.ref, 80),
  };
}

export function normQuiz(v) {
  const d = obj(v);
  return {
    ...base(d),
    title: txt(d.title, 160),
    subject: txt(d.subject, 120),
    topic: txt(d.topic, 200),
    questions: (Array.isArray(d.questions) ? d.questions : []).map(normQuestao).filter(Boolean).slice(0, 50),
    last_score: num(d.last_score),
    last_total: num(d.last_total),
  };
}

export function normTentativa(v) {
  const d = obj(v);
  return {
    ...base(d),
    quiz_title: txt(d.quiz_title, 160),
    subject: txt(d.subject, 120),
    score: inteiro(d.score, 0, 1000),
    total: inteiro(d.total, 0, 1000),
    wrong_topics: textos(d.wrong_topics, 30, 200),
  };
}

export function normMaterial(v) {
  const d = obj(v);
  return {
    ...base(d),
    title: txt(d.title, 160),
    subject: txt(d.subject, 120),
    topic: txt(d.topic, 200),
    kind: um(d.kind, ["resumo", "guia", "mapa", "revisao", "aula"]),
    content: txt(d.content, 60000),
    // Material da aula (PDF ou foto do quadro): o texto lido, organizado, de onde saem os cartões.
    fonte: txt(d.fonte, 32000),
  };
}

export function normCartao(v) {
  const d = obj(v);
  return { ...base(d), subject: txt(d.subject, 120), tipo: um(d.tipo, ["pergunta", "lacuna"]), frente: txt(d.frente, 600), verso: txt(d.verso, 2000) };
}

/** @typedef {"materias"|"eventos"|"notas"|"sessoes"|"quizzes"|"tentativas"|"materiais"|"cartoes"} Colecao */
export const COLECOES = /** @type {Colecao[]} */ (["materias", "eventos", "notas", "sessoes", "quizzes", "tentativas", "materiais", "cartoes"]);

/** @type {Record<Colecao, (v: unknown) => any>} */
export const NORM = {
  materias: normMateria,
  eventos: normEvento,
  notas: normNota,
  sessoes: normSessao,
  quizzes: normQuiz,
  tentativas: normTentativa,
  materiais: normMaterial,
  cartoes: normCartao,
};

function normErros(v) {
  /** @type {Record<string, {a:number, e:number, prox:string}>} */
  const saida = {};
  for (const [k, item] of Object.entries(obj(v)).slice(0, 5000)) {
    if (!item || typeof item !== "object") continue;
    saida[txt(k, 80)] = { a: inteiro(item.a, 0, 1e6), e: inteiro(item.e, 0, 1e6), prox: iso(item.prox) };
  }
  return saida;
}

export function normDados(v) {
  const d = obj(v);
  /** @type {any} */
  const saida = { versao: 1, perfil: normPerfil(d.perfil) };
  for (const c of COLECOES) {
    const lista = Array.isArray(d[c]) ? d[c] : [];
    saida[c] = lista.filter((x) => x && typeof x === "object" && !Array.isArray(x)).map(NORM[c]);
  }
  saida.erros = normErros(d.erros);
  return saida;
}

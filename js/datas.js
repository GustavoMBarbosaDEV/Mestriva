// Datas em pt-BR nos formatos usados pelo app.

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
export const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export { MESES };

const dois = (n) => String(n).padStart(2, "0");

/** @param {unknown} v @returns {Date|null} */
export function parseData(v) {
  if (!v) return null;
  const d = v instanceof Date ? new Date(v.getTime()) : new Date(/** @type {any} */ (v));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formata como o date-fns. Padrões usados no app: "d MMM · HH:mm", "d MMM", "HH:mm", "dd/MM", "MMMM yyyy", "EEEE, d 'de' MMMM". */
export function formataData(v, padrao = "d MMM · HH:mm") {
  const d = parseData(v);
  if (!d) return "—";
  const partes = padrao.split(/('[^']*')/);
  return partes
    .map((p) => {
      if (p.startsWith("'")) return p.slice(1, -1);
      return p.replace(/EEEE|MMMM|MMM|yyyy|dd|d|MM|HH|mm/g, (t) => {
        switch (t) {
          case "EEEE": return DIAS[d.getDay()];
          case "MMMM": return MESES[d.getMonth()];
          case "MMM": return MESES_CURTOS[d.getMonth()];
          case "yyyy": return String(d.getFullYear());
          case "dd": return dois(d.getDate());
          case "d": return String(d.getDate());
          case "MM": return dois(d.getMonth() + 1);
          case "HH": return dois(d.getHours());
          case "mm": return dois(d.getMinutes());
          default: return t;
        }
      });
    })
    .join("");
}

/** Dias de calendário (local) até a data; negativo se já passou. */
export function diasAte(v, agora = new Date()) {
  const alvo = parseData(v);
  if (!alvo) return null;
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const fim = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
  return Math.round((fim.getTime() - inicio.getTime()) / 86400000);
}

export function contagem(v, agora = new Date()) {
  const dias = diasAte(v, agora);
  if (dias === null) return "";
  if (dias < 0) return "já aconteceu";
  if (dias === 0) return "hoje";
  if (dias === 1) return "amanhã";
  return `em ${dias} dias`;
}

export const hojeISO = (agora = new Date()) => `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`;

/** @param {Date} d */
export const paraInputDataHora = (d) => `${hojeISO(d)}T${dois(d.getHours())}:${dois(d.getMinutes())}`;

/** Mesmo dia do calendário. @param {Date} a @param {Date} b */
export const mesmoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Chave AAAA-MM-DD de um dia local. @param {Date} d */
export const chaveDia = (d) => hojeISO(d);

/** Dias da grade do mês (de domingo a sábado, semanas inteiras). */
export function diasDoMes(ano, mes) {
  const primeiro = new Date(ano, mes, 1);
  const ultimo = new Date(ano, mes + 1, 0);
  const inicio = new Date(ano, mes, 1 - primeiro.getDay());
  const fim = new Date(ano, mes, ultimo.getDate() + (6 - ultimo.getDay()));
  const dias = [];
  for (let d = new Date(inicio); d <= fim; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) dias.push(d);
  return dias;
}

// Tipos de evento e lembretes.
import { parseData, diasAte } from "./datas.js";

export const TIPOS_EVENTO = [
  { value: "prova", label: "Prova", chip: "bg-[#FFEDED] text-[#B42318]", dot: "#F04438" },
  { value: "trabalho", label: "Trabalho", chip: "bg-[#EEF2FF] text-[#3B5BFF]", dot: "#3B5BFF" },
  { value: "apresentacao", label: "Apresentação", chip: "bg-[#FFF7E6] text-[#B54708]", dot: "#F79009" },
  { value: "palestra", label: "Palestra", chip: "bg-[#EFFBF3] text-[#027A48]", dot: "#12B76A" },
  { value: "outro", label: "Outro", chip: "bg-secondary text-foreground/70", dot: "#98A2B3" },
];

/** @param {string} v */
export const metaTipo = (v) => TIPOS_EVENTO.find((t) => t.value === v) || TIPOS_EVENTO[4];

/** Eventos não feitos de hoje até `dias` dias, em ordem de data. */
export function proximos(eventos, agora = new Date(), dias = 7) {
  return eventos
    .filter((e) => {
      if (e.done) return false;
      const n = diasAte(e.date, agora);
      return n !== null && n >= 0 && n <= dias;
    })
    .sort((a, b) => parseData(a.date).getTime() - parseData(b.date).getTime());
}

/** Eventos futuros (inclui hoje), em ordem. */
export function futuros(eventos, agora = new Date()) {
  return proximos(eventos, agora, 100000);
}

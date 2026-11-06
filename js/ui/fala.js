// Ouvir (leitura em voz alta) e ditar por voz.
import { cn } from "../util.js";
import { icone } from "../icones.js";

/** Texto limpo do markdown para ler em voz alta. */
export function textoParaFala(t = "") {
  return String(t)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#*_>`|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function botaoOuvir(falando, rotulo = "Ouvir") {
  return `<button type="button" data-acao="ouvir" aria-pressed="${falando}" class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground/75 transition hover:border-electric/50 hover:text-foreground">${icone(falando ? "Square" : "Volume2", "h-3.5 w-3.5")}${falando ? "Parar leitura" : rotulo}</button>`;
}

export function botaoDitar(ouvindo, suportado) {
  if (!suportado)
    return `<button type="button" disabled title="Seu navegador não suporta ditado por voz" class="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground opacity-40" aria-label="Ditado por voz indisponível">${icone("Mic")}</button>`;
  return `<button type="button" data-acao="ditar" aria-pressed="${ouvindo}" aria-label="${ouvindo ? "Parar ditado" : "Ditar por voz"}" title="${ouvindo ? "Parar ditado" : "Ditar por voz (português)"}" class="${cn(
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition",
    ouvindo ? "animate-pulse border-destructive/50 bg-destructive/10 text-destructive" : "border-border bg-card text-foreground/70 hover:border-electric/50 hover:text-foreground"
  )}">${icone(ouvindo ? "Square" : "Mic")}<span class="sr-only">Ditar</span></button>`;
}

export const temDitado = () => typeof window !== "undefined" && Boolean(window.SpeechRecognition || /** @type {any} */ (window).webkitSpeechRecognition);

/** Lê o texto em voz alta; devolve uma função que para. @param {string} texto @param {() => void} aoTerminar */
export function fala(texto, aoTerminar) {
  if (!("speechSynthesis" in window)) { aoTerminar(); return () => {}; }
  const u = new SpeechSynthesisUtterance(textoParaFala(texto).slice(0, 12000));
  u.lang = "pt-BR";
  u.onend = aoTerminar;
  u.onerror = aoTerminar;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  return () => speechSynthesis.cancel();
}

/** Escuta uma frase em pt-BR. @param {(t: string) => void} aoOuvir @param {() => void} aoTerminar */
export function dita(aoOuvir, aoTerminar) {
  const R = window.SpeechRecognition || /** @type {any} */ (window).webkitSpeechRecognition;
  if (!R) { aoTerminar(); return () => {}; }
  const r = new R();
  r.lang = "pt-BR";
  r.continuous = false;
  r.interimResults = false;
  r.onresult = (ev) => {
    const t = Array.from(ev.results).map((x) => x[0]?.transcript || "").join(" ").trim();
    if (t) aoOuvir(t);
  };
  r.onend = aoTerminar;
  r.onerror = aoTerminar;
  try { r.start(); } catch { aoTerminar(); }
  return () => { try { r.stop(); } catch { /* já parou */ } };
}

// Utilidades sem dependência do navegador no momento do import.

const ENTIDADES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapa texto para entrar em HTML (conteúdo ou atributo). */
export function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[&<>"']/g, (c) => ENTIDADES[c]);
}

/** Junta classes, ignorando o que for falso. @param {...(string|false|null|undefined)} partes */
export function cn(...partes) {
  return partes.filter(Boolean).join(" ");
}

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Identificador aleatório de 20 caracteres. */
export function uid() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += ALFABETO[b % ALFABETO.length];
  return s;
}

/** Iniciais do nome (ou do e-mail). */
export function iniciais(nome = "", email = "") {
  const fonte = nome || email || "M";
  return fonte
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

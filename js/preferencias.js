// Tema e acessibilidade, salvos no aparelho.
// O pre.js repete esta lógica em poucas linhas para aplicar antes do primeiro desenho.

export const CHAVE_TEMA = "mestriva.theme";
export const CHAVE_A11Y = "mestriva.accessibility";
export const PADRAO_A11Y = Object.freeze({
  textScale: 100,
  highContrast: false,
  dyslexia: false,
  reduceMotion: false,
  spacious: false,
  colorVision: "none",
});
export const FILTROS_COR = ["none", "protanopia", "deuteranopia", "tritanopia"];
const LIGA = ["highContrast", "dyslexia", "reduceMotion", "spacious"];

/** @typedef {{textScale:number, highContrast:boolean, dyslexia:boolean, reduceMotion:boolean, spacious:boolean, colorVision:string}} A11y */
/** @typedef {{tema:"light"|"dark", a11y:A11y}} Prefs */

/** @param {any} v @returns {A11y} */
export function normA11y(v) {
  const d = v && typeof v === "object" ? v : {};
  const escala = Number(d.textScale);
  /** @type {any} */
  const a = { ...PADRAO_A11Y };
  a.textScale = Number.isFinite(escala) && d.textScale !== null && d.textScale !== "" ? Math.min(145, Math.max(85, Math.round(escala / 5) * 5)) : 100;
  for (const k of LIGA) a[k] = d[k] === true;
  a.colorVision = FILTROS_COR.includes(d.colorVision) ? d.colorVision : "none";
  return a;
}

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

/** @returns {Prefs} */
export function lePrefs(arm = armazenamentoPadrao()) {
  let tema = "light";
  let a11y = {};
  try {
    tema = arm && arm.getItem(CHAVE_TEMA) === "dark" ? "dark" : "light";
    a11y = JSON.parse((arm && arm.getItem(CHAVE_A11Y)) || "{}");
  } catch {
    /* cai no padrão */
  }
  return { tema: /** @type {"light"|"dark"} */ (tema), a11y: normA11y(a11y) };
}

/** @param {Prefs} prefs */
export function gravaPrefs(prefs, arm = armazenamentoPadrao()) {
  try {
    arm.setItem(CHAVE_TEMA, prefs.tema);
    arm.setItem(CHAVE_A11Y, JSON.stringify(prefs.a11y));
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

/** @param {Prefs} prefs @param {{classList: {toggle: Function}, style: any}} raiz */
export function aplicaPrefs(prefs, raiz) {
  const a = prefs.a11y;
  const escuro = prefs.tema === "dark";
  raiz.classList.toggle("dark", escuro);
  raiz.style.colorScheme = escuro ? "dark" : "light";
  raiz.style.fontSize = a.textScale + "%";
  raiz.classList.toggle("a11y-contrast", a.highContrast);
  raiz.classList.toggle("a11y-dyslexia", a.dyslexia);
  raiz.classList.toggle("a11y-spacious", a.spacious);
  raiz.classList.toggle("a11y-motion", a.reduceMotion);
  for (const f of FILTROS_COR.slice(1)) raiz.classList.toggle("cvd-" + f, a.colorVision === f);
}

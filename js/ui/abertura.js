// Animação de abertura (padrão do Monetra): o "M" se desenha, o ponto aparece e o nome entra.
// O desenho fica em index.html e boot.css (funciona antes do style.css); aqui só decide quando tirar.

/** Tempo mínimo na tela para a animação terminar (o traço, o ponto e o nome). */
export const ABERTURA_MIN_MS = 1150;

/** Quanto falta esperar antes de tirar a abertura. @param {number} decorrido ms desde o início da página @param {boolean} calmo sem animação */
export function atrasoAbertura(decorrido, calmo) {
  return calmo ? 0 : Math.max(0, ABERTURA_MIN_MS - decorrido);
}

/** Tira a abertura com um esmaecer curto, depois que a primeira tela foi desenhada. */
export function tiraAbertura() {
  const el = document.getElementById("abertura");
  if (!el) return;
  const raiz = document.documentElement;
  const calmo = raiz.classList.contains("a11y-motion") || !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  setTimeout(() => {
    el.classList.add("sai");
    setTimeout(() => el.remove(), calmo ? 0 : 400);
  }, atrasoAbertura(performance.now(), calmo));
}

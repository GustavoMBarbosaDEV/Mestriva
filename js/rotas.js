// Rotas e regras de acesso (precisa entrar; perfil incompleto vai para o onboarding).

/** @typedef {{caminho:string, pagina:string, tipo:"publica"|"protegida"|"onboarding", titulo:string}} Rota */

/** @type {Rota[]} */
export const ROTAS = [
  { caminho: "/bem-vindo", pagina: "landing", tipo: "publica", titulo: "Mestriva — estudo com método" },
  { caminho: "/login", pagina: "login", tipo: "publica", titulo: "Entrar" },
  { caminho: "/register", pagina: "register", tipo: "publica", titulo: "Criar conta" },
  { caminho: "/forgot-password", pagina: "forgot-password", tipo: "publica", titulo: "Esqueci a senha" },
  { caminho: "/reset-password", pagina: "reset-password", tipo: "publica", titulo: "Nova senha" },
  { caminho: "/onboarding", pagina: "onboarding", tipo: "onboarding", titulo: "Boas-vindas" },
  { caminho: "/", pagina: "dashboard", tipo: "protegida", titulo: "Hoje" },
  { caminho: "/calendario", pagina: "calendar", tipo: "protegida", titulo: "Calendário" },
  { caminho: "/grade", pagina: "curriculum", tipo: "protegida", titulo: "Grade curricular" },
  { caminho: "/estudar", pagina: "study", tipo: "protegida", titulo: "Estudar" },
  { caminho: "/quiz", pagina: "quiz", tipo: "protegida", titulo: "Quiz" },
  { caminho: "/notas", pagina: "grades", tipo: "protegida", titulo: "Notas" },
  { caminho: "/tutor", pagina: "tutor", tipo: "protegida", titulo: "Tutor" },
  { caminho: "/ajustes", pagina: "settings", tipo: "protegida", titulo: "Ajustes" },
];

/** Só o caminho, sem consulta, âncora e barra final. @param {string} caminho */
export function limpaCaminho(caminho) {
  const so = String(caminho || "/").split(/[?#]/)[0] || "/";
  return so.length > 1 ? so.replace(/\/+$/, "") || "/" : "/";
}

/**
 * @param {string} caminho
 * @param {{logado:boolean, perfilCompleto:boolean}} estado
 * @returns {{pagina:string, redireciona?:string, rota?:Rota}}
 */
export function resolve(caminho, { logado, perfilCompleto }) {
  const c = limpaCaminho(caminho);
  const rota = ROTAS.find((r) => r.caminho === c);
  if (!rota) return { pagina: "nao-encontrada" };
  if (rota.tipo !== "publica" && !logado) {
    return { pagina: rota.pagina, rota, redireciona: c === "/" ? "/bem-vindo" : "/login?volta=" + encodeURIComponent(c) };
  }
  if (rota.tipo === "protegida" && !perfilCompleto) return { pagina: rota.pagina, rota, redireciona: "/onboarding" };
  if (rota.tipo === "onboarding" && perfilCompleto) return { pagina: rota.pagina, rota, redireciona: "/" };
  if ((c === "/login" || c === "/register") && logado) return { pagina: rota.pagina, rota, redireciona: "/" };
  return { pagina: rota.pagina, rota };
}

/** Destino de volta depois do login: só caminhos internos. @param {string|null|undefined} v */
export function voltaSegura(v) {
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : "/";
}

/** @param {string} caminho @param {{substitui?: boolean}} [opcoes] */
export function navega(caminho, { substitui = false } = {}) {
  if (substitui) history.replaceState(null, "", caminho);
  else history.pushState(null, "", caminho);
  window.dispatchEvent(new Event("mestriva:rota"));
}

/** Liga o voltar do navegador e os links internos. @param {(caminho: string) => void} aoMudar */
export function ligaNavegacao(aoMudar) {
  const atual = () => aoMudar(location.pathname + location.search);
  window.addEventListener("popstate", atual);
  window.addEventListener("mestriva:rota", atual);
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = /** @type {HTMLElement} */ (e.target).closest?.("a[href]");
    if (!(a instanceof HTMLAnchorElement)) return;
    const href = a.getAttribute("href") || "";
    if (!href.startsWith("/") || href.startsWith("//") || a.target || a.hasAttribute("download") || a.dataset.externo !== undefined) return;
    e.preventDefault();
    if (href !== location.pathname + location.search) navega(href);
  });
}

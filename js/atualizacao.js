// Registro do service worker e cartão "Nova versão pronta" (padrão do Monetra).

const ADIAR_MS = 30 * 60 * 1000;
const CARTAO =
  "panel fixed inset-x-4 bottom-24 z-[60] mx-auto flex max-w-md items-center gap-3 p-4 animate-in fade-in-0 slide-in-from-bottom-4 lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0";
const BOTAO = "rounded-xl px-3 py-2 text-sm font-medium transition";

/** Versão do sw.js em espera, lida do próprio arquivo. @param {ServiceWorker} w */
async function versaoDe(w) {
  try {
    const t = await (await fetch(w.scriptURL, { cache: "no-store" })).text();
    return /const V = "([0-9.]+)"/.exec(t)?.[1] || "";
  } catch {
    return "";
  }
}

/** @param {{anuncia: (t: string) => void}} p */
export function ligaAtualizacao({ anuncia }) {
  if (!("serviceWorker" in navigator)) return;
  if (location.hostname === "localhost" && new URLSearchParams(location.search).has("semsw")) return;

  let adiadoAte = 0;
  let recarregando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (recarregando) return;
    recarregando = true;
    location.reload();
  });

  /** @param {ServiceWorker} w */
  async function mostra(w) {
    if (Date.now() < adiadoAte || document.getElementById("nova-versao")) return;
    const v = await versaoDe(w);
    const el = document.createElement("div");
    el.id = "nova-versao";
    el.setAttribute("role", "status");
    el.className = CARTAO;
    el.innerHTML = `<span class="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink font-heading text-lg font-bold text-neon">M<span class="pulse-dot absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-electric"></span></span>
      <span class="min-w-0 flex-1"><span class="block text-sm font-semibold">Nova versão pronta</span><span class="block font-mono text-[11px] text-muted-foreground" data-versao></span>
      <span class="mt-2 block h-1 overflow-hidden rounded-full bg-secondary" hidden data-barra><span class="block h-full w-1/3 animate-pulse rounded-full bg-electric"></span></span></span>
      <span class="flex shrink-0 gap-1.5"><button type="button" data-atualizar class="${BOTAO} bg-ink text-white hover:bg-ink/90">Atualizar</button><button type="button" data-depois class="${BOTAO} text-muted-foreground hover:bg-secondary hover:text-foreground">Depois</button></span>`;
    /** @type {HTMLElement} */ (el.querySelector("[data-versao]")).textContent = v ? "Versão " + v : "";
    const fecha = () => {
      el.remove();
      document.removeEventListener("keydown", tecla);
    };
    const tecla = (/** @type {KeyboardEvent} */ e) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) {
        adiadoAte = Date.now() + ADIAR_MS;
        fecha();
      }
    };
    el.addEventListener("click", (e) => {
      const alvo = /** @type {HTMLElement} */ (e.target);
      if (alvo.closest("[data-depois]")) {
        adiadoAte = Date.now() + ADIAR_MS;
        fecha();
      } else if (alvo.closest("[data-atualizar]")) {
        /** @type {HTMLElement} */ (el.querySelector("[data-barra]")).hidden = false;
        w.postMessage({ tipo: "atualizar" });
        setTimeout(() => location.reload(), 5000);
      }
    });
    document.addEventListener("keydown", tecla);
    document.body.appendChild(el);
    anuncia("Nova versão do Mestriva pronta para atualizar");
  }

  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      const confere = () => {
        if (reg.waiting && navigator.serviceWorker.controller) mostra(reg.waiting);
      };
      confere();
      reg.addEventListener("updatefound", () => {
        const novo = reg.installing;
        novo?.addEventListener("statechange", () => {
          if (novo.state === "installed") confere();
        });
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") reg.update().then(confere).catch(() => null);
      });
      setInterval(() => reg.update().catch(() => null), 60 * 60 * 1000);
    })
    .catch(() => null);
}

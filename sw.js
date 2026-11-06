// Service worker do Mestriva: cache por versão, navegação com prazo e arquivos do cache com atualização em segundo plano.
// Baseado no modelo do Monetra. Toda mudança publicada sobe a versão (ferramentas/bump.mjs).
const V = "0.1.0";
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
const CACHE = "mestriva-" + V;
// Arquivos guardados na instalação. Todo arquivo de js/ precisa estar aqui (testes/pwa.test.mjs confere).
const SHELL = [
  "./", "index.html", "style.css", "boot.css", "pre.js", "firebase-config.js", "manifest.webmanifest",
  "js/app.js", "js/versao.js", "js/util.js", "js/icones.js", "js/normaliza.js", "js/loja.js", "js/preferencias.js", "js/rotas.js",
  "js/atualizacao.js", "js/ui/dialogo.js", "js/ui/controles.js", "js/ui/acessibilidade.js", "js/ui/casca.js",
  "js/datas.js", "js/eventos.js", "js/curriculo.js", "js/markdown.js", "js/ui/formulario.js", "js/ui/pagina.js", "js/ui/cabecalho.js", "js/ui/dialogo-evento.js",
  "js/paginas/provisoria.js", "js/paginas/nao-encontrada.js", "js/paginas/onboarding.js", "js/paginas/calendario.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon.svg",
  "fonts/space-grotesk-5.1.1/space-grotesk-latin-400-normal.woff2", "fonts/space-grotesk-5.1.1/space-grotesk-latin-500-normal.woff2",
  "fonts/space-grotesk-5.1.1/space-grotesk-latin-600-normal.woff2", "fonts/space-grotesk-5.1.1/space-grotesk-latin-700-normal.woff2",
  "fonts/inter-5.1.1/inter-latin-300-normal.woff2", "fonts/inter-5.1.1/inter-latin-400-normal.woff2",
  "fonts/inter-5.1.1/inter-latin-500-normal.woff2", "fonts/inter-5.1.1/inter-latin-600-normal.woff2",
  "fonts/jetbrains-mono-5.1.1/jetbrains-mono-latin-400-normal.woff2", "fonts/jetbrains-mono-5.1.1/jetbrains-mono-latin-500-normal.woff2",
  "fonts/atkinson-hyperlegible-5.1.1/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-5.1.1/atkinson-hyperlegible-latin-700-normal.woff2",
];
// Estes vão com ?v= no index.html, então são guardados com o mesmo endereço.
const COM_VERSAO = ["style.css", "boot.css", "pre.js", "js/app.js"];
const ESPERA_NAVEGACAO = 3000;
const FORA = /^\/(__|baixar)(\/|$)/;

self.addEventListener("install", (e) => {
  const lista = SHELL.map((f) => (COM_VERSAO.includes(f) ? f + "?v=" + V : f));
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(lista.map((u) => c.add(new Request(u, { cache: "reload" })).catch(() => null)))).catch(() => null)
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("mestriva-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => sw.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  const fonte = /** @type {Client|null} */ (/** @type {unknown} */ (e.source));
  const origem = fonte && "url" in fonte ? new URL(fonte.url).origin : e.origin;
  if (origem !== location.origin) return;
  if (e.data && e.data.tipo === "atualizar") sw.skipWaiting();
});

const guardavel = (r) => r && r.ok && r.status === 200 && r.type === "basic";
const guarda = (chave, r) => {
  if (guardavel(r)) {
    const copia = r.clone();
    caches.open(CACHE).then((c) => c.put(chave, copia)).catch(() => null);
  }
  return r;
};

// Navegação (qualquer endereço interno): tenta a rede por até 3 s; sem resposta, usa o index guardado.
function navegacao(e) {
  const rede = fetch(e.request).then((r) => (r.ok ? guarda("./", r) : r));
  e.waitUntil(rede.catch(() => null));
  const prazo = new Promise((ok) => setTimeout(ok, ESPERA_NAVEGACAO));
  return Promise.race([rede.catch(() => null), prazo.then(() => null)]).then(
    (r) => r || caches.match("./").catch(() => null).then((c) => c || rede)
  );
}

// Arquivos: do cache na hora, atualizando em segundo plano.
function arquivo(e) {
  const rede = fetch(e.request).then((r) => guarda(e.request, r));
  e.waitUntil(rede.catch(() => null));
  return caches.open(CACHE).then((c) => c.match(e.request)).catch(() => null).then((g) => g || rede);
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || FORA.test(url.pathname)) return;
  if (e.request.mode === "navigate") {
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith("/index.html")) return;
    e.respondWith(navegacao(e));
    return;
  }
  e.respondWith(arquivo(e));
});

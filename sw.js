// Service worker do Mestriva: cache por versão, navegação com prazo e arquivos do cache com atualização em segundo plano.
// Baseado no modelo do Monetra. Toda mudança publicada sobe a versão (ferramentas/bump.mjs).
const V = "0.6.0";
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
const CACHE = "mestriva-" + V;
// Arquivos guardados na instalação. Todo arquivo de js/ precisa estar aqui (testes/pwa.test.mjs confere).
const SHELL = [
  "./", "index.html", "style.css", "boot.css", "pre.js", "firebase-config.js", "manifest.webmanifest", "conteudo/indice.json",
  "js/app.js", "js/versao.js", "js/util.js", "js/icones.js", "js/normaliza.js", "js/loja.js", "js/preferencias.js", "js/rotas.js",
  "js/atualizacao.js", "js/ui/dialogo.js", "js/ui/controles.js", "js/ui/acessibilidade.js", "js/ui/casca.js",
  "js/datas.js", "js/eventos.js", "js/curriculo.js", "js/markdown.js", "js/ui/formulario.js", "js/ui/pagina.js", "js/ui/cabecalho.js", "js/ui/dialogo-evento.js", "js/ui/vazio.js", "js/ui/dialogo-materia.js", "js/ui/pomodoro.js", "js/ui/fala.js", "js/ui/leitor.js", "js/ui/foco.js", "js/ui/sino.js", "js/ui/novidades.js", "js/ui/marca.js", "js/ui/abertura.js", "js/conteudo.js", "js/faculdades.js", "js/gerador.js", "js/banco.js", "js/tutor.js", "js/importar.js", "js/aula.js", "js/ui/dialogo-aula.js", "js/backup.js", "js/nuvem.js", "js/loja-nuvem.js",
  "js/paginas/provisoria.js", "js/paginas/nao-encontrada.js", "js/paginas/onboarding.js", "js/paginas/calendario.js", "js/paginas/grade.js", "js/paginas/notas.js", "js/paginas/estudar.js", "js/paginas/hoje.js", "js/paginas/ajustes.js", "js/paginas/quiz.js", "js/paginas/tutor.js", "js/paginas/landing.js", "js/paginas/login.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png", "icons/favicon.svg",
  "fonts/space-grotesk-5.3.0/space-grotesk-latin-400-normal.woff2", "fonts/space-grotesk-5.3.0/space-grotesk-latin-500-normal.woff2",
  "fonts/space-grotesk-5.3.0/space-grotesk-latin-600-normal.woff2", "fonts/space-grotesk-5.3.0/space-grotesk-latin-700-normal.woff2",
  "fonts/inter-5.3.0/inter-latin-300-normal.woff2", "fonts/inter-5.3.0/inter-latin-400-normal.woff2",
  "fonts/inter-5.3.0/inter-latin-500-normal.woff2", "fonts/inter-5.3.0/inter-latin-600-normal.woff2",
  "fonts/jetbrains-mono-5.3.0/jetbrains-mono-latin-400-normal.woff2", "fonts/jetbrains-mono-5.3.0/jetbrains-mono-latin-500-normal.woff2",
  "fonts/atkinson-hyperlegible-5.3.0/atkinson-hyperlegible-latin-400-normal.woff2", "fonts/atkinson-hyperlegible-5.3.0/atkinson-hyperlegible-latin-700-normal.woff2",
];
// Estes vão com ?v= no index.html, então são guardados com o mesmo endereço.
const COM_VERSAO = ["style.css", "boot.css", "pre.js", "js/app.js"];
const ESPERA_NAVEGACAO = 3000;
const FORA = /^\/(__|baixar)(\/|$)/;
// Páginas soltas do site: vão direto à rede (senão o cache do app ficaria com a página no lugar do app).
const PAGINAS_SOLTAS = /^\/(privacidade|termos|faq)(\.html)?$/;

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
    if (PAGINAS_SOLTAS.test(url.pathname)) return;
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !url.pathname.endsWith("/index.html")) return;
    e.respondWith(navegacao(e));
    return;
  }
  e.respondWith(arquivo(e));
});

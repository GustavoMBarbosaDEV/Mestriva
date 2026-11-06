// Carrega o banco de conteúdo (conteudo/*.json) do próprio site, uma vez por sessão.
// O service worker guarda os arquivos, então depois da primeira vez funciona sem internet.

/** @type {Promise<any>|null} */
let indice = null;
/** @type {Map<string, Promise<any>>} */
const materias = new Map();

const busca = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("não carregou " + url);
    return r.json();
  });

/** Índice do banco ({versao, materias}); se não carregar, devolve um índice vazio. */
export function carregaIndice() {
  if (!indice) indice = busca("/conteudo/indice.json").catch(() => { indice = null; return { versao: 1, materias: [] }; });
  return indice;
}

/** Matéria completa do banco, ou null se não existir ou não carregar. @param {string} id */
export function carregaMateria(id) {
  if (!/^[a-z0-9-]+$/.test(id || "")) return Promise.resolve(null);
  if (!materias.has(id)) materias.set(id, busca(`/conteudo/${id}.json`).catch(() => { materias.delete(id); return null; }));
  return /** @type {Promise<any>} */ (materias.get(id));
}

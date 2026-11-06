// Dados do estudante guardados no aparelho (localStorage).
// No plano do Firebase, outra loja com a mesma interface guarda na conta.
import { COLECOES, NORM, normDados, normPerfil } from "./normaliza.js";

const AVISO = "Não deu para salvar neste aparelho. Seus dados ficam só até fechar o app.";

function armazenamentoPadrao() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

/**
 * @param {{armazenamento?: Storage|{getItem:Function,setItem:Function,removeItem:Function}|null, chave?: string}} [opcoes]
 */
export function criaLoja({ armazenamento, chave = "mestriva.dados.v1" } = {}) {
  const arm = armazenamento === undefined ? armazenamentoPadrao() : armazenamento;
  /** @type {Set<(d:any)=>void>} */
  const ouvintes = new Set();
  let estado = normDados(null);

  const loja = {
    persistente: !!arm,
    /** @type {string|null} */
    aviso: arm ? null : AVISO,
  };

  if (arm) {
    let bruto = null;
    try {
      bruto = arm.getItem(chave);
    } catch {
      loja.persistente = false;
      loja.aviso = AVISO;
    }
    if (bruto) {
      try {
        estado = normDados(JSON.parse(bruto));
      } catch {
        try {
          arm.setItem(chave + ".corrompido", bruto);
        } catch {
          /* sem espaço: segue sem a cópia */
        }
      }
    }
  }

  const confere = (col) => {
    if (!COLECOES.includes(col)) throw new Error("coleção desconhecida: " + col);
  };
  const copia = (v) => JSON.parse(JSON.stringify(v));

  function grava() {
    if (arm && loja.persistente) {
      try {
        arm.setItem(chave, JSON.stringify(estado));
      } catch {
        loja.persistente = false;
        loja.aviso = AVISO;
      }
    }
    for (const fn of ouvintes) fn(copia(estado));
  }

  return Object.assign(loja, {
    dados: () => copia(estado),
    perfil: () => copia(estado.perfil),
    /** @param {object} parcial */
    salvaPerfil(parcial) {
      estado.perfil = normPerfil({ ...estado.perfil, ...parcial });
      grava();
      return copia(estado.perfil);
    },
    /** @param {string} col */
    lista(col) {
      confere(col);
      return copia(estado[col]).sort((a, b) => (b.criado_em || "").localeCompare(a.criado_em || ""));
    },
    /** @param {string} col @param {string} id */
    pega(col, id) {
      confere(col);
      const item = estado[col].find((x) => x.id === id);
      return item ? copia(item) : null;
    },
    /** @param {string} col @param {object} item */
    salva(col, item) {
      confere(col);
      const agora = new Date().toISOString();
      const antigo = item && item.id ? estado[col].find((x) => x.id === item.id) : null;
      const novo = NORM[col]({ ...item, criado_em: item.criado_em || antigo?.criado_em || agora, atualizado_em: agora });
      const i = estado[col].findIndex((x) => x.id === novo.id);
      if (i >= 0) estado[col][i] = novo;
      else estado[col].push(novo);
      grava();
      return copia(novo);
    },
    /** @param {string} col @param {string} id */
    apaga(col, id) {
      confere(col);
      const antes = estado[col].length;
      estado[col] = estado[col].filter((x) => x.id !== id);
      if (estado[col].length === antes) return false;
      grava();
      return true;
    },
    /** @param {(d:any)=>void} fn */
    assina(fn) {
      ouvintes.add(fn);
      return () => ouvintes.delete(fn);
    },
  });
}

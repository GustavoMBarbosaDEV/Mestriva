// Dados do estudante na conta (Firestore), com a mesma interface da loja do aparelho (loja.js).
// Cada item é um documento em users/{uid}/{coleção}/{id}; o perfil e o histórico do quiz ficam em users/{uid}/meta.
// A leitura vem da memória (instantânea); a gravação vai para o Firestore, que guarda no aparelho e envia quando houver internet.
import { COLECOES, NORM, normDados, normPerfil } from "./normaliza.js";

const AVISO_NUVEM = "Não deu para salvar na sua conta agora. Confira a internet: o que você fizer continua neste aparelho e é enviado depois.";
const LOTE = 400; // o Firestore aceita até 500 operações por lote

/** Tira o id (que já é o nome do documento) e os campos sem valor. @param {Record<string, any>} item */
export function paraDocumento(item) {
  const { id: _id, ...resto } = item;
  return JSON.parse(JSON.stringify(resto));
}

/** O que há para levar à conta: algum item ou o perfil já preenchido. @param {any} dados */
export function temDados(dados) {
  const d = normDados(dados);
  return d.perfil.onboarding_completed || COLECOES.some((c) => d[c].length > 0) || Object.keys(d.erros).length > 0;
}

/**
 * Junta os dados do aparelho aos da conta: o que já está na conta fica; do aparelho entra o que falta
 * (mesmo id: fica o mais recente). O perfil da conta vale, a não ser que ainda esteja vazio.
 * @param {any} daConta @param {any} doAparelho
 */
export function juntaDados(daConta, doAparelho) {
  const a = normDados(daConta);
  const b = normDados(doAparelho);
  /** @type {any} */
  const saida = { ...a, perfil: a.perfil.onboarding_completed ? a.perfil : b.perfil, erros: { ...b.erros, ...a.erros } };
  for (const c of COLECOES) {
    const porId = new Map(a[c].map((x) => [x.id, x]));
    for (const x of b[c]) {
      const ja = porId.get(x.id);
      if (!ja || (x.atualizado_em || "") > (ja.atualizado_em || "")) porId.set(x.id, x);
    }
    saida[c] = [...porId.values()];
  }
  return normDados(saida);
}

/**
 * @param {{F: any, db: any, uid: string}} p F: funções do Firestore (doc, collection, setDoc, deleteDoc, onSnapshot, writeBatch)
 */
export function criaLojaNuvem({ F, db, uid }) {
  /** @type {Set<(d:any)=>void>} */
  const ouvintes = new Set();
  /** Ouvintes só das mudanças que vieram de fora (outro aparelho ou outra aba). @type {Set<() => void>} */
  const deFora = new Set();
  /** @type {(() => void)[]} */
  let paradas = [];
  let estado = normDados(null);
  const loja = {
    persistente: true,
    nuvem: true,
    /** @type {string|null} */
    aviso: null,
    uid,
    /** A primeira leitura veio do servidor (e não só do cache do aparelho)? */
    doServidor: true,
  };

  const confere = (col) => {
    if (!COLECOES.includes(col)) throw new Error("coleção desconhecida: " + col);
  };
  const copia = (v) => JSON.parse(JSON.stringify(v));
  const item = (col, id) => F.doc(db, "users", uid, col, id);
  const meta = (nome) => F.doc(db, "users", uid, "meta", nome);
  const avisa = () => {
    for (const fn of ouvintes) fn(copia(estado));
  };
  /** Mesma lista, sem ligar para a ordem. */
  const igual = (a, b) => {
    const k = (l) => JSON.stringify([...l].sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0)));
    return a.length === b.length && k(a) === k(b);
  };
  const mudouFora = () => {
    avisa();
    for (const fn of deFora) fn();
  };
  /** Gravação em segundo plano: se falhar, avisa (os ouvintes mostram o aviso). @param {Promise<any>} p */
  const envia = (p) => {
    Promise.resolve(p).catch((e) => {
      console.warn("nuvem", e && e.code);
      loja.aviso = AVISO_NUVEM;
      avisa();
    });
  };

  /** Lê tudo e passa a acompanhar as mudanças (de outro aparelho, por exemplo). Resolve com a primeira leitura. */
  function carrega() {
    para();
    return new Promise((ok, falha) => {
      let faltam = COLECOES.length + 1;
      let pronto = false;
      loja.doServidor = true;
      const chegou = (/** @type {any} */ snap) => {
        if (snap && snap.metadata && snap.metadata.fromCache) loja.doServidor = false;
        faltam -= 1;
        if (!pronto && faltam === 0) {
          pronto = true;
          ok(loja);
        }
      };
      const erro = (e) => {
        if (!pronto) {
          pronto = true;
          para();
          falha(e);
        }
      };
      for (const col of COLECOES) {
        let primeira = true;
        paradas.push(
          F.onSnapshot(
            F.collection(db, "users", uid, col),
            (snap) => {
              const novo = snap.docs.map((d) => NORM[col]({ ...d.data(), id: d.id }));
              if (primeira) { primeira = false; estado[col] = novo; chegou(snap); return; }
              // O eco da própria gravação chega igual ao que já está na memória: não avisa à toa.
              if (igual(novo, estado[col])) return;
              estado[col] = novo;
              mudouFora();
            },
            erro
          )
        );
      }
      let primeiraMeta = true;
      paradas.push(
        F.onSnapshot(
          F.collection(db, "users", uid, "meta"),
          (snap) => {
            const m = Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
            const perfil = normPerfil(m.perfil);
            const erros = normDados({ erros: m.erros?.erros }).erros;
            const antes = JSON.stringify([estado.perfil, estado.erros]);
            estado.perfil = perfil;
            estado.erros = erros;
            if (primeiraMeta) { primeiraMeta = false; chegou(snap); return; }
            if (JSON.stringify([perfil, erros]) !== antes) mudouFora();
          },
          erro
        )
      );
    });
  }

  function para() {
    for (const p of paradas) {
      try { p(); } catch { /* já parado */ }
    }
    paradas = [];
  }

  /** Grava um conjunto de mudanças em lotes. @param {{tipo:"set"|"del", ref:any, dados?:any}[]} ops */
  async function emLotes(ops) {
    for (let i = 0; i < ops.length; i += LOTE) {
      const lote = F.writeBatch(db);
      for (const o of ops.slice(i, i + LOTE)) {
        if (o.tipo === "set") lote.set(o.ref, o.dados);
        else lote.delete(o.ref);
      }
      await lote.commit();
    }
  }

  /** Troca tudo o que está na conta por `dados` (restaurar backup, levar os dados do aparelho). */
  async function gravaTudo(dados) {
    const novo = normDados(dados);
    /** @type {{tipo:"set"|"del", ref:any, dados?:any}[]} */
    const ops = [];
    for (const col of COLECOES) {
      const ficam = new Set(novo[col].map((x) => x.id));
      for (const x of estado[col]) if (!ficam.has(x.id)) ops.push({ tipo: "del", ref: item(col, x.id) });
      for (const x of novo[col]) ops.push({ tipo: "set", ref: item(col, x.id), dados: paraDocumento(x) });
    }
    ops.push({ tipo: "set", ref: meta("perfil"), dados: paraDocumento(novo.perfil) });
    ops.push({ tipo: "set", ref: meta("erros"), dados: { erros: novo.erros } });
    estado = novo;
    avisa();
    await emLotes(ops);
  }

  /** Apaga todos os documentos da conta (antes de excluir a conta). */
  async function apagaTudo() {
    /** @type {{tipo:"set"|"del", ref:any}[]} */
    const ops = [];
    for (const col of COLECOES) for (const x of estado[col]) ops.push({ tipo: "del", ref: item(col, x.id) });
    ops.push({ tipo: "del", ref: meta("perfil") }, { tipo: "del", ref: meta("erros") });
    para();
    await emLotes(ops);
    estado = normDados(null);
  }

  return Object.assign(loja, {
    carrega,
    para,
    gravaTudo,
    apagaTudo,
    /** @param {() => void} fn */
    assinaFora(fn) {
      deFora.add(fn);
      return () => deFora.delete(fn);
    },
    dados: () => copia(estado),
    perfil: () => copia(estado.perfil),
    /** @param {object} parcial */
    salvaPerfil(parcial) {
      estado.perfil = normPerfil({ ...estado.perfil, ...parcial });
      envia(F.setDoc(meta("perfil"), paraDocumento(estado.perfil)));
      avisa();
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
      const x = estado[col].find((i) => i.id === id);
      return x ? copia(x) : null;
    },
    /** @param {string} col @param {object} novoItem */
    salva(col, novoItem) {
      confere(col);
      const agora = new Date().toISOString();
      const antigo = novoItem && novoItem.id ? estado[col].find((x) => x.id === novoItem.id) : null;
      const novo = NORM[col]({ ...novoItem, criado_em: novoItem.criado_em || antigo?.criado_em || agora, atualizado_em: agora });
      const i = estado[col].findIndex((x) => x.id === novo.id);
      if (i >= 0) estado[col][i] = novo;
      else estado[col].push(novo);
      envia(F.setDoc(item(col, novo.id), paraDocumento(novo)));
      avisa();
      return copia(novo);
    },
    /** @param {string} col @param {string} id */
    apaga(col, id) {
      confere(col);
      const antes = estado[col].length;
      estado[col] = estado[col].filter((x) => x.id !== id);
      if (estado[col].length === antes) return false;
      envia(F.deleteDoc(item(col, id)));
      avisa();
      return true;
    },
    erros: () => copia(estado.erros),
    /** @param {Record<string,{a:number,e:number,prox:string}>} erros */
    salvaErros(erros) {
      estado.erros = normDados({ erros }).erros;
      envia(F.setDoc(meta("erros"), { erros: estado.erros }));
      avisa();
    },
    /** Restaurar backup: troca tudo na conta. @param {unknown} dados */
    substitui(dados) {
      envia(gravaTudo(dados));
    },
    /** Apaga os dados da conta (a conta continua existindo). */
    limpa() {
      envia(gravaTudo(null));
    },
    /** @param {(d:any)=>void} fn */
    assina(fn) {
      ouvintes.add(fn);
      return () => ouvintes.delete(fn);
    },
  });
}

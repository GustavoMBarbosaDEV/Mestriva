// Backup dos dados do estudante (exportar e restaurar), com validação antes de trocar qualquer coisa.
import { normDados, COLECOES } from "./normaliza.js";
import { VERSAO } from "./versao.js";

const LIMITE_BYTES = 5 * 1024 * 1024;
const LIMITE_ITENS = 5000;

/** @param {any} dados normalizados */
export function montaBackup(dados, agora = new Date()) {
  return { app: "mestriva", formato: 1, versao_app: VERSAO, exportado_em: agora.toISOString(), dados };
}

/** @param {string} texto @returns {{ok:true, dados:any} | {ok:false, erro:string}} */
export function validaBackup(texto) {
  if (typeof texto !== "string" || texto.length > LIMITE_BYTES) return { ok: false, erro: "O arquivo é grande demais para ser um backup do Mestriva." };
  let bruto;
  try {
    bruto = JSON.parse(texto);
  } catch {
    return { ok: false, erro: "Esse arquivo não é um backup válido. Escolha o arquivo .json baixado em Ajustes." };
  }
  if (!bruto || bruto.app !== "mestriva" || typeof bruto.dados !== "object" || !bruto.dados) {
    return { ok: false, erro: "Esse arquivo não é um backup do Mestriva." };
  }
  for (const c of COLECOES) {
    if (Array.isArray(bruto.dados[c]) && bruto.dados[c].length > LIMITE_ITENS) return { ok: false, erro: "O backup é grande demais (itens demais em uma lista)." };
  }
  return { ok: true, dados: normDados(bruto.dados) };
}

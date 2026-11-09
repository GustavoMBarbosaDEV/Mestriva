// Ajustes: perfil, conta (formas de entrar, criar conta a partir do teste, sair, excluir; sem MFA) e seus dados (backup, restaurar, apagar).
import { esc } from "../util.js";
import { icone } from "../icones.js";
import { PERIODOS } from "../curriculo.js";
import { hojeISO } from "../datas.js";
import { cabecalho } from "../ui/cabecalho.js";
import { campo, CLASSE_CAMPO, CLASSE_TEXTO } from "../ui/formulario.js";
import { criaTela } from "../ui/pagina.js";
import { botaoAcessibilidade } from "../ui/acessibilidade.js";
import { abreDialogo } from "../ui/dialogo.js";
import { montaBackup, validaBackup } from "../backup.js";
import { NOMES_PROV } from "../nuvem.js";

const CAMPOS = ["display_name", "institution", "course", "period", "weekly_hours", "goal", "accessibility_notes"];
const BOTAO_CONTORNO = "inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-foreground/75 transition hover:border-electric/40 hover:text-foreground";

export function formDoPerfil(p) {
  const f = { erro: "", contaEmail: "", contaSenha: "", contaForm: false, contaMsg: "", contaErro: "", contaOcupado: "" };
  for (const c of CAMPOS) f[c] = (p && p[c]) || "";
  return f;
}

const entrada = (id, campoNome, valor, placeholder = "") =>
  `<input id="${id}" data-campo="${campoNome}" value="${esc(valor)}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ""} class="${CLASSE_CAMPO}" />`;

export function desenha(f, usuario, salvo) {
  return `<div class="space-y-6">
    ${cabecalho({ sobre: "ajustes", titulo: "Seu perfil de estudante", descricao: "Esses dados personalizam o calendário, os materiais e as dicas do tutor." })}
    <div class="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <form data-enviar="perfil" class="space-y-4 panel p-5" novalidate>
        <h2 class="text-sm font-semibold">Dados acadêmicos</h2>
        ${campo({ rotulo: "Como você quer ser chamado", para: "set-name", conteudo: entrada("set-name", "display_name", f.display_name) })}
        <div class="grid gap-4 sm:grid-cols-2">
          ${campo({ rotulo: "Instituição", para: "set-institution", conteudo: entrada("set-institution", "institution", f.institution) })}
          ${campo({ rotulo: "Curso", para: "set-course", conteudo: entrada("set-course", "course", f.course) })}
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          ${campo({ rotulo: "Período atual", para: "set-period", conteudo: `<select id="set-period" data-campo="period" class="${CLASSE_CAMPO}"><option value="">Não informado</option>${PERIODOS.map((p) => `<option value="${p}"${p === f.period ? " selected" : ""}>${p} período</option>`).join("")}</select>` })}
          ${campo({ rotulo: "Horas de estudo por semana", para: "set-hours", conteudo: entrada("set-hours", "weekly_hours", f.weekly_hours, "Ex: 10 a 20h") })}
        </div>
        ${campo({ rotulo: "Objetivo do semestre", para: "set-goal", conteudo: entrada("set-goal", "goal", f.goal, "Ex: passar em todas sem recuperação") })}
        ${campo({ rotulo: "Observações para o tutor", para: "set-notes", dica: "O tutor adapta o tom e as estratégias com base aqui.", conteudo: `<textarea id="set-notes" data-campo="accessibility_notes" rows="4" class="${CLASSE_TEXTO}">${esc(f.accessibility_notes)}</textarea>` })}
        ${f.erro ? `<p role="alert" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(f.erro)}</p>` : ""}
        <div class="flex items-center gap-3">
          <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-60">${icone("Check", "h-4 w-4 text-neon")}Salvar alterações</button>
          ${salvo ? `<span role="status" class="text-xs font-medium text-[#027A48]">Alterações salvas</span>` : ""}
        </div>
      </form>
      <div class="space-y-4">
        <section class="panel p-5">
          <h2 class="text-sm font-semibold">Acessibilidade</h2>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">Tamanho do texto, alto contraste, fonte para dislexia, espaçamento de leitura e redução de animações. As preferências ficam salvas neste dispositivo.</p>
          <div class="mt-4">${botaoAcessibilidade({ compacto: false })}</div>
          <a href="/onboarding" class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-electric">${icone("Sparkles", "h-3.5 w-3.5")}Rever o questionário inicial</a>
        </section>
        <section class="panel p-5">
          <h2 class="text-sm font-semibold">Seus dados</h2>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">${usuario.modo === "nuvem" ? "Tudo fica salvo na sua conta e também neste aparelho, para funcionar sem internet. O backup é uma cópia extra, só sua." : "Tudo fica guardado neste aparelho. Baixe um backup de vez em quando para não perder nada se trocar de celular ou limpar o navegador."}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button type="button" data-acao="baixar" class="${BOTAO_CONTORNO}">${icone("Upload", "h-3.5 w-3.5 rotate-180")}Baixar backup</button>
            <label class="${BOTAO_CONTORNO} cursor-pointer">${icone("FileUp", "h-3.5 w-3.5")}Restaurar backup<input type="file" accept="application/json,.json" data-arquivo class="sr-only" /></label>
          </div>
          <button type="button" data-acao="apagar" class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive">${icone("Trash2", "h-3.5 w-3.5")}${usuario.modo === "nuvem" ? "Apagar todos os meus dados" : "Apagar dados deste aparelho"}</button>
        </section>
        ${secaoConta(f, usuario)}
      </div>
    </div>
  </div>`;
}

const BOTAO_PROV = "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium transition hover:border-electric/40 disabled:opacity-60";

/** Formulário de e-mail e senha da conta (sair do modo teste ou acrescentar a senha). @param {any} f @param {boolean} anonimo */
function formSenha(f, anonimo) {
  const dis = f.contaOcupado ? " disabled" : "";
  return `<form data-enviar="senha" class="mt-3 space-y-3 rounded-xl border border-border p-3.5" novalidate>
    ${anonimo ? campo({ rotulo: "E-mail", para: "conta-email", conteudo: `<input id="conta-email" data-campo="contaEmail" type="email" autocomplete="email" value="${esc(f.contaEmail)}" class="${CLASSE_CAMPO}" />` }) : ""}
    ${campo({ rotulo: anonimo ? "Senha" : "Nova senha", para: "conta-senha", dica: "Pelo menos 8 caracteres, com letras e números.", conteudo: `<input id="conta-senha" data-campo="contaSenha" type="password" autocomplete="new-password" value="${esc(f.contaSenha)}" class="${CLASSE_CAMPO}" />` })}
    <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60"${dis}>${f.contaOcupado === "senha" ? icone("Loader2", "h-3.5 w-3.5 animate-spin") : icone("KeyRound", "h-3.5 w-3.5 text-neon")}${anonimo ? "Criar conta" : "Criar senha"}</button>
  </form>`;
}

/** Seção Conta: modo local, modo teste (anônimo) ou conta de verdade. @param {any} f @param {any} usuario */
export function secaoConta(f, usuario) {
  const c = usuario.conta;
  const msg = (f.contaErro ? `<p role="alert" class="mt-3 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">${esc(f.contaErro)}</p>` : "") +
    (f.contaMsg ? `<p role="status" class="mt-3 rounded-xl bg-[#027A48]/10 px-3.5 py-2.5 text-xs font-medium text-[#027A48] dark:text-[#6CE9A6]">${esc(f.contaMsg)}</p>` : "");
  if (usuario.modo !== "nuvem" || !c) {
    return `<section class="panel p-5">
          <h2 class="text-sm font-semibold">Conta</h2>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">Você está usando o Mestriva sem conta: tudo fica neste aparelho.</p>
          <dl class="mt-3 space-y-2 text-xs"><div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Nome</dt><dd class="truncate font-medium">${esc(usuario.nome || "—")}</dd></div></dl>
        </section>`;
  }
  const dis = f.contaOcupado ? " disabled" : "";
  const giro = (q, ic) => (f.contaOcupado === q ? icone("Loader2", "h-4 w-4 animate-spin") : icone(ic, "h-4 w-4"));
  const ligar = (nome, rotulo) => `<button type="button" data-acao="ligar" data-valor="${nome}" class="${BOTAO_PROV}"${dis}>${giro(nome, nome === "google" ? "Google" : "Microsoft")}${esc(rotulo)}</button>`;
  if (c.anonimo) {
    return `<section class="panel p-5">
          <div class="flex items-center justify-between gap-2"><h2 class="text-sm font-semibold">Conta</h2><span class="rounded-full bg-[#F79009]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#B54708] dark:text-[#FEC84B]">Modo teste</span></div>
          <p class="mt-1 text-xs leading-relaxed text-muted-foreground">Crie sua conta para entrar em outros aparelhos e não perder nada se limpar o navegador. Tudo o que você já fez continua.</p>
          <div class="mt-3 flex flex-wrap gap-2">${ligar("google", "Criar com o Google")}${ligar("microsoft", "Criar com a Microsoft")}
            <button type="button" data-acao="abre-senha" aria-expanded="${!!f.contaForm}" class="${BOTAO_PROV}">${icone("Mail", "h-4 w-4")}Criar com e-mail e senha</button></div>
          ${f.contaForm ? formSenha(f, true) : ""}
          ${msg}
          <button type="button" data-acao="sair" class="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-foreground/75 transition hover:border-destructive/40 hover:text-destructive">${icone("LogOut", "h-3.5 w-3.5")}Sair do modo teste</button>
        </section>`;
  }
  const tem = (p) => c.provedores.includes(p);
  const formas = ["google.com", "microsoft.com", "password"]
    .map((p) => `<li class="flex items-center justify-between gap-3"><span>${esc(NOMES_PROV[p][0].toUpperCase() + NOMES_PROV[p].slice(1))}</span>${tem(p) ? `<span class="inline-flex items-center gap-1 font-medium text-[#027A48] dark:text-[#6CE9A6]">${icone("Check", "h-3.5 w-3.5")}ligado</span>` : p === "password" ? `<button type="button" data-acao="abre-senha" aria-expanded="${!!f.contaForm}" class="font-medium text-electric hover:underline">Criar senha</button>` : `<button type="button" data-acao="ligar" data-valor="${p === "google.com" ? "google" : "microsoft"}" class="font-medium text-electric hover:underline"${dis}>Ligar</button>`}</li>`)
    .join("");
  return `<section class="panel p-5">
          <h2 class="text-sm font-semibold">Conta</h2>
          <dl class="mt-3 space-y-2 text-xs">
            <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">Nome</dt><dd class="truncate font-medium">${esc(usuario.nome || "—")}</dd></div>
            <div class="flex items-center justify-between gap-3"><dt class="text-muted-foreground">E-mail</dt><dd class="truncate font-medium">${esc(usuario.email || "—")}</dd></div>
          </dl>
          ${c.precisaConfirmar ? `<div class="mt-3 rounded-xl border border-[#F79009]/40 bg-[#F79009]/10 px-3.5 py-3 text-xs leading-relaxed"><p>Confirme seu e-mail pelo link que mandamos (veja também o spam).</p><div class="mt-2 flex flex-wrap gap-3"><button type="button" data-acao="reenviar" class="font-medium text-electric hover:underline"${dis}>Mandar o link de novo</button><button type="button" data-acao="ja-confirmei" class="font-medium text-electric hover:underline"${dis}>Já confirmei</button></div></div>` : ""}
          <h3 class="mt-4 text-xs font-semibold">Formas de entrar</h3>
          <ul class="mt-2 space-y-2 text-xs">${formas}</ul>
          ${f.contaForm && !tem("password") ? formSenha(f, false) : ""}
          ${msg}
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" data-acao="sair" class="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-foreground/75 transition hover:border-destructive/40 hover:text-destructive">${icone("LogOut", "h-3.5 w-3.5")}Sair da conta</button>
            <button type="button" data-acao="excluir" class="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive"${dis}>${icone("Trash2", "h-3.5 w-3.5")}Excluir conta</button>
          </div>
        </section>`;
}

/** @param {any} ctx */
export function render(ctx) {
  return `<div data-pagina>${desenha(formDoPerfil(ctx.loja.perfil()), ctx.usuario, false)}</div>`;
}

function confirma({ titulo, descricao, botao, aoConfirmar }) {
  const dlg = abreDialogo({
    titulo,
    descricao,
    corpo: `<div class="flex justify-end gap-2 pt-2"><button type="button" data-nao class="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 transition hover:bg-secondary">Cancelar</button><button type="button" data-sim class="inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition hover:bg-destructive/90">${esc(botao)}</button></div>`,
    classe: "max-w-md rounded-2xl",
  });
  dlg.elemento.addEventListener("click", (e) => {
    const t = /** @type {HTMLElement} */ (e.target);
    if (t.closest("[data-nao]")) dlg.fecha();
    if (t.closest("[data-sim]")) { dlg.fecha(); aoConfirmar(); }
  });
}

/** @param {HTMLElement} raiz @param {any} ctx */
export function montar(raiz, ctx) {
  const area = /** @type {HTMLElement} */ (raiz.querySelector("[data-pagina]"));
  let salvo = false;
  /** Roda uma ação da conta com carregando e mensagem. */
  async function daConta(t, qual, fn) {
    const f = t.estado;
    if (f.contaOcupado) return;
    Object.assign(f, { contaOcupado: qual, contaErro: "", contaMsg: "" });
    t.pinta();
    try {
      const m = await fn();
      if (typeof m === "string" && m) { f.contaMsg = m; ctx.anuncia(m); }
    } catch (e) {
      f.contaErro = (e && e.message) || "";
      if (f.contaErro) ctx.anuncia(f.contaErro);
    }
    f.contaOcupado = "";
    if (area.isConnected) t.pinta();
  }
  const tela = criaTela(area, {
    estado: formDoPerfil(ctx.loja.perfil()),
    desenha: (f) => desenha(f, { ...ctx.usuario, nome: ctx.loja.perfil().display_name || ctx.usuario.nome }, salvo),
    aoDigitar() {
      if (salvo) { salvo = false; area.querySelector('[role="status"]')?.remove(); }
    },
    aoEnviar: {
      senha(_form, f, t) {
        daConta(t, "senha", async () => {
          const m = await ctx.conta.criaSenha(f.contaEmail, f.contaSenha);
          Object.assign(f, { contaForm: false, contaSenha: "" });
          return m;
        });
      },
      perfil(_form, f, t) {
        const parcial = {};
        for (const c of CAMPOS) parcial[c] = String(f[c] || "").trim();
        ctx.loja.salvaPerfil(parcial);
        salvo = true;
        t.pinta();
        ctx.anuncia("Alterações salvas");
      },
    },
    acoes: {
      ligar(el, _f, t) { daConta(t, el.dataset.valor, () => ctx.conta.entrarCom(el.dataset.valor, true)); },
      "abre-senha"(_el, f, t) { f.contaForm = !f.contaForm; t.pinta(); },
      reenviar(_el, _f, t) { daConta(t, "reenviar", () => ctx.conta.reenviarConfirmacao()); },
      "ja-confirmei"(_el, _f, t) { daConta(t, "reenviar", async () => { await ctx.conta.atualiza(); return ctx.conta.usuario()?.emailVerificado ? "E-mail confirmado. Obrigado!" : "Ainda não chegou a confirmação. Toque no link do e-mail e tente de novo."; }); },
      excluir(_el, _f, t) {
        confirma({
          titulo: "Excluir sua conta?",
          descricao: "Sua conta e todos os seus dados (grade, notas, calendário, materiais e perfil) serão apagados para sempre. Isso não pode ser desfeito. Baixe um backup antes, se quiser guardar.",
          botao: "Excluir conta e dados",
          aoConfirmar: () => daConta(t, "excluir", async () => {
            await ctx.conta.excluirConta(() => ctx.loja.apagaTudo());
            ctx.toast("Sua conta e seus dados foram excluídos.");
            ctx.navega("/bem-vindo", { substitui: true });
          }),
        });
      },
      baixar() {
        const blob = new Blob([JSON.stringify(montaBackup(ctx.loja.dados()), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mestriva-backup-${hojeISO()}.json`;
        a.dataset.externo = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        ctx.anuncia("Backup baixado");
      },
      apagar() {
        confirma({
          titulo: ctx.usuario.modo === "nuvem" ? "Apagar todos os seus dados?" : "Apagar os dados deste aparelho?",
          descricao: ctx.usuario.modo === "nuvem"
            ? "Sua grade, notas, calendário, materiais e perfil serão apagados da sua conta e de todos os aparelhos. A conta continua existindo. Isso não pode ser desfeito. Baixe um backup antes, se quiser guardar."
            : "Sua grade, notas, calendário, materiais e perfil serão apagados deste aparelho. Isso não pode ser desfeito. Baixe um backup antes, se quiser guardar.",
          botao: "Apagar tudo",
          aoConfirmar: () => { ctx.loja.limpa(); ctx.navega("/onboarding", { substitui: true }); },
        });
      },
    },
  });
  const arquivo = (/** @type {Event} */ e) => {
    const input = /** @type {HTMLInputElement} */ (e.target);
    if (!input.matches("[data-arquivo]") || !input.files?.[0]) return;
    const f = input.files[0];
    input.value = "";
    f.text().then((texto) => {
      const r = validaBackup(texto);
      if (!r.ok) { const erro = /** @type {{erro: string}} */ (r).erro; ctx.toast(erro); ctx.anuncia(erro); return; }
      confirma({
        titulo: "Restaurar este backup?",
        descricao: ctx.usuario.modo === "nuvem" ? "Os dados atuais da sua conta serão trocados pelos do backup." : "Os dados atuais deste aparelho serão trocados pelos do backup.",
        botao: "Restaurar",
        aoConfirmar: () => { ctx.loja.substitui(r.dados); ctx.toast("Backup restaurado."); ctx.navega("/", { substitui: true }); },
      });
    });
  };
  area.addEventListener("change", arquivo);
  return () => { area.removeEventListener("change", arquivo); tela.destroi(); };
}

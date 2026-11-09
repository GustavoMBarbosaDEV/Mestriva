// Conta do estudante no Firebase, no mesmo jeito do Monetra: Google, Microsoft, e-mail e senha, link por e-mail
// e "Testar sem conta" (anônimo, que vira conta de verdade sem perder nada).
// O SDK fica em vendor/ (gerado por ferramentas/vendor-firebase.mjs) e só carrega quando o login está ligado.

export const FB_V = "13.2.0";
export const FB_REV = "1";
const LINK_KEY = "mestriva.linkEmail";
export const NOMES_PROV = { "google.com": "Google", "microsoft.com": "Microsoft", password: "e-mail e senha" };

/** A configuração do firebase-config.js está preenchida? @param {any} cfg */
export const configOk = (cfg) => !!(cfg && typeof cfg.apiKey === "string" && cfg.apiKey && !/COLE|SUA_/i.test(cfg.apiKey) && cfg.projectId);

export const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || ""));
export const senhaBoa = (x) => String(x || "").length >= 8 && /[a-zA-Z]/.test(x) && /\d/.test(x);

const SENHAS_OBVIAS = ["senha123", "senha1234", "senha12345", "password1", "password123", "abc12345", "abcd1234", "qwerty123", "admin123", "admin1234", "mudar123", "teste123", "12345678a", "a12345678", "iloveyou1", "brasil123", "mestriva123", "estudar123"];
/** Senhas fáceis de adivinhar: listas conhecidas, sequências, repetições e o próprio e-mail. */
export function senhaObvia(senha, email) {
  const so = String(senha || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const usuario = String(email || "").toLowerCase().split("@")[0].replace(/[^a-z0-9]/g, "");
  if (SENHAS_OBVIAS.includes(so) || /(.)\1{5,}/.test(so)) return true;
  if (/^(?:0123456789|123456789|12345678|87654321|abcdefgh|qwertyui)/.test(so)) return true;
  return usuario.length >= 4 && so.includes(usuario);
}

/** Mensagem em português para cada erro do Firebase (vazio quando a própria pessoa cancelou). @param {any} e */
export function traduzErro(e) {
  const c = String((e && e.code) || (e && e.message) || "");
  if (c.includes("popup-closed") || c.includes("cancelled")) return "";
  if (c.includes("network")) return "Sem internet. Tente de novo.";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found") || c.includes("invalid-login")) return "E-mail ou senha incorretos.";
  if (c.includes("email-already-in-use")) return "Este e-mail já tem conta no Mestriva. Entre com a senha, com o link por e-mail, com o Google ou com a Microsoft, do jeito que você criou.";
  if (c.includes("weak-password")) return "Senha fraca: use pelo menos 8 caracteres, com letras e números.";
  if (c.includes("invalid-email") || c.includes("missing-email")) return "Este e-mail não parece válido.";
  if (c.includes("too-many-requests")) return "Muitas tentativas. Espere alguns minutos e tente de novo.";
  if (c.includes("operation-not-allowed") || c.includes("admin-restricted")) return "Esta forma de entrar ainda não está ativada. Use outra por enquanto.";
  if (c.includes("credential-already-in-use") || c.includes("provider-already-linked")) return "Essa conta já está ligada a outro Mestriva. Use outra forma de entrar, ou saia e entre com ela.";
  if (c.includes("requires-recent-login")) return "Por segurança, saia e entre de novo antes de fazer isso.";
  if (c.includes("invalid-action-code") || c.includes("expired-action-code")) return "Este link expirou ou já foi usado. Peça um novo.";
  if (c.includes("unauthorized-domain")) return "Este endereço ainda não está liberado para entrar. Use o Mestriva em mestriva.web.app.";
  if (c.includes("api-key") || c.includes("configuration-not-found")) return "O login do Mestriva ainda está sendo configurado. Tente de novo mais tarde.";
  if (c.includes("app-check")) return "Não deu para confirmar que você não é um robô. Recarregue a página e tente de novo.";
  if (c.includes("permission-denied")) return "Sua conta não tem permissão para isso. Saia e entre de novo.";
  return `Não foi possível entrar (${c || "erro desconhecido"}).`;
}

/** Abriu o site dentro de outro app (Instagram, Facebook…), onde o Google não deixa entrar? @param {string} ua */
export const navegadorDeApp = (ua) => /FBAN|FBAV|FB_IAB|Instagram|Line\/|LinkedInApp|TikTok|musical_ly|Snapchat|Twitter/i.test(String(ua || ""));

/** Resumo do usuário do Firebase para as telas. @param {any} u */
export function resumoUsuario(u) {
  if (!u) return null;
  const provedores = (u.providerData || []).map((p) => p.providerId).filter(Boolean);
  return {
    uid: u.uid,
    anonimo: !!u.isAnonymous,
    email: u.email || "",
    emailVerificado: !!u.emailVerified,
    nome: u.displayName || "",
    provedores,
    // Só pede confirmação de e-mail de quem criou a conta com senha (Google e Microsoft já confirmam).
    precisaConfirmar: !u.isAnonymous && provedores.includes("password") && !u.emailVerified,
  };
}

const urlRetorno = () => `${location.origin}/login`;

/** Já existe sessão salva neste aparelho? (só para decidir se liga o App Check antes) */
function sessaoSalva(chave) {
  try {
    return !!localStorage.getItem(`firebase:authUser:${chave}:[DEFAULT]`);
  } catch {
    return true; // sem como saber: liga, o custo é pequeno
  }
}

/**
 * Liga o Firebase e acompanha a conta.
 * @param {{cfg:any, appCheckKey?:string, aoMudar:(u: ReturnType<typeof resumoUsuario>, bruto:any)=>void, aoLogin?:(texto:string)=>void, aoErro?:(texto:string)=>void}} p
 */
export async function iniciaNuvem({ cfg, appCheckKey = "", aoMudar, aoLogin = () => {}, aoErro = () => {} }) {
  const base = new URL(`vendor/firebase-${FB_V}/`, document.baseURI).href;
  const [A, U] = await Promise.all([import(`${base}firebase-app.js?r=${FB_REV}`), import(`${base}firebase-auth.js?r=${FB_REV}`)]);
  const app = A.initializeApp(cfg);
  /** @type {Promise<void>|null} */
  let appCheck = null;
  /** App Check já ligado (ou sem chave): as janelas do Google e da Microsoft abrem sem esperar nada. */
  let acPronto = !appCheckKey;
  /** @type {Promise<{F:any, db:any}>|null} */
  let firestore = null;
  /** Credencial que ficou para ligar depois (mesmo e-mail entrou de outro jeito antes). */
  let pendente = null;
  let linkHref = "";

  function ligaAppCheck() {
    if (!appCheckKey) return Promise.resolve();
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) /** @type {any} */ (self).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    if (!appCheck) {
      appCheck = import(`${base}firebase-app-check.js?r=${FB_REV}`)
        .then((C) => { C.initializeAppCheck(app, { provider: new C.ReCaptchaEnterpriseProvider(appCheckKey), isTokenAutoRefreshEnabled: true }); acPronto = true; })
        .catch((e) => { appCheck = null; console.warn("App Check não iniciou", e); });
    }
    return appCheck;
  }
  const viaLink = /[?&]oobCode=/.test(location.search);
  if (viaLink || sessaoSalva(cfg.apiKey)) await ligaAppCheck();
  const auth = U.getAuth(app);
  try { U.useDeviceLanguage(auth); } catch { /* idioma padrão */ }

  const provedor = (nome) => {
    const p = nome === "microsoft" ? new U.OAuthProvider("microsoft.com") : new U.GoogleAuthProvider();
    p.setCustomParameters({ prompt: "select_account" });
    return p;
  };

  function boasVindas(r) {
    try {
      const info = U.getAdditionalUserInfo(r);
      const nome = ((r.user && r.user.displayName) || "").split(" ")[0];
      if (r.operationType === "link") return "Conta criada! Tudo o que você já tinha continua aqui.";
      if (r.user && r.user.isAnonymous) return "Modo teste: crie sua conta quando quiser, sem perder nada.";
      return info && info.isNewUser ? `Conta criada! Bem-vindo(a)${nome ? `, ${nome}` : ""}.` : `Bem-vindo(a) de volta${nome ? `, ${nome}` : ""}.`;
    } catch {
      return "";
    }
  }

  async function aposLogin(r) {
    // Só liga a credencial pendente à conta do mesmo e-mail, e por no máximo 10 minutos.
    const p = pendente;
    pendente = null;
    let extra = "";
    if (p && p.c && p.email && r?.user?.email && p.email.toLowerCase() === r.user.email.toLowerCase() && Date.now() - p.em < 10 * 60000) {
      try {
        await U.linkWithCredential(r.user, p.c);
        extra = ` Agora você também entra com ${NOMES_PROV[p.c.providerId] || p.c.providerId}.`;
      } catch (e) { console.warn("vincular", e && e.code); }
    }
    const t = boasVindas(r) + extra;
    if (t.trim()) aoLogin(t.trim());
    aoMudar(resumoUsuario(auth.currentUser), auth.currentUser);
  }

  /** Erros viram exceção com a mensagem já traduzida (vazia = a pessoa cancelou). */
  const falha = (e) => { throw new Error(traduzErro(e)); };

  const conta = {
    auth,
    usuario: () => resumoUsuario(auth.currentUser),
    /** O link do e-mail foi aberto em outro aparelho: falta saber o e-mail. */
    linkPendente: () => !!linkHref,

    async entrarCom(nome, vincular = false) {
      const p = provedor(nome);
      const u = auth.currentUser;
      const ligar = !!u && (vincular || u.isAnonymous);
      // Esperar aqui faria o navegador do celular bloquear a janela (ela precisa abrir logo após o toque).
      if (!acPronto) await ligaAppCheck();
      try {
        const r = ligar ? await U.linkWithPopup(u, p) : await U.signInWithPopup(auth, p);
        await aposLogin(r);
      } catch (e) {
        const c = String(e.code || "");
        if (c.includes("popup-blocked") || c.includes("operation-not-supported")) {
          if (ligar) await U.linkWithRedirect(u, p);
          else await U.signInWithRedirect(auth, p);
          return;
        }
        if (c.includes("account-exists-with-different-credential")) {
          const em = e.customData?.email || "";
          pendente = { c: (nome === "microsoft" ? U.OAuthProvider : U.GoogleAuthProvider).credentialFromError(e), email: em, em: Date.now() };
          throw new Error(`Você já tem conta no Mestriva${em ? ` com ${em}` : ""}. Entre do jeito que usou antes (Google, Microsoft, senha ou link por e-mail): a ${nome === "microsoft" ? "Microsoft" : "conta Google"} é ligada em seguida, sem criar outra conta.`);
        }
        falha(e);
      }
    },

    async entrarEmail({ email, senha, novo }) {
      email = String(email || "").trim();
      if (!emailOk(email)) throw new Error("Digite um e-mail válido.");
      if (!senha) throw new Error("Digite a senha.");
      if (novo && !senhaBoa(senha)) throw new Error("A senha precisa de pelo menos 8 caracteres, com letras e números.");
      if (novo && senhaObvia(senha, email)) throw new Error("Essa senha é fácil de adivinhar. Evite sequências, palavras como “senha” e o seu e-mail.");
      await ligaAppCheck();
      try {
        const u = auth.currentUser;
        const r = novo && u && u.isAnonymous
          ? await U.linkWithCredential(u, U.EmailAuthProvider.credential(email, senha))
          : novo ? await U.createUserWithEmailAndPassword(auth, email, senha) : await U.signInWithEmailAndPassword(auth, email, senha);
        if (novo) U.sendEmailVerification(r.user, { url: `${location.origin}/` }).catch(() => {});
        await aposLogin(r);
      } catch (e) {
        if (novo && String(e.code || "").includes("email-already-in-use")) pendente = { c: U.EmailAuthProvider.credential(email, senha), email, em: Date.now() };
        falha(e);
      }
    },

    async enviarLink(email) {
      email = String(email || "").trim();
      if (!emailOk(email)) throw new Error("Digite seu e-mail para receber o link.");
      await ligaAppCheck();
      try {
        await U.sendSignInLinkToEmail(auth, email, { url: urlRetorno(), handleCodeInApp: true });
      } catch (e) { falha(e); }
      try { localStorage.setItem(LINK_KEY, email); } catch { /* sem localStorage: pede o e-mail ao voltar */ }
      return `Enviamos um link para ${email}. Abra o e-mail neste aparelho e toque no link para entrar. Se não chegar, confira o spam.`;
    },

    async concluiLink(email = "") {
      if (!email) { try { email = localStorage.getItem(LINK_KEY) || ""; } catch { /* sem localStorage */ } }
      if (!email) return false;
      const href = linkHref;
      linkHref = "";
      await ligaAppCheck();
      try { history.replaceState(history.state, "", "/login"); } catch { /* sem histórico */ }
      try {
        const u = auth.currentUser;
        const r = u && u.isAnonymous
          ? await U.linkWithCredential(u, U.EmailAuthProvider.credentialWithLink(email, href))
          : await U.signInWithEmailLink(auth, email, href);
        try { localStorage.removeItem(LINK_KEY); } catch { /* nada */ }
        await aposLogin(r);
      } catch (e) {
        linkHref = href;
        falha(e);
      }
      return true;
    },

    async esqueciSenha(email) {
      email = String(email || "").trim();
      if (!emailOk(email)) throw new Error("Digite seu e-mail para receber o link de nova senha.");
      await ligaAppCheck();
      try {
        await U.sendPasswordResetEmail(auth, email, { url: urlRetorno() });
      } catch (e) {
        if (!String(e.code || "").includes("user-not-found")) falha(e);
      }
      return `Se houver uma conta com ${email}, enviamos um link para criar uma nova senha. Confira também o spam.`;
    },

    async testarSemConta() {
      await ligaAppCheck();
      try {
        await aposLogin(await U.signInAnonymously(auth));
      } catch (e) { falha(e); }
    },

    /** Põe e-mail e senha na conta atual (tira do modo teste ou acrescenta a senha a quem entra com Google). */
    async criaSenha(email, senha) {
      const u = auth.currentUser;
      if (!u) throw new Error("Entre na sua conta primeiro.");
      email = String((u.isAnonymous ? email : u.email || email) || "").trim();
      if (!emailOk(email)) throw new Error("Digite um e-mail válido.");
      if (!senhaBoa(senha)) throw new Error("A senha precisa de pelo menos 8 caracteres, com letras e números.");
      if (senhaObvia(senha, email)) throw new Error("Essa senha é fácil de adivinhar. Evite sequências, palavras como “senha” e o seu e-mail.");
      await ligaAppCheck();
      try {
        const r = await U.linkWithCredential(u, U.EmailAuthProvider.credential(email, senha));
        if (!r.user.emailVerified) U.sendEmailVerification(r.user, { url: `${location.origin}/` }).catch(() => {});
        aoMudar(resumoUsuario(auth.currentUser), auth.currentUser);
        return u.isAnonymous ? "Conta criada! Enviamos um link para confirmar o e-mail." : "Senha criada: agora você também entra com e-mail e senha.";
      } catch (e) { return falha(e); }
    },

    async reenviarConfirmacao() {
      const u = auth.currentUser;
      if (!u) return "";
      await ligaAppCheck();
      try {
        await U.sendEmailVerification(u, { url: `${location.origin}/` });
      } catch (e) { falha(e); }
      return `Link de confirmação enviado para ${u.email}.`;
    },

    /** Recarrega o usuário (depois de confirmar o e-mail em outra aba). */
    async atualiza() {
      if (auth.currentUser) await U.reload(auth.currentUser).catch(() => {});
      aoMudar(resumoUsuario(auth.currentUser), auth.currentUser);
    },

    /** Firestore com cache no aparelho (funciona sem internet e envia depois). */
    firestore() {
      if (!firestore) {
        firestore = Promise.all([ligaAppCheck(), import(`${base}firebase-firestore.js?r=${FB_REV}`)])
          .then(([, F]) => {
            let db;
            try {
              db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
            } catch {
              db = F.getFirestore(app);
            }
            return { F, db };
          })
          .catch((e) => { firestore = null; throw e; });
      }
      return firestore;
    },

    async sair() {
      await U.signOut(auth);
      limpaCacheDoAparelho();
    },

    /**
     * Exclui a conta: confirma a identidade se o login for antigo, apaga os dados (apagaDados) e depois o usuário.
     * @param {() => Promise<void>} apagaDados
     */
    async excluirConta(apagaDados) {
      const u = auth.currentUser;
      if (!u) throw new Error("Entre na sua conta para excluí-la.");
      const ultimo = Date.parse(u.metadata?.lastSignInTime || "") || 0;
      if (!u.isAnonymous && Date.now() - ultimo > 4 * 60 * 1000) {
        const pid = (u.providerData || []).find((p) => p.providerId === "google.com" || p.providerId === "microsoft.com")?.providerId;
        if (!pid) throw new Error("Por segurança, saia, entre de novo (com senha ou link por e-mail) e exclua a conta logo em seguida. Nada foi apagado.");
        const quem = pid === "google.com" ? "O Google" : "A Microsoft";
        try {
          await U.reauthenticateWithPopup(u, provedor(pid === "google.com" ? "google" : "microsoft"));
        } catch (e) {
          throw new Error(String(e?.code || "").includes("popup") ? `${quem} precisa confirmar que é você. Permita a janela e tente de novo.` : `${quem} não confirmou o login. Nada foi apagado.`);
        }
      }
      await apagaDados();
      try {
        await U.deleteUser(u);
      } catch (e) { falha(e); }
      limpaCacheDoAparelho();
    },
  };

  // Volta de um login por redirecionamento (popup bloqueado, app instalado).
  U.getRedirectResult(auth).then((r) => { if (r) aposLogin(r); }).catch((e) => { const t = traduzErro(e); if (t) aoErro(t); });
  // Chegou pelo link do e-mail.
  if (viaLink && U.isSignInWithEmailLink(auth, location.href)) {
    linkHref = location.href;
    auth.authStateReady().then(() => conta.concluiLink("").catch((e) => { if (e.message) aoErro(e.message); }));
  }
  U.onAuthStateChanged(auth, (u) => aoMudar(resumoUsuario(u), u));
  return conta;
}

/** Apaga deste aparelho o cache da conta (Firestore) ao sair, para a próxima pessoa não ver nada. */
export function limpaCacheDoAparelho() {
  try {
    const idb = /** @type {any} */ (globalThis.indexedDB);
    if (idb && idb.databases) idb.databases().then((ls) => ls.forEach((d) => { if (d.name && /^firestore\//.test(d.name)) idb.deleteDatabase(d.name); })).catch(() => {});
  } catch { /* sem IndexedDB */ }
}

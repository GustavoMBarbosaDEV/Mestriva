import { test } from "node:test";
import assert from "node:assert/strict";
import { ROTAS, resolve, voltaSegura } from "../js/rotas.js";

const ok = { logado: true, perfilCompleto: true };
const fora = { logado: false, perfilCompleto: false };

test("nomes das páginas", () => {
  const mapa = Object.fromEntries(ROTAS.map((r) => [r.caminho, r.pagina]));
  assert.deepEqual(mapa, {
    "/bem-vindo": "landing", "/login": "login", "/register": "register", "/forgot-password": "forgot-password",
    "/reset-password": "reset-password", "/onboarding": "onboarding", "/": "dashboard", "/calendario": "calendar",
    "/grade": "curriculum", "/estudar": "study", "/quiz": "quiz", "/notas": "grades", "/tutor": "tutor", "/ajustes": "settings",
  });
  assert.equal(ROTAS.find((r) => r.caminho === "/tutor").titulo, "Tutor");
});

test("barra final e consulta são ignoradas", () => {
  assert.equal(resolve("/calendario/", ok).pagina, "calendar");
  assert.equal(resolve("/grade?x=1#a", ok).pagina, "curriculum");
  assert.equal(resolve("", ok).pagina, "dashboard");
});

test("deslogado vai para a landing ou o login", () => {
  assert.equal(resolve("/", fora).redireciona, "/bem-vindo");
  assert.equal(resolve("/notas", fora).redireciona, "/login?volta=%2Fnotas");
  assert.equal(resolve("/onboarding", fora).redireciona, "/login?volta=%2Fonboarding");
  assert.equal(resolve("/login", fora).pagina, "login");
});

test("perfil incompleto vai para o onboarding", () => {
  const meio = { logado: true, perfilCompleto: false };
  assert.equal(resolve("/notas", meio).redireciona, "/onboarding");
  assert.equal(resolve("/onboarding", meio).pagina, "onboarding");
  assert.equal(resolve("/bem-vindo", meio).pagina, "landing");
});

test("logado não volta ao login nem ao onboarding pronto", () => {
  assert.equal(resolve("/onboarding", ok).redireciona, undefined); // dá para rever o questionário (link em Ajustes)
  assert.equal(resolve("/login", ok).redireciona, "/");
  assert.equal(resolve("/register", ok).redireciona, "/");
  assert.equal(resolve("/bem-vindo", ok).pagina, "landing");
});

test("caminho desconhecido", () => {
  const r = resolve("/xyz", ok);
  assert.equal(r.pagina, "nao-encontrada");
  assert.equal(r.redireciona, undefined);
  assert.equal(resolve("/xyz", fora).pagina, "nao-encontrada");
});

test("rota encontrada vem junto", () => {
  assert.equal(resolve("/notas", ok).rota.titulo, "Notas");
});

test("voltaSegura só aceita caminho interno", () => {
  assert.equal(voltaSegura("//mal.com"), "/");
  assert.equal(voltaSegura("/\\mal.com"), "/");
  assert.equal(voltaSegura("https://mal.com"), "/");
  assert.equal(voltaSegura(null), "/");
  assert.equal(voltaSegura("/notas"), "/notas");
  assert.equal(voltaSegura("/grade?x=1"), "/grade?x=1");
});

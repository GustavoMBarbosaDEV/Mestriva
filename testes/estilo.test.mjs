import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const css = () => fs.readFileSync(path.join(raiz, "style.css"), "utf8");

test("tem os tokens do tema claro e escuro", () => {
  const t = css();
  assert.match(t, /--background:\s*210 22% 98%/);
  assert.match(t, /\.dark\s*\{[^}]*--background:\s*222 40% 6%/);
});

test("tem as 4 famílias com @font-face local", () => {
  const t = css();
  const faces = t.match(/@font-face\s*\{[^}]*\}/g) || [];
  for (const familia of ["Space Grotesk", "Inter", "JetBrains Mono", "Atkinson Hyperlegible"]) {
    assert.ok(faces.some((f) => new RegExp(`font-family:\\s*["']?${familia}["']?`).test(f)), `falta ${familia}`);
  }
  for (const f of faces) {
    const urls = [...f.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]);
    assert.ok(urls.length > 0);
    for (const u of urls) {
      assert.match(u, /^\/fonts\//);
      assert.ok(fs.existsSync(path.join(raiz, u)), `arquivo não existe: ${u}`);
    }
  }
});

test("não usa Google Fonts", () => {
  const t = css();
  assert.ok(!t.includes("fonts.googleapis"));
  assert.ok(!t.includes("fonts.gstatic"));
});

test("tem as classes de componente", () => {
  const t = css();
  for (const sel of [".panel", ".panel-ticks::before", ".mono-label", ".study-prose h2", ".a11y-motion", ".cvd-protanopia", ".shimmer-text", ".aurora"]) {
    assert.ok(t.includes(sel), `falta ${sel}`);
  }
});

test("tem a animação de troca de página", () => {
  const t = css();
  assert.match(t, /\.pagina-entra\s*\{[^}]*animation:/);
  assert.match(t, /@keyframes pagina-entra/);
  assert.match(t, /\.a11y-motion \*/);
});

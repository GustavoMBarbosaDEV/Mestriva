// Grade curricular e notas.

export const PERIODOS = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º", "10º"];
export const CORES_MATERIA = ["#3B5BFF", "#12B76A", "#F79009", "#8B5CF6", "#F04438", "#0EA5E9"];

export function corDaMateria(nome = "") {
  let h = 0;
  for (let i = 0; i < nome.length; i += 1) h = (h * 31 + nome.charCodeAt(i)) % 9973;
  return CORES_MATERIA[h % CORES_MATERIA.length];
}

const porPeriodo = (a, b) => String(a || "").localeCompare(String(b || ""), "pt-BR", { numeric: true });

export function agrupaPorPeriodo(lista = []) {
  const grupos = new Map();
  for (const m of lista) {
    const chave = (m.period || "").trim() || "Sem período";
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(m);
  }
  return [...grupos.entries()]
    .sort((a, b) => (a[0] === "Sem período" ? 1 : b[0] === "Sem período" ? -1 : porPeriodo(a[0], b[0])))
    .map(([period, items]) => ({ period, items: items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) }));
}

export function lerGradeTexto(texto = "") {
  return String(texto)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^(\d{1,2})\s*[ºo°]?\s*[-–—:]\s*(.+)$/);
      if (m) return { period: `${m[1]}º`, name: m[2].trim() };
      return { period: "", name: l.replace(/^[-–—*•]\s*/, "").trim() };
    })
    .filter((x) => x.name.length > 1);
}

export function ordenaMaterias(lista = []) {
  return [...lista].sort((a, b) => porPeriodo(a.period, b.period) || (a.order ?? 0) - (b.order ?? 0));
}

/** Média em escala 0–10 (value/max_value*10), ignorando notas sem valor ou máximo. */
export function mediaNotas(notas = []) {
  const validas = notas.filter((n) => typeof n.value === "number" && typeof n.max_value === "number" && n.max_value > 0);
  if (!validas.length) return { media: null, n: 0 };
  const soma = validas.reduce((s, n) => s + (n.value / n.max_value) * 10, 0);
  return { media: Math.round((soma / validas.length) * 100) / 100, n: validas.length };
}

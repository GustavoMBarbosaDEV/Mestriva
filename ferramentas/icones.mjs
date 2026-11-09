// Gera js/icones.js com os ícones usados no Mestriva, em SVG inline (traço em currentColor).
// Lista dos ícones usados pelo app, mais o X do diálogo.
// Ícone novo: acrescente o nome (como no Lucide) em NOMES e rode: cd ferramentas && npm run icones
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));

export const NOMES = ["Accessibility", "AlertTriangle", "ArrowLeft", "ArrowRight", "Bell", "BellRing", "BookMarked", "BookOpen",
  "CalendarDays", "Check", "CheckCircle2", "ChevronLeft", "ChevronRight", "ChevronsUpDown", "Circle", "ClipboardCheck", "Clock",
  "Copy", "ExternalLink", "FileUp", "Focus", "GraduationCap", "LayoutDashboard", "Loader2", "Lock", "LogIn", "LogOut", "Mail",
  "MessageSquare", "Mic", "Moon", "Palette", "Pause", "Pencil", "Play", "Plus", "RefreshCw", "RotateCcw", "Send", "Settings",
  "ShieldCheck", "SkipForward", "Smartphone", "Sparkles", "Square", "Sun", "Target", "Trash2", "Upload", "UserPlus", "Volume2",
  "Wand2", "X", "XCircle", "Download", "Users", "School", "Library", "Landmark", "Stethoscope", "FlaskConical", "Search", "Building2", "Camera", "Eye", "EyeOff", "KeyRound", "Link"];

// Nomes antigos que mudaram de arquivo na lucide-static.
const APELIDO = {
  AlertTriangle: "triangle-alert",
  CheckCircle2: "circle-check",
  Loader2: "loader-circle",
  Wand2: "wand-sparkles",
  XCircle: "circle-x",
};

// Ícone do Google (colorido, sem traço).
const GOOGLE = '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>';

// Ícone da Microsoft (quatro quadrados coloridos).
const MICROSOFT = '<path d="M1 1h10.5v10.5H1z" fill="#F25022"/><path d="M12.5 1H23v10.5H12.5z" fill="#7FBA00"/><path d="M1 12.5h10.5V23H1z" fill="#00A4EF"/><path d="M12.5 12.5H23V23H12.5z" fill="#FFB900"/>';

const kebab = (n) => n.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([a-zA-Z])([0-9])/g, "$1-$2").toLowerCase();

function gera() {
  const icones = {};
  for (const nome of NOMES) {
    const arquivo = path.join(aqui, "node_modules", "lucide-static", "icons", (APELIDO[nome] || kebab(nome)) + ".svg");
    const svg = fs.readFileSync(arquivo, "utf8");
    const miolo = /<svg[^>]*>([\s\S]*)<\/svg>/.exec(svg)[1].replace(/\s*\n\s*/g, "").replace(/\s+\/>/g, "/>");
    icones[nome] = miolo;
  }
  const versao = JSON.parse(fs.readFileSync(path.join(aqui, "node_modules", "lucide-static", "package.json"), "utf8")).version;
  const js = `// Gerado por ferramentas/icones.mjs a partir de lucide-static ${versao} (ISC). Não edite à mão.
import { esc } from "./util.js";

export const NOMES = ${JSON.stringify(NOMES)};

/** @type {Record<string, string>} */
export const ICONE = ${JSON.stringify({ ...icones, Google: GOOGLE, Microsoft: MICROSOFT }, null, 0).replace(/","/g, '",\n  "')};

const TRACO = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

/** SVG inline do ícone. @param {string} nome @param {string} [classe] */
export function icone(nome, classe = "h-4 w-4") {
  const miolo = ICONE[nome];
  if (!miolo) throw new Error("ícone desconhecido: " + nome);
  const pintura = nome === "Google" || nome === "Microsoft" ? "" : " " + TRACO;
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"\${pintura} class="\${esc(classe)}" aria-hidden="true" focusable="false">\${miolo}</svg>\`;
}
`;
  fs.writeFileSync(path.join(aqui, "..", "js", "icones.js"), js);
  console.log(`js/icones.js: ${NOMES.length} ícones + Google`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) gera();

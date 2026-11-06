// Aplica tema e acessibilidade antes do primeiro desenho (evita piscar claro). Mesma lógica de js/preferencias.js.
(function () {
  try {
    var r = document.documentElement, a = {};
    try { a = JSON.parse(localStorage.getItem("mestriva.accessibility") || "{}") || {}; } catch (e) { a = {}; }
    var escuro = localStorage.getItem("mestriva.theme") === "dark";
    var s = Number(a.textScale);
    s = isFinite(s) && a.textScale !== null && a.textScale !== "" ? Math.min(145, Math.max(85, Math.round(s / 5) * 5)) : 100;
    r.classList.toggle("dark", escuro);
    r.style.colorScheme = escuro ? "dark" : "light";
    r.style.fontSize = s + "%";
    r.classList.toggle("a11y-contrast", a.highContrast === true);
    r.classList.toggle("a11y-dyslexia", a.dyslexia === true);
    r.classList.toggle("a11y-spacious", a.spacious === true);
    r.classList.toggle("a11y-motion", a.reduceMotion === true);
    ["protanopia", "deuteranopia", "tritanopia"].forEach(function (f) { r.classList.toggle("cvd-" + f, a.colorVision === f); });
  } catch (e) { /* segue com o padrão */ }
})();

// Tiny i18n. Languages: en, nl, pap.
// Each page loads dictionaries with SRC_I18N.add({ en:{...}, nl:{...}, pap:{...} }).
// Markup: data-i18n="key" (text), data-i18n-html="key" (allows <em>/<br>),
//         data-i18n-ph="key" (placeholder), data-i18n-aria="key" (aria-label).
// JS: SRC_I18N.t("key")  ·  re-render on change: document.addEventListener("langchange", fn)
(() => {
  const LANGS = ["en", "nl", "pap"];
  const dict = { en: {}, nl: {}, pap: {} };
  const read = () => {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) return q;
    try { const s = localStorage.getItem("src-lang"); if (LANGS.includes(s)) return s; } catch {}
    return "en";
  };
  let lang = read();

  const t = (key) => dict[lang][key] ?? dict.en[key] ?? key;

  const apply = (root = document) => {
    document.documentElement.lang = lang === "pap" ? "pap" : lang;
    root.querySelectorAll("[data-i18n]").forEach(el => (el.textContent = t(el.dataset.i18n)));
    root.querySelectorAll("[data-i18n-html]").forEach(el => (el.innerHTML = t(el.dataset.i18nHtml)));
    root.querySelectorAll("[data-i18n-ph]").forEach(el => (el.placeholder = t(el.dataset.i18nPh)));
    root.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    document.querySelectorAll("[data-lang-btn]").forEach(b => b.setAttribute("aria-pressed", b.dataset.langBtn === lang));
  };

  const set = (l) => {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l;
    try { localStorage.setItem("src-lang", l); } catch {}
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: l }));
  };

  window.SRC_I18N = {
    LANGS,
    get lang() { return lang; },
    add(d) { LANGS.forEach(l => Object.assign(dict[l], d[l] || {})); },
    t, apply, set
  };
})();

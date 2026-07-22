/* ==========================================================================
   RAWx LJ — i18n.js
   Lightweight in-memory language switcher for static GitHub Pages sites.
   No build step, no localStorage (per project convention) — language
   resets to browser default / EN on reload, switch is per-session only.
   Reuses the 7-language pattern from rawx-full-site.html, scoped to 5.
   ========================================================================== */
(function () {
  const SUPPORTED = ["en", "bn", "jp", "nl", "de"];
  const DEFAULT_LANG = "en";
  const DICT_PATH = (window.RAWX_I18N_BASE || "assets/i18n") + "/";

  let currentLang = DEFAULT_LANG;
  let dictionaries = {}; // lang -> flat key/value map

  function getNested(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  async function loadDict(lang) {
    if (dictionaries[lang]) return dictionaries[lang];
    try {
      const res = await fetch(`${DICT_PATH}${lang}.json`, { cache: "no-cache" });
      if (!res.ok) throw new Error(`i18n: failed to load ${lang}.json`);
      const json = await res.json();
      dictionaries[lang] = json;
      return json;
    } catch (err) {
      console.warn("[i18n]", err.message || err);
      return null;
    }
  }

  function applyTranslations(lang) {
    const dict = dictionaries[lang];
    const fallback = dictionaries[DEFAULT_LANG];
    if (!dict) return;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = getNested(dict, key) ?? getNested(fallback, key);
      if (val === undefined) return;
      // data-i18n-attr="placeholder" -> translate an attribute instead of textContent
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) {
        el.setAttribute(attr, val);
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const val = getNested(dict, key) ?? getNested(fallback, key);
      if (val !== undefined) el.innerHTML = val;
    });

    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langSwitch === lang);
    });
    currentLang = lang;
    window.dispatchEvent(new CustomEvent("rawx:langchange", { detail: { lang } }));
  }

  async function setLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = DEFAULT_LANG;
    await loadDict(DEFAULT_LANG); // always have fallback ready
    await loadDict(lang);
    applyTranslations(lang);
  }

  function buildSwitcher() {
    const mount = document.querySelector("[data-lang-mount]");
    if (!mount) return;
    const LABELS = { en: "EN", bn: "বাং", jp: "日本語", nl: "NL", de: "DE" };
    mount.innerHTML = SUPPORTED.map(
      (l) => `<button type="button" data-lang-switch="${l}" class="${l === currentLang ? "active" : ""}">${LABELS[l]}</button>`
    ).join("");
    mount.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lang-switch]");
      if (btn) setLang(btn.dataset.langSwitch);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    buildSwitcher();
    // detect browser language once per session (in-memory only, no persistence)
    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    const initial = SUPPORTED.includes(browserLang) ? browserLang : DEFAULT_LANG;
    await setLang(initial);
  });

  window.RAWX_I18N = { setLang, get currentLang() { return currentLang; } };
})();

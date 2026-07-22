/* ==========================================================================
   RAWx LJ — ai-widgets.js  (Phase 4: AI-Powered Layer)

   IMPORTANT — SECURITY NOTE FOR JESSIKA:
   This file never calls api.anthropic.com directly. An API key in
   client-side JS on a public GitHub Pages site would be visible to anyone
   who opens dev tools — it would get scraped and abused within hours.
   Instead, every widget below POSTs to YOUR OWN small server endpoint
   (a Cloudflare Worker — see /automation/cloudflare-worker-proxy.js),
   which holds the real Claude API key as a secret and forwards requests.
   Set the two endpoint URLs below once you've deployed the worker.
   ========================================================================== */

window.RAWX_AI_ENDPOINTS = window.RAWX_AI_ENDPOINTS || {
  matcher: "https://rawx-ai-proxy.<your-subdomain>.workers.dev/match",
  chat: "https://rawx-ai-proxy.<your-subdomain>.workers.dev/chat",
  // RFQ triage posts straight to a Make.com webhook (fire-and-forget, async is fine here)
  rfqTriage: "https://hook.us1.make.com/<your-webhook-id>"
};

(function () {
  const T = (key) => (window.RAWX_I18N ? getNested(currentDict(), key) : key);
  function currentDict() {
    // ai-widgets.js loads after i18n.js; reuse whatever dict is already applied
    return {};
  }
  function getNested(obj, path) {
    return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  }

  /* ---------------- 4.1 AI Buyer-Matching Tool ---------------- */
  function initBuyerMatcher() {
    const mount = document.querySelector("[data-ai-buyer-match]");
    if (!mount) return;

    mount.innerHTML = `
      <div class="ai-matcher">
        <span class="eyebrow" data-i18n="ai.matcher_title"></span>
        <p data-i18n="ai.matcher_tagline" style="margin-top:10px;"></p>
        <form class="ai-matcher-form">
          <div class="field">
            <label data-i18n="ai.matcher_moq"></label>
            <input type="number" min="1" name="moq" required placeholder="200">
          </div>
          <div class="field">
            <label data-i18n="ai.matcher_budget"></label>
            <input type="number" min="1" name="budget" required placeholder="65">
          </div>
          <div class="field">
            <label data-i18n="ai.matcher_market"></label>
            <input type="text" name="market" required placeholder="Germany / EU">
          </div>
          <button type="submit" class="btn btn-solid" data-i18n="ai.matcher_submit"></button>
        </form>
        <div class="ai-matcher-result" style="display:none;"></div>
      </div>
    `;
    if (window.RAWX_I18N) window.RAWX_I18N.setLang(window.RAWX_I18N.currentLang);

    const form = mount.querySelector(".ai-matcher-form");
    const resultBox = mount.querySelector(".ai-matcher-result");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        moq: fd.get("moq"),
        budget: fd.get("budget"),
        market: fd.get("market"),
        lang: window.RAWX_I18N ? window.RAWX_I18N.currentLang : "en"
      };
      resultBox.style.display = "block";
      resultBox.textContent = "…";

      try {
        const res = await fetch(window.RAWX_AI_ENDPOINTS.matcher, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        // Expected shape: { category, catalogAnchor, reasoning }
        resultBox.innerHTML = `
          <div class="ai-matcher-card">
            <strong>${data.category}</strong>
            <p>${data.reasoning || ""}</p>
            <a class="btn" href="catalog.html#${data.catalogAnchor || ""}">View Category →</a>
          </div>`;
      } catch (err) {
        console.warn("[ai-matcher]", err);
        resultBox.textContent = "";
        resultBox.style.display = "none";
        alert("Couldn't reach the matching service — please use Request a Quote instead.");
      }
    });
  }

  /* ---------------- 4.2 Automated RFQ Triage ---------------- */
  // Fires alongside the existing front-end-only contact form demo handler.
  // Fire-and-forget: never blocks or delays the visible "message sent" state.
  function initRfqTriage() {
    const form = document.querySelector("form[data-rfq]");
    if (!form) return;

    form.addEventListener("submit", () => {
      const fields = form.querySelectorAll("input, select, textarea");
      const raw = {};
      fields.forEach((f) => {
        const label = f.closest(".field")?.querySelector("label")?.textContent || f.name || "field";
        raw[label] = f.value;
      });
      // Fire-and-forget POST to Make.com webhook; Make.com scenario calls Claude
      // API server-side to tag category/urgency/language, then writes the row
      // to the "Buyer Inquiries" Airtable table (see automation/airtable-schema.md).
      fetch(window.RAWX_AI_ENDPOINTS.rfqTriage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "contact_form", submittedAt: new Date().toISOString(), fields: raw }),
        keepalive: true
      }).catch((err) => console.warn("[rfq-triage] webhook unreachable (non-blocking)", err));
    });
  }

  /* ---------------- 4.3 Multilingual AI Chat Widget ---------------- */
  function initChatWidget() {
    if (document.querySelector(".ai-chat-launcher")) return; // one instance site-wide

    const launcher = document.createElement("button");
    launcher.className = "ai-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open chat");
    launcher.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h16v12H7l-3 3z"/></svg>`;
    document.body.appendChild(launcher);

    const panel = document.createElement("div");
    panel.className = "ai-chat-panel";
    panel.innerHTML = `
      <div class="ai-chat-head">
        <span data-i18n="ai.chat_title"></span>
        <button type="button" class="ai-chat-close" aria-label="Close">✕</button>
      </div>
      <div class="ai-chat-messages"></div>
      <form class="ai-chat-form">
        <input type="text" data-i18n="ai.chat_placeholder" data-i18n-attr="placeholder" required>
        <button type="submit" data-i18n="ai.chat_send"></button>
      </form>
      <p class="ai-chat-disclaimer" data-i18n="ai.chat_disclaimer"></p>
    `;
    document.body.appendChild(panel);
    if (window.RAWX_I18N) window.RAWX_I18N.setLang(window.RAWX_I18N.currentLang);

    const messages = panel.querySelector(".ai-chat-messages");
    const form = panel.querySelector(".ai-chat-form");
    const input = form.querySelector("input");
    let history = [];

    function addMsg(role, text) {
      const div = document.createElement("div");
      div.className = `ai-chat-msg ${role}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    launcher.addEventListener("click", () => panel.classList.toggle("open"));
    panel.querySelector(".ai-chat-close").addEventListener("click", () => panel.classList.remove("open"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      addMsg("user", text);
      history.push({ role: "user", content: text });
      input.value = "";

      const thinking = document.createElement("div");
      thinking.className = "ai-chat-msg assistant thinking";
      thinking.textContent = "…";
      messages.appendChild(thinking);

      try {
        const res = await fetch(window.RAWX_AI_ENDPOINTS.chat, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            lang: window.RAWX_I18N ? window.RAWX_I18N.currentLang : "en"
          })
        });
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        thinking.remove();
        addMsg("assistant", data.reply || "");
        history.push({ role: "assistant", content: data.reply || "" });
      } catch (err) {
        thinking.remove();
        console.warn("[ai-chat]", err);
        addMsg("assistant", "Sorry — I couldn't reach the assistant right now. Please use Request a Quote.");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBuyerMatcher();
    initRfqTriage();
    initChatWidget();
  });
})();

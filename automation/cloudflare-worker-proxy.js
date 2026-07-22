/**
 * RAWx LJ — Cloudflare Worker proxy for Claude API
 * ------------------------------------------------------------
 * Why this exists: ai-widgets.js on the public site must never hold an
 * Anthropic API key — anything shipped to the browser can be read by
 * anyone with dev tools open. This Worker sits between the site and
 * Claude, holding the real key as an encrypted secret.
 *
 * DEPLOY STEPS (Spck/mobile-friendly, no local Node needed):
 *   1. Sign up / log in at https://dash.cloudflare.com
 *   2. Workers & Pages -> Create -> Create Worker
 *   3. Name it e.g. "rawx-ai-proxy" -> Deploy
 *   4. Click "Edit code" and paste this whole file in, replacing the default
 *   5. Settings -> Variables -> add an encrypted secret:
 *        Name: ANTHROPIC_API_KEY   Value: <your real key>
 *   6. Save and deploy. Your worker URL will look like:
 *        https://rawx-ai-proxy.<your-subdomain>.workers.dev
 *   7. In assets/ai-widgets.js, set RAWX_AI_ENDPOINTS.matcher to
 *      "<that-url>/match" and .chat to "<that-url>/chat"
 *   8. (Recommended) Settings -> Triggers -> Custom Domain, so the URL
 *      looks like ai.handsandhead.com instead of *.workers.dev
 *
 * This Worker only ever talks to Anthropic server-side. It also restricts
 * which origins may call it (CORS allow-list below) so random sites can't
 * ride on your API quota.
 */

const ALLOWED_ORIGINS = [
  "https://jacket.handsandhead.com",
  "http://localhost:8080" // for local testing in Spck's preview server
];

const MODEL = "claude-sonnet-4-6";

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function callClaude(env, messages, system) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system,
      messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }
  return res.json();
}

const MATCHER_SYSTEM = `You are a B2B catalog-matching assistant for RAWx LJ, a leather jacket
manufacturer in Dhaka, Bangladesh. Given a buyer's MOQ, target unit budget in USD, and market,
respond ONLY with a JSON object, no preamble, no markdown fences, in this exact shape:
{"category": "<one of: Biker Jackets, Bomber Jackets, Varsity Jackets, Leather Vests, Trench & Coats, Shearling & Fur, Custom / OEM>",
 "catalogAnchor": "<one of: biker, bomber, varsity, vest, trench, shearling>",
 "reasoning": "<one short sentence, in the buyer's language if the request specifies a non-English lang field, explaining the fit>"}
Rules: low budgets (<$40/unit) and MOQ under 100 lean toward stock styles (biker/bomber/varsity/vest).
Budgets above $90/unit or MOQ above 300 with a "your brand"-style ask lean toward Custom / OEM.
Shearling/trench are cold-market fits (Europe, North America, Japan winter markets).`;

const CHAT_SYSTEM = `You are a helpful, concise multilingual assistant for RAWx LJ, a B2B leather
jacket manufacturer in Dhaka, Bangladesh (MOQ from 50 units, sample-to-bulk 18-25 days,
full-grain and suede leather, private-label/OEM available). Answer buyer questions about
materials, MOQ, lead times, and process. Reply in the same language the buyer's "lang" field
indicates (en/bn/jp/nl/de). Keep answers under 80 words. For anything requiring a binding
quote or price, tell them to use the "Request a Quote" page rather than quoting a price yourself.`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/match") {
        const { moq, budget, market, lang } = await request.json();
        const userMsg = `MOQ: ${moq}, Budget per unit: $${budget}, Market: ${market}, lang: ${lang || "en"}`;
        const data = await callClaude(env, [{ role: "user", content: userMsg }], MATCHER_SYSTEM);
        const text = data.content?.find((b) => b.type === "text")?.text || "{}";
        let parsed;
        try {
          parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch {
          parsed = { category: "Custom / OEM", catalogAnchor: "", reasoning: "" };
        }
        return new Response(JSON.stringify(parsed), {
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      if (url.pathname === "/chat") {
        const { messages, lang } = await request.json();
        const taggedMessages = messages.slice(-10); // cap history sent per call
        const data = await callClaude(
          env,
          [...taggedMessages, { role: "user", content: `(lang: ${lang || "en"})` }].length
            ? taggedMessages
            : taggedMessages,
          CHAT_SYSTEM
        );
        const reply = data.content?.find((b) => b.type === "text")?.text || "";
        return new Response(JSON.stringify({ reply }), {
          headers: { ...headers, "Content-Type": "application/json" },
        });
      }

      return new Response("Not found", { status: 404, headers });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  },
};

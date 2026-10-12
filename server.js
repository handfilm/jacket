import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Initialize Google Gen AI client if key is provided
let aiClient = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn('[GenAI] Initialization failed:', err.message);
  }
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

// In-memory store for RFQs
const receivedRFQs = [];

// API Route: Buyer Matcher
app.post(['/api/match', '/match'], async (req, res) => {
  const { moq, budget, market, lang } = req.body || {};
  const userLang = lang || 'en';

  if (aiClient) {
    try {
      const userPrompt = `MOQ: ${moq}, Budget per unit: $${budget}, Market: ${market}, lang: ${userLang}`;
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${MATCHER_SYSTEM}\n\nBuyer input:\n${userPrompt}` }] }
        ]
      });

      const text = response?.text || '';
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return res.json(parsed);
    } catch (err) {
      console.warn('[api/match] GenAI error, using rule fallback:', err.message);
    }
  }

  // Deterministic rule-based fallback
  const b = Number(budget) || 50;
  const q = Number(moq) || 100;
  let category = 'Biker Jackets';
  let catalogAnchor = 'biker';
  let reasoning = 'Recommended classic full-grain biker styles matching your budget and production scale.';

  if (b >= 90 || q >= 300) {
    category = 'Custom / OEM';
    catalogAnchor = 'oem';
    if (userLang === 'bn') reasoning = 'উচ্চ বাজেট এবং ভলিউমের জন্য কাস্টম প্রাইভেট-লেবেল ও স্পেক ওরিয়েন্টেড উৎপাদন প্রযোজ্য।';
    else if (userLang === 'de') reasoning = 'Optimal für maßgeschneiderte Private-Label-Produktion und Premium-Spezifikationen.';
    else if (userLang === 'jp') reasoning = 'カスタムOEMおよびプライベートレーベル生産に最適なスペックです。';
    else if (userLang === 'nl') reasoning = 'Ideaal voor op maat gemaakte private label productie en premium leerkwaliteit.';
    else reasoning = 'Recommended for custom private-label tooling, hardware customization, and OEM development.';
  } else if (b < 45) {
    category = 'Varsity & Bomber Jackets';
    catalogAnchor = 'bomber';
    if (userLang === 'bn') reasoning = 'সাশ্রয়ী ইউনিট খরচে প্রিমিয়াম জ্যাকেট উৎপাদনের জন্য বোম্বার বা ভার্সিটি স্টাইল আদর্শ।';
    else if (userLang === 'de') reasoning = 'Kosteneffiziente Bomber- und Varsity-Modelle für den Einstiegsbereich.';
    else if (userLang === 'jp') reasoning = '費用対効果の高いボンバーおよびスタジャンコレクション。';
    else if (userLang === 'nl') reasoning = 'Kostenefficiënte bomber- en varsity modellen met soepel leer.';
    else reasoning = 'Cost-effective high-durability silhouettes ideal for targeted price points.';
  } else {
    const marketStr = (market || '').toLowerCase();
    if (marketStr.includes('germany') || marketStr.includes('japan') || marketStr.includes('eu') || marketStr.includes('cold') || marketStr.includes('winter')) {
      category = 'Shearling & Trench';
      catalogAnchor = 'shearling';
      if (userLang === 'de') reasoning = 'Warm gefütterte Shearling- und Trench-Kollektion für mitteleuropäische Märkte.';
      else if (userLang === 'jp') reasoning = '寒冷地市場向けのシアリングおよびトレンチコレクション。';
      else reasoning = 'Insulated premium leather and shearling tailored for cold-weather B2B markets.';
    }
  }

  return res.json({ category, catalogAnchor, reasoning });
});

// API Route: Assistant Chat
app.post(['/api/chat', '/chat'], async (req, res) => {
  const { messages, lang } = req.body || {};
  const userLang = lang || 'en';

  if (aiClient && Array.isArray(messages) && messages.length > 0) {
    try {
      const historySummary = messages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n');
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${CHAT_SYSTEM}\n\nBuyer language: ${userLang}\nConversation:\n${historySummary}` }] }
        ]
      });

      const reply = response?.text?.trim() || '';
      if (reply) return res.json({ reply });
    } catch (err) {
      console.warn('[api/chat] GenAI error, using rule fallback:', err.message);
    }
  }

  // Intelligent multilingual fallback
  const lastMsg = (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : '').toLowerCase();
  let reply = '';

  if (userLang === 'bn') {
    if (lastMsg.includes('moq') || lastMsg.includes('পরিমাণ')) {
      reply = 'আমাদের সর্বনিম্ন অর্ডারের পরিমাণ (MOQ) মাত্র ৫০ পিস প্রতি স্টাইল। বাল্ক উৎপাদনের আগে আমরা স্যাম্পল তৈরি করি। বিস্তারিত জানার জন্য Request a Quote ব্যবহার করুন।';
    } else {
      reply = 'RAWx LJ ঢাকায় অবস্থিত একটি বি২বি চামড়ার জ্যাকেট প্রস্তুতকারক। আমাদের স্যাম্পল থেকে বাল্ক সময় ১৮-২৫ দিন, সম্পূর্ণ খাঁটি চামড়া ও কাস্টম ব্র্যান্ডিং সুবিধা রয়েছে। নির্দিষ্ট তথ্যের জন্য Request a Quote দেখুন।';
    }
  } else if (userLang === 'de') {
    if (lastMsg.includes('moq') || lastMsg.includes('menge') || lastMsg.includes('mindest')) {
      reply = 'Unsere Mindestbestellmenge (MOQ) beträgt 50 Stück pro Modell. Musterlaufzeit: 7-10 Tage, Großserie 18-25 Tage. Für Preisangebote nutzen Sie bitte "Request a Quote".';
    } else {
      reply = 'RAWx LJ ist ein B2B-Lederjackenhersteller aus Dhaka, Bangladesch (Vollnarbenleder, Private-Label, OEM, MOQ ab 50 Einheiten). Für verbindliche Angebote nutzen Sie bitte "Request a Quote".';
    }
  } else if (userLang === 'jp') {
    reply = 'RAWx LJはバングラデシュ・ダッカのB2B革ジャケット製造工場です。最小注文数（MOQ）は50着から、サンプル納期は約7〜10日、量産は18〜25日です。見積もりは「Request a Quote」よりお問い合わせください。';
  } else if (userLang === 'nl') {
    reply = 'RAWx LJ is een B2B leerjassenfabrikant in Dhaka, Bangladesh (MOQ vanaf 50 stuks, levertijd 18-25 dagen, volnerfleer en OEM-productie). Vraag voor offertes een offerte aan via "Request a Quote".';
  } else {
    if (lastMsg.includes('moq') || lastMsg.includes('minimum')) {
      reply = 'Our minimum order quantity (MOQ) starts at 50 units per style across mixed sizes. Sample lead time is 7–10 days, with bulk delivery in 18–25 days.';
    } else if (lastMsg.includes('material') || lastMsg.includes('leather') || lastMsg.includes('hide')) {
      reply = 'We specialize in premium full-grain cowhide, sheepskin nappa, goatskin suede, and shearling with YKK hardware and custom linings.';
    } else if (lastMsg.includes('sample') || lastMsg.includes('prototype') || lastMsg.includes('tech pack')) {
      reply = 'We can develop physical prototypes from your tech pack or reference sample within 7–10 days before bulk sign-off.';
    } else {
      reply = 'Welcome to RAWx LJ. We manufacture wholesale, OEM, and private-label leather jackets in Dhaka, Bangladesh with an MOQ of 50 units and 18–25 day production cycles. For custom quotes, please submit our Request a Quote form!';
    }
  }

  return res.json({ reply });
});

// API Route: RFQ Triage
app.post(['/api/rfq-triage', '/rfq-triage'], (req, res) => {
  const { source, submittedAt, fields } = req.body || {};
  const rfqEntry = {
    id: `rfq_${Date.now()}`,
    source: source || 'web_form',
    submittedAt: submittedAt || new Date().toISOString(),
    fields: fields || {},
  };
  receivedRFQs.push(rfqEntry);
  console.log(`[RFQ] New inquiry received from ${fields?.['Buyer Name / Company'] || fields?.name || 'anonymous buyer'}`);
  return res.json({ success: true, message: 'Inquiry registered', id: rfqEntry.id });
});

// Serve named routes
const routeFiles = {
  '/': 'index.html',
  '/catalog': 'catalog.html',
  '/custom-orders': 'custom-orders.html',
  '/blog': 'blog.html',
  '/contact': 'contact.html',
  '/about': 'about.html',
};

for (const [route, file] of Object.entries(routeFiles)) {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
}

// Serve all static files from root directory
app.use(express.static(__dirname));

// Fallback to index.html for unrecognized routes
app.use((req, res) => {
  const requestedPath = path.join(__dirname, req.path);
  if (fs.existsSync(requestedPath) && !fs.statSync(requestedPath).isDirectory()) {
    return res.sendFile(requestedPath);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`[RAWx LJ Server] Running on http://${HOST}:${PORT}`);
});

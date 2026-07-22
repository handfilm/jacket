# RAWx LJ — All-Phases Build Notes

## What's fully done

**Phase 1 — Journal/Blog:** `blog.html`, `assets/blog/blog-data.json`, nav updated
site-wide. Grid, filters, lightbox, lazy reveal all work. Sample manifest entries
point at filenames that don't exist yet — drop real photos into
`assets/blog/<category>/` using the `blog-[category]-[NN].jpg` naming convention
and they'll appear (or wait for the Phase 3 pipeline to do it automatically).

**Phase 2 — Multilingual framework:** `assets/i18n.js` + 5 language files under
`assets/i18n/`. Nav, footer, topbar, and the Journal page are fully translated
and switchable live (button in the top nav, no page reload). Index page's hero
is also fully wired as the reference example.

*Scoped down on purpose:* the body copy on about/catalog/custom-orders/contact
is still English-only. That's real commercial copy in 4 languages — hundreds of
strings — and machine-translating a wholesale/legal-adjacent page without your
review felt like the wrong call. The pattern to extend it is identical to what's
already on the hero: wrap the string in a `data-i18n="section.key"` tag, add the
key to all 5 JSON files. Happy to do a page at a time whenever you want.

**Phase 3 — Backend hardening:** `automation/make-scenario-blueprint.json` (Drive
→ GitHub → Airtable auto-publish pipeline for new journal photos) and
`automation/airtable-schema.md` (3-table CRM/editorial schema). These are
blueprints, not live automations — importing the Make.com JSON still requires
you to reconnect each module to your actual Drive/GitHub/Airtable accounts.

**Phase 4 — AI layer:** `assets/ai-widgets.js` (buyer matcher on
custom-orders.html, RFQ auto-triage on the contact form, floating chat widget
site-wide) plus `automation/cloudflare-worker-proxy.js`.

## One important change from the original plan

The plan called for embedding Claude API calls directly in the site's JS. I
didn't build it that way — an API key shipped to the browser on a public
GitHub Pages site is visible to anyone who opens dev tools, and it would get
scraped and run up your bill within hours. Instead:

- The **buyer matcher** and **chat widget** call a small Cloudflare Worker
  (`automation/cloudflare-worker-proxy.js`) that holds your real API key as an
  encrypted secret and forwards requests to Claude server-side. Deploy steps
  are in the comment at the top of that file — no local Node needed, it's all
  done through the Cloudflare dashboard, so it works fine from your phone.
- The **RFQ triage** posts to a Make.com webhook instead (fits your existing
  stack — Make.com can call Claude itself as an HTTP module and write straight
  to Airtable).

Before any of Phase 4 goes live you need to:
1. Deploy the Cloudflare Worker and put your Anthropic API key in as a secret
2. Update the two placeholder URLs at the top of `assets/ai-widgets.js`
   (`RAWX_AI_ENDPOINTS.matcher`, `.chat`, `.rfqTriage`)
3. Build the actual Make.com scenario from the blueprint JSON and get its
   webhook URL

## File map

```
index.html, about.html, catalog.html, contact.html, custom-orders.html  (patched)
blog.html                          (new — Phase 1)
CNAME
assets/
  i18n.js                          (Phase 2)
  i18n/{en,bn,jp,nl,de}.json        (Phase 2)
  ai-widgets.js                     (Phase 4)
  blog/blog-data.json               (Phase 1)
  blog/<category>/                  (empty — drop real photos here)
automation/
  make-scenario-blueprint.json      (Phase 3)
  airtable-schema.md                (Phase 3)
  cloudflare-worker-proxy.js        (Phase 4)
```

Everything is still single/minimal-file per page, Spck Editor-friendly — no
build step anywhere.

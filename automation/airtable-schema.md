# Airtable Base Schema — RAWx LJ Operations

One base, three tables. Designed to sit behind the Make.com scenarios in
`make-scenario-blueprint.json` and the Phase 4 AI widgets.

## Table 1 — `Buyer Inquiries` (CRM + RFQ triage)

| Field              | Type                | Notes |
|---------------------|---------------------|-------|
| Inquiry ID          | Autonumber          | Primary key |
| Name                | Single line text    | From contact form |
| Company             | Single line text    | |
| Email                | Email               | |
| Country / Market     | Single select        | Populated from Apollo.io enrichment |
| Message              | Long text            | Raw form submission |
| AI Category Tag      | Single select        | biker / bomber / varsity / vest / trench / shearling / custom-oem — set by Phase 4 RFQ Triage |
| AI Urgency Tag        | Single select        | low / medium / high — set by Phase 4 RFQ Triage |
| AI Detected Language  | Single select         | en / bn / jp / nl / de / other |
| MOQ Mentioned         | Number                | Parsed from message if present |
| Status                | Single select         | New → Triaged → Contacted → Quoted → Won / Lost |
| Source                | Single select         | Contact Form / AI Buyer Match / Chat Widget |
| Created At             | Created time          | |

## Table 2 — `Journal Entries` (editorial queue for blog-data.json)

| Field           | Type              | Notes |
|------------------|-------------------|-------|
| Entry ID          | Single line text  | Matches `id` in blog-data.json, e.g. `biker-04` |
| Category          | Single select      | factory / materials / biker / bomber / varsity / trench-shearling / qc-export / team-bts |
| Type               | Single select      | image / video |
| Drive File          | URL                | Link back to source file in Drive |
| Caption             | Long text           | Filled in by editorial before publish |
| Linked Catalog Anchor | Single line text  | e.g. `catalog.html#biker` |
| Status               | Single select        | Needs Caption → Ready → Published |
| Date Added            | Date                  | |

## Table 3 — `AI Buyer Match Log`

| Field            | Type            | Notes |
|-------------------|-----------------|-------|
| Log ID             | Autonumber       | |
| MOQ Input           | Number            | |
| Budget Input (USD)  | Currency           | |
| Market Input         | Single line text   | |
| Matched Category      | Single select        | Result the AI matcher returned |
| Converted To Inquiry?  | Checkbox              | Manually ticked if the buyer later submitted the contact form |
| Created At              | Created time            | |

## Relationships

- `Buyer Inquiries.Source = "AI Buyer Match"` rows should link (via a linked-record
  field, added once both tables exist) to the corresponding `AI Buyer Match Log` row —
  lets you measure matcher → real-inquiry conversion.
- `Journal Entries` doesn't need to link anywhere; it's a one-way editorial queue
  feeding the static `blog-data.json` manifest.

## Views worth setting up

- **Buyer Inquiries:** a "Needs Triage" view filtered on `Status = New`, sorted by
  `AI Urgency Tag` descending.
- **Journal Entries:** a "Needs Caption" view for whoever writes journal copy.

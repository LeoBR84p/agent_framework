# AIz Intel — Proprietary Agentic Framework
## CLAUDE.md — Definitive Rule Document for LLM Agents

This document governs how AI agents (Claude and others) interact with, update, and maintain
this knowledge management framework. Read this before modifying any file.

---

## 1. Framework Overview and Purpose

**AIz Intel** is a GitHub template repository that provides a complete knowledge management
system for tech startups. It is deployed as a static website on Vercel with Firebase Google
OAuth authentication. One instance is deployed per project (one GitHub repo fork per company).

**Primary audiences:**
- Solo founder + co-founders (day-to-day document management)
- Developers (technical documentation, setup guides)
- Investors and stakeholders (read-only investor portal with NDA gate)

**Core principle:** HTML files are the single source of truth. Firestore stores only
authentication data (allowedUsers collection) and never document content.

**Scale target:** Supports 10+ simultaneous projects, each as an independent fork.

---

## 2. Division Structure

All documents are organized into 5 divisions plus a framework root:

```
/                          Root (dashboard, auth, search, config)
/business/                 Business strategy documents (8 docs)
/technology/               Technical documentation (6 docs)
/brand/                    Brand identity (1 doc)
/operations/               Operations + legal documents (9 docs)
/investor-relations/       Investor-facing materials (2 docs)
/investor/                 External investor portal (NDA-gated, 2 docs)
```

### Document Inventory

| Division | File | Purpose |
|----------|------|---------|
| Root | index.html | Main dashboard after login |
| Root | auth.html | Firebase OAuth gate |
| Root | search.html | Global document search |
| Root | setup_checklist.html | New project initialization guide |
| Business | idea.html | Problem, solution, UVP, validation |
| Business | business_plan.html | BMC, TAM/SAM/SOM, revenue model, team |
| Business | economics.html | Projections, break-even, CAC/LTV, cash flow |
| Business | pricing.html | Pricing tiers, competitor matrix, value perception |
| Business | competitor_analysis.html | Competitive landscape, feature matrix, SWOT |
| Business | launch_plan.html | GTM phases, early adopters, channel strategy |
| Business | marketing.html | ICP, messaging matrix, campaigns |
| Business | risk.html | Risk register, heat map, mitigation tracker |
| Technology | tech_plan.html | Architecture, stack decisions, sprints, API |
| Technology | zero_hero.html | Dev onboarding, bootstrap commands, gotchas |
| Technology | db_schema.html | Database schema, indexes, migrations |
| Technology | code_review.html | Code issue register with severity tracking |
| Technology | disaster_recovery.html | Runbooks, RTO/RPO, escalation, post-mortems |
| Technology | roadmap.html | Timeline swimlanes, milestone definitions |
| Brand | brand_guidelines.html | Logo, colors, typography, tone of voice |
| Operations | cost_tracking.html | Expense log, burn rate, runway |
| Operations | operational_costs.html | SaaS/infra costs, contractors, unit economics |
| Operations | okr_kpi.html | Quarterly OKRs, KPI dashboard |
| Operations | customer_support.html | Support tiers, SLAs, FAQ, escalation |
| Operations | customer_memory.html | Customer CRM cards |
| Operations | terms_of_service.html | ToS legal document |
| Operations | privacy_policy.html | Privacy policy (GDPR, LGPD, CCPA) |
| Operations | cookie_policy.html | Cookie types, consent, opt-out |
| Operations | dpa_sla.html | DPA and SLA agreement |
| Investor Relations | investor-relations/pitch.html | Full investor pitch deck |
| Investor Relations | investor-relations/investor_memory.html | Investor CRM pipeline |
| Investor | investor/index.html | External NDA-gated investor portal |
| Investor | investor/due_diligence.html | DD checklist for investor review |

---

## 3. Naming Conventions

### File Names
- All lowercase, underscores for spaces: `business_plan.html`, `tech_plan.html`
- No index.html in subdirectories except `/investor/index.html`
- Config files: `project_config.json`, `metrics.json`

### CSS Class Names
- Component classes: `.doc-card`, `.nav-link`, `.status-badge`
- Division badge modifier: `.division-badge.business`, `.division-badge.technology`
- Status badge attribute: `data-status="draft|in-progress|review|final"`
- BEM-inspired but not strict BEM

### Section IDs (HTML)
- Lowercase with hyphens: `id="problem-statement"`, `id="tam-sam-som"`
- Must match entries in `window.PAGE_REQUIRED_SECTIONS` array
- Must be unique per page

### CSS Custom Properties (Design Tokens)
- Colors: `--brand-primary`, `--bg`, `--text-secondary`
- Spacing: `--space-4` (1rem), `--space-8` (2rem), etc.
- Division colors: `--div-business`, `--div-technology`, etc.
- All tokens defined in `assets/design_system.css`
- Per-project overrides go in `assets/project_theme.css` ONLY

---

## 4. How to Initialize a New Project

Follow `setup_checklist.html` in order. Summary:

### Step 1: Fork and Configure
1. Fork or use this repo as a GitHub template
2. Update `project_config.json`:
   - Set `name`, `tagline`, `stage`, `lastUpdated`
   - Add team members array
   - Add `allowedUsers` emails
   - Add `investorAllowedUsers` emails
   - Set `externalLinks` (GitHub, Figma, Notion, etc.)
3. Replace `assets/logo.svg` with your project logo
4. Add `assets/favicon.ico`
5. Customize `assets/project_theme.css`:
   - Set `--brand-primary`, `--brand-accent`
   - Set `--font-brand`, `--font-sans` if custom fonts

### Step 2: Firebase Authentication
1. Create Firebase project at console.firebase.google.com
2. Enable Google Authentication
3. Create Firestore database
4. For each authorized user, create a document in `allowedUsers` collection
   with the user's email as the document ID (no fields needed)
5. Replace `window.FIREBASE_CONFIG` in ALL HTML files with your config:
   - auth.html, index.html, and all division HTML files
6. Update `.firebaserc` with your Firebase project ID
7. Add authorized domains in Firebase > Authentication > Settings

### Step 3: Vercel Deployment
1. Import GitHub repo into Vercel
2. Framework Preset: Other
3. Output directory: `.` (root)
4. No build command needed
5. Add Vercel domain to Firebase authorized domains

### Step 4: Fill Content
- Fill all documents in order: idea → business_plan → economics → pricing
- For each document, replace all `<!-- FILL: ... -->` comments
- Update status badges as sections are completed
- Update `metrics.json` with initial values

### Step 5: Verify
- Test auth flow (sign out, visit protected page, sign in)
- Test investor portal NDA gate
- Test on mobile (375px)
- Test print/PDF on business_plan.html
- Test dark/light mode toggle
- Test global search

---

## 5. How to Update an Existing Document

1. **Always add a changelog entry** at the bottom of the document
   - Format: `YYYY-MM-DD | v0.X | Author Name | What changed`
2. **Update the status badge** if the document's completeness level has changed
3. **Run completeness check**: Does `window.PAGE_REQUIRED_SECTIONS` reflect all sections?
4. **Cross-check consistency rules** (see Section 6)
5. **Update `project_config.json`** `lastUpdated` field after significant updates

### Status Badge Rules
| Status | When to Use |
|--------|-------------|
| `draft` | Initial skeleton, most FILL comments remain |
| `in-progress` | Actively being written, at least 30% filled |
| `review` | Content complete, awaiting review/approval |
| `final` | Reviewed, approved, published |

---

## 6. Cross-File Consistency Rules

These rules MUST be enforced. When updating one file, check all related files.

### Financial Consistency
| If you change... | Also update... |
|-----------------|---------------|
| Pricing tiers in `pricing.html` | `economics.html` (CAC/LTV table, projections), `business_plan.html` (revenue model), `investor-relations/pitch.html` (financials) |
| S-curve projections in `economics.html` | `investor-relations/pitch.html` (financials slide) |
| Monthly burn rate in `cost_tracking.html` | `metrics.json` (monthly_burn), `economics.html` (break-even, cash flow) |
| CAC/LTV in `economics.html` | `pricing.html` (price adequacy), `metrics.json` |

### Technical Consistency
| If you change... | Also update... |
|-----------------|---------------|
| Sprint status in `tech_plan.html` | `operations/okr_kpi.html` (KPI dashboard sprint status) |
| Milestone dates in `technology/roadmap.html` | `business/launch_plan.html` (launch phases), `operations/okr_kpi.html` |
| Architecture in `tech_plan.html` | `technology/zero_hero.html` (setup steps), `technology/db_schema.html` |
| RTO/RPO in `disaster_recovery.html` | `operations/dpa_sla.html` (uptime commitments) |
| SLA response times in `customer_support.html` | `operations/dpa_sla.html` (response time SLAs) |

### Business Consistency
| If you change... | Also update... |
|-----------------|---------------|
| UVP in `idea.html` | `business_plan.html` (value proposition in BMC), `marketing.html` (messaging matrix), `investor-relations/pitch.html` (solution slide) |
| Competitors in `competitor_analysis.html` | `business/pricing.html` (competitor price matrix), `business/risk.html` (market risks) |
| Team in `business_plan.html` | `investor-relations/pitch.html` (team slide) |
| Risk matrix in `business_plan.html` | `business/risk.html` (full risk register) |
| TAM/SAM/SOM in `business_plan.html` | `investor-relations/pitch.html` (market size slide) |

### Legal Consistency
| If you change... | Also update... |
|-----------------|---------------|
| Data processors in `privacy_policy.html` | `operations/cookie_policy.html`, `operations/dpa_sla.html` |
| Refund policy in `customer_support.html` | `operations/terms_of_service.html` (termination section) |

---

## 7. LLM Instruction Format Rules

### LLM_CONTEXT Block
Every HTML file must start with:
```html
<!-- LLM_CONTEXT: [Document purpose in 1-2 sentences. Cross-file consistency requirements. What to update elsewhere when this doc changes. Status rules.] -->
```
This block is read by AI agents to understand the document's role before making changes.

### FILL Comments
Every placeholder section must contain:
```html
<!-- FILL: [Specific description of what belongs here. Format hints. Cross-references.] -->
```

Rules for FILL comments:
- Be specific: "List 5-8 key assumptions with validation approach" not "fill in assumptions"
- Include format hints: "Format: YYYY-MM-DD | v0.x | Name | Description"
- Include cross-references: "Cross-reference with economics.html break-even figures"
- Never remove a FILL comment without replacing it with real content
- Add new FILL comments when adding new sections

---

## 8. Completeness Score Rules

The completeness score is calculated by `app.js` `initCompletenessScore()`:
- Counts sections in `window.PAGE_REQUIRED_SECTIONS` that have content
- A section is "filled" if: it exists in the DOM AND has no FILL comments AND has >50 chars of inner HTML
- Score = (filled sections) / (total required sections) × 100%

For every HTML file, `window.PAGE_REQUIRED_SECTIONS` must:
- List all section IDs defined in the document
- Be exhaustive — every required section must be listed
- Match the actual `id=""` attributes on `<section>` elements

---

## 9. Authentication Setup (Firebase)

### Firestore Structure
```
allowedUsers/          ← collection
  user@company.com/    ← document ID = email address
    (no fields needed)
```

### Firestore Security Rules (recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own allowlist entry
    match /allowedUsers/{email} {
      allow read: if request.auth != null && request.auth.token.email == email;
      allow write: if false; // Only admin SDK can write
    }
    // Deny all other reads/writes
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Auth Flow
1. User visits any protected page → `app.js` detects no auth → redirect to `auth.html`
2. User clicks "Sign in with Google" → Firebase popup
3. On success → check email in `allowedUsers` Firestore collection
4. If allowed → redirect to original page (or `/index.html`)
5. If not allowed → show "Access Denied" message, sign out

### Protected vs Public Pages
- **Protected** (requires auth): All pages except auth.html and investor/ directory
- **Public** (no auth): `auth.html`, `investor/index.html`, `investor/due_diligence.html`

---

## 10. Deployment Instructions (Vercel)

### Initial Deployment
1. Push repo to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Configure:
   - Framework Preset: **Other**
   - Root Directory: `/` (leave blank)
   - Build Command: *(leave blank)*
   - Output Directory: `.`
4. Deploy
5. Add Vercel URL to Firebase authorized domains

### Auto-Deploy
Vercel automatically redeploys on every push to `main`. No CI/CD configuration needed.

### Environment Variables
No environment variables needed — Firebase config is embedded in each HTML file's
`window.FIREBASE_CONFIG` script block. This is intentional for template simplicity;
for production, consider using Vercel environment variables and template literals.

### Custom Domain
1. Vercel project → Settings → Domains → Add domain
2. Configure DNS (CNAME or A record per Vercel instructions)
3. Add new domain to Firebase authorized domains

---

## 11. How to Apply Retroactively to Existing Projects

If you have an existing project and want to adopt this framework:

1. **Fork this template** into a new repo for the project
2. **Copy content** from your existing docs into the appropriate HTML files
3. **Fill FILL comments** with your real content
4. **Update project_config.json** with your project details
5. **Initialize metrics.json** with current metric values
6. **Deploy to Vercel** following Section 10
7. **Work through setup_checklist.html** to verify completeness

### Retroactive Application Checklist
- [ ] All existing financial data entered into `economics.html` and `cost_tracking.html`
- [ ] All team information entered into `business_plan.html` and `investor-relations/pitch.html`
- [ ] Existing competitors documented in `competitor_analysis.html`
- [ ] Active risks documented in `risk.html` with current mitigation status
- [ ] Current sprint state reflected in `tech_plan.html` and `okr_kpi.html`
- [ ] All existing customers added to `customer_memory.html`
- [ ] All investor interactions backfilled in `investor_memory.html`
- [ ] Legal documents drafted or linked in `terms_of_service.html`, `privacy_policy.html`
- [ ] `metrics.json` populated with current values

---

## 12. Adding a New Document

To add a document not in the default structure:

1. Create the HTML file following the standard template structure (see spec)
2. Add `<!-- LLM_CONTEXT: ... -->` at the very top
3. Add to the appropriate division in `assets/app.js` `NAV_STRUCTURE` array
4. Add a doc card in `index.html` under the correct division section
5. Add a search entry in `search.html` `window.SEARCH_INDEX` array
6. Add a checklist item in `setup_checklist.html`
7. Add the file path to `vercel.json` if special routing is needed

---

## 13. Template Inheritance

Every HTML file must:
1. Load `assets/design_system.css` (adjust path with `../` for subdirectories)
2. Load `assets/project_theme.css` (same path adjustment)
3. Load `assets/app.js` at the bottom of `<body>`
4. Have `window.FIREBASE_CONFIG` set before `app.js` loads
5. Have a `.sidebar` element (app.js renders the nav into it)
6. Have the sidebar toggle button and overlay elements for mobile

Path prefix rules:
- Root files (`index.html`, `auth.html`, etc.): `assets/...`
- Subdirectory files (`business/`, `technology/`, etc.): `../assets/...`

---

## 14. Investor Portal Rules

The `/investor/` directory is PUBLIC — no Firebase auth.
NDA acceptance is stored in `sessionStorage` (resets on browser close).

**Allowed content in investor portal:**
- `investor/index.html` (NDA gate + summary)
- `investor/due_diligence.html` (DD checklist)
- Links to: `investor-relations/pitch.html`, `business/economics.html`, `business/pricing.html`

**NOT accessible from investor portal:**
- Customer data (`customer_memory.html`)
- Investor CRM (`investor_memory.html`) — this is internal only
- Cost tracking details
- Code review issues

---

## 15. File Modification Protocol for LLMs

When an LLM is asked to update a document:

1. **Read the LLM_CONTEXT comment** at the top of the file first
2. **Identify all FILL comments** in the target section
3. **Check cross-file consistency rules** in Section 6
4. **Make the change** — replace FILL comments with real content
5. **Add changelog entry** at the bottom of the document
6. **Update status badge** if completeness threshold crossed
7. **Check `window.PAGE_REQUIRED_SECTIONS`** — add new sections if needed
8. **Verify no orphaned FILL comments** remain in filled sections

### What LLMs Must NOT Do
- Delete section IDs — they are referenced by completeness scoring
- Change CSS class names without updating all usages
- Remove the sidebar nav structure
- Remove the `window.FIREBASE_CONFIG` block
- Remove the `window.PAGE_REQUIRED_SECTIONS` block
- Change file paths without updating nav structure in app.js
- Add content to investor portal that violates Section 14
- Commit Firebase API keys or other secrets (use FILL placeholders)

---

*AIz Intel Proprietary Agentic Framework — Version 1.0.0*
*All content in English. Framework language: English.*

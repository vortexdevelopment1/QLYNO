# PROMPT: Redesign the Qlyno Billing Portal — Dashboard & Navigation (Header + Sidebar)

## 1. ROLE

You are a senior product UI/UX designer and frontend engineer specializing in healthcare fintech / HMS billing dashboards, data visualization, and enterprise SaaS design systems (think: a blend of Stripe Dashboard's financial clarity, Linear's information density, and a hospital ERP's operational trustworthiness).

## 2. OBJECTIVE

Redesign **two surfaces only** of the existing Qlyno Billing Staff Portal:

1. **The Dashboard** (`/dashboard`)
2. **The Navigation shell** — Top Header + Left Sidebar (the persistent chrome around every page)

Everything else (Invoices, Payments, Refunds, Discounts, Insurance, Reports, etc.) stays as-is for this pass — do not modify those routes or their internal components, only the shared layout chrome and the dashboard page itself. Reuse existing data types, permission logic (`can()`, `hasScope()`), and the `AppContext` store exactly as they are — this is a **visual and information-architecture redesign**, not a data-model or business-logic change.

This redesign must be a **faithful, complete implementation** of PRD Section 6 (Billing Staff Dashboard) and the navigation-relevant parts of the PRD (org model, scopes, permissions) — not a generic admin dashboard template with billing labels slapped on it. Read the "Functional Requirements" section below before designing anything.

## 3. DESIGN DIRECTION

**Theme:** Modern healthcare-fintech — the emotional register is "I trust this system with money and patient data," not "this is a fun consumer app."

- **Color system:** One confident primary (blue or deep teal reads as both "medical" and "financial trust" — avoid pure green-as-primary, reserve green strictly for positive financial states like "Paid"/"Settled"). Neutral ink/slate scale for text and structure. Semantic colors only for status: green = success/paid/settled, amber = pending/partial/warning, red = failed/overdue/critical, violet/purple = refunded/adjusted (reserve for financial reversals so it's visually distinct from "in progress" amber).
- **Typography:** A clean system/humanist sans-serif. Numbers matter more than headlines here — use tabular figures for all currency/amount displays so columns of numbers align. Financial totals should be visually the heaviest weight on any card.
- **Elevation & structure:** Soft shadows, generous but not wasteful whitespace, 12–16px corner radii. Cards over borders-only where data needs to feel like a "unit." Avoid heavy gradients, neumorphism, or decorative illustration — this is an operational tool used for hours a day, not a marketing page.
- **Density:** Favor information density appropriate to a power-user financial tool over consumer-app airiness — but never at the cost of scannability. A Billing Staff member should be able to glance at the dashboard and know, within 3 seconds, whether anything needs their attention today.
- **Iconography:** One consistent icon set throughout (outline style recommended for a professional register). Icons support labels, they never replace them for anything financial (never an icon-only "Refund" button with no text).
- **Motion:** Subtle only — fade/slide-in for cards on load, smooth number transitions when stats update after an action, no bouncy/playful easing.
- **Currency:** All amounts in INR (₹), formatted with Indian numbering (e.g. ₹1,25,000 not ₹125,000).

## 4. NAVIGATION REDESIGN — FUNCTIONAL REQUIREMENTS

### 4.1 Top Header — must contain

- **Organization context**: org name, org type badge (Solo Doctor / Clinic / Hospital), current billing scope — visually distinct as "which financial world am I currently looking at."
- **Scope switcher** (hospital orgs only, only rendered when the current user holds more than one scope): Central Billing / OPD / IPD / Diagnostics / Pharmacy / Surgery / Insurance-TPA / Refund Desk. Must communicate clearly that these are **scopes within one hospital billing system**, never styled/labeled as if they were separate tenants or apps.
- **Global search**: patient name/UHID/contact, invoice number, payment/reference number, receipt number, outstanding balance — with grouped results, loading/empty/no-result states.
- **Notifications** (WhatsApp billing notification center): bell icon with unread indicator, opens a panel/drawer.
- **Help/support** access.
- **User identity**: name, role (Billing Staff vs Billing Admin), and — this is important and currently under-designed — a lightweight **permission/scope indicator** so the user always knows what they can and can't do without hunting for it (e.g. a small "Scope: OPD only" or "Full access" chip near the avatar).

### 4.2 Sidebar — must contain

All nav items from the existing route list (Dashboard, Pending Billing, Billing/Invoices, Payments, Outstanding, Receipts, Refunds, Discounts/Approvals, Insurance/TPA, Patients, Services, Reports, Reconciliation, Audit Logs, Notifications, AI Billing Assistant, Staff/Assignments, Settings) — **but only the ones the current user's permissions and org type actually grant access to**. This is not a cosmetic filter: an item the user can't access should not appear at all (per `core-rules.md` §2.2 — denial explains itself where an action is attempted, but a whole nav section the user structurally cannot use should simply be absent, not shown-then-blocked).

Redesign goals for the sidebar specifically:
- Group related items visually (e.g. Money In: Invoices/Payments/Outstanding/Receipts; Money Back: Refunds/Discounts; Oversight: Reports/Reconciliation/Audit Logs) rather than one flat undifferentiated list — this is the biggest usability upgrade available here.
- Make the active section unmistakable (not just a color change on a 2px-wide indicator).
- Collapse gracefully on smaller viewports into the existing mobile drawer pattern — keep that mechanism, just restyle it to match.

## 5. DASHBOARD REDESIGN — FUNCTIONAL REQUIREMENTS (PRD §6, exhaustive)

Every one of these eight sections must be present, and each must answer "what does Billing Staff need to instantly understand here" — not just restate a table.

| Section | Must show | Suggested visualization |
|---|---|---|
| **Today** | Today's bills, today's collections, pending payments, today's refunds | 4 hero stat cards, each with a small trend indicator (▲/▼ vs. yesterday) |
| **Pending Billing** | Count + list of services/encounters waiting to be billed, by source | Compact list/table with a "Create Invoice" quick action per row; a small source-breakdown mini bar chart (Doctor/OPD vs Diagnostics vs Pharmacy vs IPD vs Surgery) adds real value here |
| **Outstanding** | Unpaid + partially paid invoices, total outstanding, ageing where configured | **Bar chart required**: outstanding amount by ageing bucket (0–30 / 31–60 / 61–90 / 90+ days) — this is the single most useful chart on the whole dashboard for a billing team and must be visually prominent |
| **Payments** | Today's + recent transactions, payment methods, failed payments | **Bar chart required**: collections broken down by payment method (Cash/Card/UPI/Online/Other) — horizontal bar reads best here; failed payments surfaced as a distinct, urgent-toned callout, not buried in the list |
| **Refunds** | Pending/approved/rejected/processing/completed/failed refund work | Small multi-segment bar or grouped stat tiles by status — avoid a pie chart here, the PRD's six-state lifecycle reads better as ordered bars than as a wheel |
| **Insurance/TPA** | Pending verification, claims, settlement status — **only when permitted** | Funnel-style or stacked bar: claims by status (Pending Verification → Under Review → Partially Settled → Settled), plus payer outstanding as a callout number. Entire section must not render at all for orgs without insurance enabled or users without the scope — not a disabled state |
| **Recent Patients** | Patients with recent billing activity | Compact list with status badges — this one stays list-form, not chart-form (identity data, not aggregate data) |
| **Alerts** | Payment failures, duplicate bills, approval requirements, reconciliation exceptions | Prioritized/severity-sorted list (critical → warning → info), each deep-linking to the relevant record — this is the "what needs me right now" panel and should be positioned where it's seen first or second, not scrolled past |

**Quick Actions** (New Bill, Collect Payment, Issue Receipt, Request Refund, Search Patient) must remain prominent, one-click, and open real functional flows — not be demoted for the sake of visual cleanliness.

### 5.1 Chart requirements specifically (per your ask for "bar graphs and professional captivating visuals")

- Prefer **bar charts** (vertical for time-series/category comparison, horizontal for ranked breakdowns like payment method) over pie/donut charts throughout — bars are more accurate for financial comparison and safer for color-blind users when paired with labels.
- Every chart needs: an axis label or clear title stating the unit (₹), a legend if more than one series, and never color-alone encoding — pair color with a text label or icon.
- Charts must have distinct loading, empty ("no data for this period yet"), and error states — same as every other UI element in this portal.
- Charts should be genuinely data-driven from the existing mock data / `AppContext` state, not static images.
- Respect the existing "no new dependencies without approval" constraint from the original build — check what charting approach is already available in the project (a lightweight charting library or the existing chart utility) before introducing a new one.

## 6. INDIAN NAMES — HARD REQUIREMENT

**Every person referenced anywhere in this redesign — in any new mock data, placeholder content, avatar initials, example alerts, sample notifications, or design mockup copy — must use Indian names.** This applies across every role without exception:

- Billing Staff / Billing Admin (e.g. Priya Menon, Arjun Nair, Sneha Kulkarni, Devika Iyer, Kabir Sheikh, Farah Ansari)
- Doctors referenced in encounter/context data (e.g. Dr. Ananya Rao, Dr. Suresh Iyer, Dr. Rakesh Malhotra)
- Patients (e.g. Ramesh Kulkarni, Kavya Reddy, Faisal Ahmed, Nandini Rao, Vikram Singh, Anjali Bhatt)
- Reception staff, approvers, or any other role that appears in an example, tooltip, empty-state illustration copy, or onboarding hint

Do not introduce Western default names (e.g. "John Doe," "Jane Smith") anywhere in this redesign, including in code comments, placeholder text, or design-tool sample content. If the project already has an Indian-names mock dataset, reuse it rather than inventing a new one — consistency of the same named individuals across screens (the same "Priya Menon" showing up in Staff, Audit Logs, and the dashboard) reinforces that this is one coherent system, not disconnected screens.

## 7. TECHNICAL CONSTRAINTS

- Stay within the existing tech stack (Next.js App Router + TypeScript + Tailwind) and existing component conventions (`StatCard`, `DataTable`, `StatusBadge`, `PermissionGuard`, etc.) — extend/restyle these rather than introducing a parallel component system.
- No new npm packages without flagging them first — if a charting approach requires a new dependency, name it explicitly and ask before adding it.
- Preserve all existing permission-gating and scope-filtering logic exactly — the redesign changes how data is *presented*, never which data a given user is allowed to see. Re-verify against `core-rules.md` §4 (scope filtering) and §2 (permission enforcement) before finalizing: an OPD-scoped user's redesigned dashboard must still only show OPD-scoped data, just presented better.
- Every section needs loading / empty / error states — don't leave any dashboard card looking unfinished when its data set happens to be empty (e.g. "No outstanding balances" should look intentional, not broken).
- Fully responsive: this is a desktop-first operational tool, but must not break on tablet/smaller laptop viewports.
- Accessible: semantic headings per section, sufficient contrast, keyboard-navigable nav and quick actions, charts have text alternatives (a screen-reader-accessible summary or an accompanying data table) — don't rely on the chart alone to convey information.

## 8. DELIVERABLE

1. Updated Header and Sidebar components (or a clearly scoped set of new sub-components if you choose to decompose them further), preserving all existing functional props/behavior (org switching, scope switching, search, notifications).
2. A redesigned Dashboard page implementing all eight PRD §6 sections plus Quick Actions, with the bar-chart visualizations specified in Section 5.1 above.
3. A short before/after rationale (2–4 sentences) explaining the key information-architecture decisions made — particularly how the sidebar grouping and the ageing/payment-method bar charts improve on the current flat-list version.

## 9. ACCEPTANCE CHECKLIST

- [ ] Every PRD §6 dashboard section present and functioning, including the two hospital-only conditional sections (Insurance/TPA, scope-dependent report access) correctly appearing/disappearing based on org config and user permission.
- [ ] Outstanding-by-ageing and Payments-by-method are implemented as bar charts, not tables-only or pie charts.
- [ ] Sidebar only shows nav items the current user can actually access; no item is shown-then-blocked.
- [ ] Hospital scope switcher only appears for hospital users with more than one scope, and is visually clear that scopes are internal to one hospital system.
- [ ] All person names anywhere in new mock data or example content are Indian names, consistent with any existing dataset in the project.
- [ ] No new dependency was added without being explicitly flagged first.
- [ ] Quick Actions still open real, functional flows (not visual-only buttons).
- [ ] All chart types include labels/legends and are not color-only encoded.
- [ ] Loading, empty, and error states are implemented for every dashboard section, not just the happy path.

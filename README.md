# Qlyno Billing Staff Portal — Frontend

A frontend-only, Next.js + TypeScript implementation of the Qlyno Billing Staff Module (PRD v1.0) for **Solo Doctor**, **Clinic** and **Hospital** organizations. One shared billing engine; the workspace, permissions, scopes and reports adapt to organization context. No backend, no external packages beyond Next/React, no real integrations (payments, WhatsApp, insurance APIs, AI APIs are all simulated in-memory).

## Run instructions

1. Extract the ZIP.
2. Install dependencies yourself:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000 — it redirects to `/dashboard`.

No environment variables or external services are required. All data is realistic in-memory mock data (Indian healthcare examples, INR currency) and resets on a full page refresh.

## Demo workspace switcher

The header includes a "Demo workspace" row to switch between organizations and billing staff users, so you can see how the UI adapts:

- **Dr. Ananya Rao — Family Clinic** (Solo Doctor) — one billing assignment, no scopes.
- **Sanjeevani Multispecialty Clinic** (Clinic) — one billing assignment, insurance enabled.
- **Vardhman Hospital** (Hospital) — multiple billing staff, each with different scopes (Central/Admin, OPD, IPD+Surgery, Diagnostics+Pharmacy, Insurance/TPA, Refund Desk) and different permission sets — switch users to see scope-based restriction in action (e.g. the OPD user cannot see IPD/Surgery invoices or reports).

## Where things live

- `types/index.ts` — full data model (Patient, Encounter, Invoice, Payment, Receipt, Discount, Refund, InsuranceClaim, BillingAssignment, AuditLog, Notification, ReconciliationRecord, StaffUser, etc.)
- `lib/mock-data.ts` — realistic seed data covering every PRD demo scenario.
- `context/AppContext.tsx` — single reducer-driven store for all interactive billing state (invoice creation/finalization, payments, discounts, refunds, reconciliation, staff status).
- `lib/permissions.ts`, `lib/selectors.ts` — RBAC and scope-filtering helpers.
- `components/billing/*` — InvoiceForm, PaymentForm, RefundForm, DiscountForm/Approval, PermissionGuard, AuditTimeline, PaymentHistory, etc.
- `app/*` — one route per PRD module (see routing list below).

## PRD coverage checklist

- [x] Module purpose / organization model (Billing Staff is a role, never a separate org)
- [x] Responsibilities & non-responsibilities (clinical vs financial separation enforced in UI copy and patient detail page)
- [x] Dashboard: Today, Pending Billing, Outstanding, Payments, Refunds, Insurance/TPA, Recent Patients, Alerts, Quick Actions
- [x] Billing workflow (service → pending → invoice → payment → receipt → outstanding → settlement → notification → audit)
- [x] Pending Billing page with source, action buttons, no clinical-edit controls
- [x] Invoice management: creation, line items, statuses, edit draft, issue/finalize, download/share (mock), cancel (never delete)
- [x] Invoice details page: header, line items, financial summary, payment history, audit history
- [x] Payments: full/partial/multiple, methods, reference, failure simulation, reversal-safe design
- [x] Partial payment flow with running outstanding balance
- [x] Receipts module with print/download/share (mock) actions
- [x] Outstanding module: patient-wise, invoice-wise, ageing, reminders, duplicate-collection prevention
- [x] Discounts: normal / higher / special-case / post-payment, approval workflow, audit trail
- [x] Refunds: request → validation → approval → processing → completion, approval threshold
- [x] Insurance/TPA: payer, verification, pre-auth, claim, settlement, patient responsibility, documents
- [x] Hospital multi-scope billing (Central/OPD/IPD/Diagnostics/Pharmacy/Surgery/Insurance/Refund Desk)
- [x] Solo Doctor / Clinic / Hospital contexts
- [x] Reception, Doctor, Lab, Pharmacy integration represented (read-only clinical context, financial separation)
- [x] Patient billing view (staff view + patient-facing preview toggle on patient detail page)
- [x] WhatsApp notification center (simulated) + dedicated Notifications page
- [x] AI Billing Assistant (simulated chat, suggested prompts, related record links, explicit approval-limitation messaging)
- [x] Reports: daily collection, outstanding, payment method, service revenue, doctor-wise, department-wise, insurance, refund, discount, reconciliation — availability adapts to org/permission/scope
- [x] Reconciliation: totals, differences, exceptions, Review → Investigate → Resolve → Audit
- [x] Global search (patient, invoice, receipt) with empty/no-result states
- [x] Quick actions open real flows (modals), not dead buttons
- [x] Staff/Assignments lifecycle (Invited/Pending/Active/Suspended/Removed/Archived), scope assignment display
- [x] Permission system enforced throughout via `PermissionGuard`, with explanation text (not silent hiding)
- [x] Audit log: full timeline, filterable, cancelled invoices remain visible/auditable
- [x] Financial safety rules: no hard delete, controlled cancellation, every action logged, restricted refunds/discounts need approval
- [x] Confirmation dialogs for cancel/refund/high-discount/unauthorized-action messaging
- [x] Consistent status system (icon + text, not color alone)
- [x] All 16 demo data scenarios represented in seed data
- [x] Responsive layout (mobile nav drawer, responsive tables), accessible semantics (labels, focus states, aria attributes)

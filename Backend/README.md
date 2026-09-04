# Qlyno HMS Laboratory Portal API

Production-oriented Express/TypeScript backend for the multi-tenant Qlyno Laboratory Information System. PostgreSQL and Prisma replace the frontend's local mock/localStorage state. Orders, specimens, collection tasks, results, reports, billing, permissions, and audit events share one transactional source of truth.

## Quick start

Requirements: Node.js 20 or 22 LTS, npm, and Docker Desktop (or PostgreSQL 16).

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The API listens on `http://localhost:4000`. Health checks are available at `/health` and `/api/health`. In development, the protected Swagger UI is at `/api/docs` and the OpenAPI document at `/api/openapi.json`; pass a valid bearer token because documentation routes follow the same authenticated-route policy.

For a non-development deployment, apply committed migrations with `npx prisma migrate deploy`. Generate new, unrelated secrets for `JWT_ACCESS_SECRET`, `JWT_RESET_SECRET`, and `PASSWORD_PEPPER`; enable `COOKIE_SECURE`; and use a least-privilege PostgreSQL login.

## Seed accounts

All deterministic demo users use password `QlynoDemo!2026`. These credentials are for local development only.

| Tenant slug | Username/email | Role |
|---|---|---|
| `sunrise-hospital` | `admin@sunrise.example` | Tenant admin |
| `sunrise-hospital` | `sanjeev@sunrise.example` | Lab director/pathologist |
| `sunrise-hospital` | `anita@sunrise.example` | Quality manager |
| `sunrise-hospital` | `deepak@sunrise.example` | Section supervisor |
| `sunrise-hospital` | `pooja@sunrise.example` | Technologist |
| `sunrise-hospital` | `rahul@sunrise.example` | Accessioning/receiving |
| `sunrise-hospital` | `nikita@sunrise.example` | Phlebotomist |
| `sunrise-hospital` | `sandeep@sunrise.example` | Courier |
| `sunrise-hospital` | `farah@sunrise.example` | Reception/cashier |
| `sunrise-hospital` | `inventory@sunrise.example` | Inventory/procurement |
| `sunrise-hospital` | `auditor@sunrise.example` | Read-only auditor |
| `sunrise-hospital` | `doctor@citycare.example` | Referring clinician |
| `sunrise-hospital` | `client@citycare.example` | Client lab user |
| `aarogya-diagnostics` | `admin@aarogya.example` | Standalone/private lab admin |

Roles remain separate by design. For example, Sanjeev can medically validate and release reports, Nikita can confirm collection, and Rahul can receive/accession specimens. A tenant administrator may deliberately combine roles or change site/department scope through the audited access endpoint; existing sessions are revoked after an access change.

## Architecture

```text
Next.js Laboratory Portal
          |
       HTTPS/JSON
          v
Express security boundary
request ID -> Helmet/CORS/HPP/rate limit -> Zod validation
          |
JWT authentication -> active-account check -> tenant context -> RBAC/permissions
          |
Tenant/ownership/site/department-scoped module services
          |
Prisma transactions + immutable AuditEvent/lifecycle entries
          |
PostgreSQL (tenantId on every tenant-owned aggregate)
```

The verified access token identifies the user and membership. Middleware reloads active-account status, freezes the tenant/site/department/permission context, and route services add tenant and ownership filters. Writable payloads do not accept `tenantId`, role, user status, billing authority, or actor IDs. External clinicians and client users receive narrower query predicates for their practitioner or client organization.

## Authentication lifecycle

- `POST /api/auth/login` is the single login endpoint. Five failed attempts trigger a 15-minute account lock.
- Internal staff cannot self-register. A tenant admin calls `POST /api/admin/users/invite`, and staff complete the one-time token with `POST /api/auth/register/complete-invite`.
- Referring clinicians and client-lab users use `POST /api/auth/register`; the account stays `PENDING_APPROVAL` until an admin approves it.
- Access tokens expire after about 15 minutes. Refresh tokens are opaque, hashed in PostgreSQL, stored in HttpOnly/SameSite cookies, rotated on each use, and organized in revocable token families. Replaying a rotated token revokes the family.
- Logout, logout-all, password change, account deactivation, and role/scope changes revoke relevant refresh sessions.

## Shared laboratory workflow

Placing/importing an order calculates one server-authoritative billing authority, creates order items, grouped expected specimens, a collection task, mapped charge lines, and the first lifecycle event atomically.

```text
ORDER_RECEIVED -> COLLECTION_READY -> RECEIVING -> ACCESSIONING
      -> PROCESSING -> TECHNICAL_REVIEW -> MEDICAL_VALIDATION
      -> REPORT_RELEASE -> DELIVERY_CLOSURE -> CLOSED
```

- Collection updates selected containers and tasks (`PARTIAL` or `COMPLETED`) and activates receiving.
- Receiving operates only on the exact collected/in-transit specimen, records custody, then makes it eligible for accessioning.
- Accessioning accepts, partially accepts, or rejects. Acceptance creates workbench items. Rejection retains the original record and creates a new linked recollection specimen/task.
- Result entry retains revision history. Technical and medical decisions append lifecycle/audit evidence.
- Released report versions have `immutableAt`; editing them returns `REPORT_IMMUTABLE`. Corrections/amendments create a new version.
- HMS orders receive read-only central billing postings and never an LIS invoice. Standalone/client-billed orders can use LIS estimates/invoices. No-charge orders cannot be invoiced.

The order-detail response includes the calculated lifecycle and `currentQueue` route, so the frontend can drive “Open current queue” without hard-coded stage navigation. Collection, receiving, accessioning, processing, review, release, rejection, and dashboard queues are all derived from the same persisted order/specimen/work-item state.

## Implementation coverage

- [Phase 0 analysis](docs/PHASE_0_ANALYSIS.md) records the frontend-to-Prisma map, 13-role access matrix, assumptions, and tenancy strategy.
- [Frontend API coverage](docs/FRONTEND_API_COVERAGE.md) maps the existing Next.js screens to their protected API endpoints.
- Every tenant-owned parent and child model carries an explicit `tenantId`; indexes and compound uniqueness constraints support tenant/status/scope filtering.
- OpenAPI includes every implemented endpoint plus `x-required-permissions` and `x-required-roles` metadata. A contract test detects undocumented routes or newly introduced tenant models without `tenantId`.
- Support tickets, tenant settings, operational queues, scheduling, billing summaries, communication history, equipment maintenance, analyzer runs, quality boards, and logistics views are backed by persisted or derived data rather than independent frontend mocks.

## Commands

```bash
npm run typecheck
npm test
npm run build
npm audit
npm outdated
```

Tests cover successful/failed/locked login behavior, refresh rotation and replay-family revocation, representative RBAC denials, tenant/owner/site query isolation, and the billing-authority matrix.

The build and install lifecycle runs `prisma generate`, ensuring the custom generated client used by the compiled server exists in a clean deployment.

## Operational notes

- Email/SMS delivery and HMS/analyzer transports are integration boundaries. This repository records durable invitation, communication, posting, and integration events; production workers/adapters should deliver them without placing third-party credentials in the API process.
- Those external delivery/transmission adapters are the only deliberate follow-up boundary; the API, authorization decisions, durable events, and retry-visible integration state are implemented here.
- Put the service behind a TLS-terminating reverse proxy and a WAF, centralize logs, alert on authentication failures/token replay, back up PostgreSQL, and rotate secrets regularly.
- The app database role should own/use only the application schema and must not be a PostgreSQL superuser.
- Never use the seeded password or `.env.example` secrets outside local development.

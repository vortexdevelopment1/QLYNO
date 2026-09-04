# Frontend route to API coverage

The API returns persisted tenant-scoped records for each existing Next.js view. Queue/dashboard resources are projections over the owning records, not independent queue tables.

| Frontend view(s) | Backend resource |
|---|---|
| `/login` | `/api/auth/login`, `/register`, `/register/complete-invite`, `/refresh`, `/forgot-password`, `/reset-password` |
| `/dashboard` | `GET /api/dashboard` |
| `/queues`, `/queues/[type]` | `GET /api/queues`, `GET /api/queues/{type}` |
| `/patients`, `/patients/[id]` | `GET/POST /api/patients`, `GET /api/patients/{id}`, `/api/encounters` |
| `/clients`, `/clients/[id]`, `/referrers`, `/reference-labs` | `/api/clients`, `/api/practitioners`, `GET /api/logistics/reference-labs` |
| `/orders`, `/orders/[id]`, `/orders/new` | `/api/orders`, `/api/orders/{id}`, `/api/orders/{id}/charges` |
| `/catalog`, `/catalog/tests/[id]` | `/api/catalog`, `/api/catalog/{id}` |
| `/scheduling` | `GET /api/scheduling` (derived from collection tasks) |
| `/collection` | `/api/collection/tasks`, `/api/collection/tasks/{id}/confirm` |
| `/collection/scan` | `/api/collection/receiving`, `/api/collection/receiving/confirm` |
| `/accessioning` | `/api/accessioning`, `/api/accessioning/resolve` |
| `/specimens`, `/specimens/[id]`, `/specimens/rejections`, `/specimens/storage` | `/api/specimens`, `/api/specimens/{id}`, `/api/specimens/{id}/aliquots` with status filters |
| `/logistics`, `/logistics/routes`, `/logistics/manifests`, `/logistics/manifests/[id]` | `/api/logistics/routes`, `/api/logistics/manifests`, `/api/logistics/manifests/{id}`, status transition endpoint |
| `/send-outs` | `GET /api/logistics/send-outs` |
| `/workbench`, `/workbench/[department]` | `GET /api/workbench`, `POST /api/workbench/runs` |
| `/analyzers`, `/analyzers/[id]`, `/batches` | `/api/workbench/analyzers`, `/api/workbench/analyzers/{id}`, `/api/workbench/runs` |
| `/results`, `/validation` | `/api/results`, `/api/results/validation`, technical/medical decision endpoints |
| `/reports`, `/reports/[id]`, `/amendments` | `/api/reports`, `/api/reports/{orderId}`, version/release/delivery endpoints; `amendedOnly=true` for amendments |
| `/critical-results` | `/api/results/critical`, acknowledgement endpoint |
| `/quality`, `/quality/qc`, `/quality/qc/[id]` | `/api/quality/qc`, `/api/quality/qc/{id}`, audited override endpoint |
| `/quality/nonconformance`, `/quality/capa` | `/api/quality/nonconformances`, `/api/quality/capas`, CAPA creation endpoint |
| `/quality/documents`, `/quality/audits`, `/quality/competency` | corresponding `/api/quality/*` resources |
| `/inventory`, `/inventory/items`, `/inventory/lots`, `/inventory/stock`, `/inventory/procurement` | `/api/inventory/items`, `/lots`, `/movements`, `/purchase-orders` |
| `/equipment`, `/equipment/[id]`, `/equipment/maintenance` | `/api/inventory/equipment`, `/equipment/{id}`, `/equipment/maintenance` |
| `/billing`, `/billing/estimates`, `/billing/invoices`, `/billing/invoices/[id]`, `/billing/payments`, `/billing/refunds`, `/billing/cashier`, `/billing/contracts`, `/billing/receivables`, `/billing/reconciliation` | `/api/billing/summary`, `/estimates`, `/invoices`, `/invoices/{id}`, `/payments`, `/refunds`, payment/refund endpoints and `/contracts`; receivables/reconciliation are computed from invoice/payment state |
| `/communications`, `/communications/templates`, `/communications/history` | `/api/communications/templates`, `/api/communications/history`, `/api/communications/send` |
| `/portal-access` | `GET /api/communications/portal-access` |
| `/support` | `GET/POST/PATCH /api/support` |
| `/integrations`, `/integrations/hms-billing` | `/api/integrations`; HMS charge/posting state is also exposed through order charges |
| `/analytics` | `GET /api/analytics/summary` |
| `/administration/users`, `/lab-management/team` | `/api/admin/users`, invitation/status/access endpoints |
| `/administration/organization`, `/lab-management/access-scope` | `/api/admin/sites`, `/api/admin/departments`, `GET /api/settings` |
| `/administration/roles`, `/lab-management/roles` | `GET /api/admin/roles`, audited user access endpoint |
| `/administration/audit-log`, `/lab-management/audit` | `GET /api/admin/audit` |
| `/administration/templates` | `/api/communications/templates` |
| `/settings` | `GET/PATCH /api/settings` |

`Open current queue` is returned by the order lifecycle calculation. Collection, receiving, accessioning, workbench, validation, report release, and closure all read and mutate the same order/specimen/result/report aggregates transactionally.

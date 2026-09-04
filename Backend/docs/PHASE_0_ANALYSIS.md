# Phase 0 — Frontend analysis report

This report records the analysis completed before the backend implementation was started. It is based on `src/lib/types/domain.ts`, `src/config/tenant-modes.ts`, `src/config/roles.ts`, `src/config/navigation.ts`, every file in `src/data/mock`, and every route under `src/app`.

## Entity mapping

| Frontend entity | Prisma model | Notes |
|---|---|---|
| Tenant | `Tenant` | Owns mode, billing feature flag and accreditation metadata. |
| Site | `Site` | Tenant-owned hospital lab, branch, collection centre or reference hub. |
| Department | `Department` | Tenant- and site-owned processing scope. |
| UserAccount | `User` + `TenantMembership` | Identity is global; tenant status, roles and scopes are membership data. |
| Patient | `Patient` | Includes identifiers, addresses, guardians and emergency contacts. |
| Encounter | `Encounter` | Optional hospital encounter linked to patient and site. |
| ClientOrganization | `ClientOrganization` | B2B/referral owner and billing scope. |
| Practitioner | `Practitioner` | Referrer identity used for own-patient filtering. |
| TestCatalogItem | `TestCatalogItem` | Versioned test definition and specimen requirements. |
| Order | `LaboratoryOrder` | Server-resolved, single billing authority. |
| OrderItem | `LaboratoryOrderItem` | Independent test progress and report grouping. |
| Container | `ContainerType` | Tenant container catalogue. |
| CollectionTask | `CollectionTask` | Visit-level grouping of required specimen containers. |
| Specimen | `Specimen` | Immutable rejection/recollection chain and custody state. |
| Aliquot | `Aliquot` | Child material derived from a specimen. |
| Manifest | `Manifest` | Transport grouping; specimens are linked through `ManifestSpecimen`. |
| WorkItem | `WorkItem` | Department queue generated from accessioned order items. |
| Analyzer | `Analyzer` | Department-scoped instrument connection state. |
| InstrumentRun | `InstrumentRun` | Analyzer run with `InstrumentRunItem` children. |
| Result | `Result` | Current analyte result; revisions are retained in `ResultRevision`. |
| ReportVersion | `Report` + `ReportVersion` | Stable report identity plus immutable released versions. |
| CriticalNotification | `CriticalNotification` | Critical-result notification and acknowledgement. |
| QcRun | `QcRun` | QC result and Westgard state. |
| Nonconformance | `Nonconformance` | Quality incident. |
| Capa | `CorrectivePreventiveAction` | CAPA workflow linked to a nonconformance. |
| InventoryItem | `InventoryItem` | Stock master. |
| StockLot | `StockLot` | Expiry- and quarantine-aware lot. |
| Equipment | `Equipment` | Lab equipment and calibration status. |
| Invoice | `Invoice` | LIS invoice only; never created for HMS-central/no-charge orders. |
| Payment | `Payment` | Tenant-scoped receipt against an invoice. |
| Contract | `Contract` | Client agreement and versioned rates. |
| IntegrationEvent | `IntegrationConnection` + `IntegrationEvent` | Connection status separated from append-only events. |
| AuditEvent | `AuditEvent` | Compliance audit and lifecycle events. |

Supporting backend-only models are `Role`, `Permission`, role/scope joins, `ApprovalRequest`, `UserInvitation`, `RefreshSession`, `AuthenticationAttempt`, `PasswordResetToken`, `LaboratoryChargeLine`, `HospitalBillingPosting`, estimates/refunds, stock movements/procurement, maintenance, quality documents/audits/competency, and communication templates/deliveries.

## Role and action matrix

`R` means scoped read, `W` means create/update, and `A` means an explicitly authorized clinical/high-risk action. Own/client access is always filtered by practitioner or client-organization identity.

| Role | Permitted modules and actions |
|---|---|
| Laboratory Director / Pathologist | Dashboard; R patients/orders/specimens/results/reports/inventory/audit; W orders/results/quality; A technical review, medical validation and report release. Collection, receiving and accessioning remain separate permissions. |
| Quality Manager | Dashboard; R orders/specimens/results/reports/audit; R/W quality; A QC override. |
| Section Supervisor | Dashboard; R patients/orders/specimens/results/reports/quality in assigned departments; W results/workbench/quality; A technical review. |
| Technologist / Technician | Dashboard; R orders/specimens/results in assigned departments; W workbench/results; A accession where assigned. |
| Accessioning / Receiving | Dashboard; R orders/specimens/logistics in permitted sites; A receive, accession, partially accept and reject specimens. |
| Phlebotomist / Ward Collector | Dashboard; R patients/orders/specimens/logistics in permitted sites; W permitted orders; A confirm collection. |
| Courier / Home Collector | Dashboard; R orders/specimens/logistics in route/site scope; W manifests/logistics; A collection where assigned. |
| Reception / Cashier | Dashboard; R/W patients and orders; R specimens/reports/billing; A collect payment. |
| Inventory / Procurement | Dashboard; R/W inventory, stock, procurement, equipment and maintenance. |
| Tenant Administrator | Dashboard; tenant-wide R operational/quality/inventory/billing/comms/analytics; W users, roles, sites, departments, approvals and integrations. No automatic clinical collection/accession/validation/release authority. |
| Referring Clinician | R only own referred patients, orders and reports. |
| Client Laboratory User | R own client patients/orders/reports/billing; W orders for the linked client organization. |
| Auditor | Tenant-wide R dashboard, clinical, quality, inventory, billing, communications, analytics and audit; all mutation endpoints deny writes. |

The implemented permission names are defined in `src/config/permissions.ts`; routes authorize permissions, not display-role labels.

## Assumptions and resolved ambiguities

- Frontend lowercase enum values map to uppercase database enum values at the API boundary.
- Money uses PostgreSQL `Decimal`, timestamps use timezone-aware `DateTime`, and flexible integration/report payloads use JSON.
- The frontend’s age is display data; the backend stores date of birth when known rather than persisting a continually stale age.
- Identity can participate in multiple tenants; tenant access and account status are represented by `TenantMembership`, while credentials stay on `User`.
- A user may hold multiple roles. Effective permissions are the union of the server-side role grants, constrained further by tenant, site, department and ownership scope.
- “Section supervisor can approve results” means technical review. Medical validation and final report release remain pathologist/lab-director permissions.
- `technologist` retains accession permission because the frontend exposes “Scan accession” for that role; deployments can remove it through role grants without code changes.
- Collection tasks group specimens by the same order/patient/encounter/location/scheduled visit. Each container can still progress independently.
- A rejected specimen remains immutable. Recollection creates a new linked specimen rather than replacing the rejected identifier.
- External integrations are represented as connection/event state; actual vendor transports, email/SMS providers, card processors and hospital SSO are adapter boundaries and require deployment credentials.

## Multi-tenancy strategy

The verified access token identifies a user and membership, after which `authenticate`, `requireActiveAccount` and `tenantScope` derive the tenant and permitted site/department/ownership scope from the database. Client-supplied tenant, role, user or status fields are never authoritative. Business reads combine a mandatory `tenantId` predicate with site/department and practitioner/client filters; writes first resolve referenced entities inside the same scope. Billing authority is recomputed from tenant mode and order source on the server. Compound tenant indexes and uniqueness constraints support scoped lookup, and audit/lifecycle records are append-only evidence of high-risk transitions.

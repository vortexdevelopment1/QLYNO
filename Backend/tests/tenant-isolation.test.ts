import { orderReadScope, patientReadScope, specimenReadScope } from "../src/services/scope";
import type { RequestContext } from "../src/types/security";

const context: RequestContext = { userId: "USER-A", membershipId: "MEM-A", tenantId: "TENANT-A", status: "ACTIVE", roles: ["technologist"], permissions: ["orders.read", "specimens.read"], siteIds: ["SITE-A"], departmentIds: ["DEPT-A"] };

describe("tenant and ownership filters", () => {
  it("always anchors order queries to the authenticated tenant and site", () => { expect(orderReadScope(context)).toEqual({ tenantId: "TENANT-A", siteId: { in: ["SITE-A"] } }); });
  it("anchors specimen queries and their parent order to the same tenant", () => { expect(specimenReadScope(context)).toMatchObject({ tenantId: "TENANT-A", siteId: { in: ["SITE-A"] }, order: { tenantId: "TENANT-A" } }); });
  it("limits referring clinicians to their own practitioner record", () => { const doctor = { ...context, roles: ["referring_clinician"], practitionerId: "P-A", siteIds: [] }; expect(orderReadScope(doctor)).toEqual({ tenantId: "TENANT-A", practitionerId: "P-A" }); expect(patientReadScope(doctor)).toEqual({ tenantId: "TENANT-A", orders: { some: { tenantId: "TENANT-A", practitionerId: "P-A" } } }); });
  it("limits client users to their own organization", () => { const client = { ...context, roles: ["client_lab_user"], clientOrganizationId: "CLIENT-A", siteIds: [] }; expect(orderReadScope(client)).toEqual({ tenantId: "TENANT-A", clientOrganizationId: "CLIENT-A" }); });
});

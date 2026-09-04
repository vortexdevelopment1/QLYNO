import express from "express";
import request from "supertest";
import { authorize, rejectAuditorWrites, requirePermission } from "../src/middleware/authorize";
import { errorHandler } from "../src/middleware/error-handler";
import type { RequestContext } from "../src/types/security";

function appFor(context: RequestContext, middleware: express.RequestHandler) { const app = express(); app.use((req, _res, next) => { req.context = context; next(); }); app.post("/resource", middleware, (_req, res) => res.json({ ok: true })); app.use(errorHandler); return app; }
const base: RequestContext = { userId: "U1", membershipId: "M1", tenantId: "T1", status: "ACTIVE", roles: ["phlebotomist"], permissions: ["collection.confirm"], siteIds: ["S1"], departmentIds: [] };

describe("RBAC denials", () => {
  it("prevents phlebotomists from medical validation", async () => { await request(appFor(base, requirePermission("results.medical_validate"))).post("/resource").expect(403); });
  it("prevents pathologists from collection without explicit permission", async () => { await request(appFor({ ...base, roles: ["lab_director"], permissions: ["results.medical_validate"] }, requirePermission("collection.confirm"))).post("/resource").expect(403); });
  it("prevents auditors from all writes", async () => { await request(appFor({ ...base, roles: ["auditor"], permissions: ["quality.read"] }, rejectAuditorWrites)).post("/resource").expect(403); });
  it("does not reveal role details on allow-list denial", async () => { const response = await request(appFor(base, authorize("tenant_admin"))).post("/resource").expect(403); expect(response.body.error.message).toBe("Insufficient permissions"); });
  it("separates refund authority from ordinary payment authority", async () => { await request(appFor({ ...base, roles: ["reception_cashier"], permissions: ["billing.payment"] }, requirePermission("billing.refund"))).post("/resource").expect(403); });
  it("does not grant tenant administrators clinical accession authority", async () => { await request(appFor({ ...base, roles: ["tenant_admin"], permissions: ["admin.users"] }, requirePermission("specimen.accession"))).post("/resource").expect(403); });
});

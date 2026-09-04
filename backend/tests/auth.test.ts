import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import argon2 from "argon2";

const mockPrisma = {
  tenant: { findUnique: jest.fn() },
  user: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  tenantMembership: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
  role: { findFirst: jest.fn() },
  clientOrganization: { findFirst: jest.fn() },
  practitioner: { findFirst: jest.fn() },
  approvalRequest: { create: jest.fn() },
  userInvitation: { findUnique: jest.fn(), update: jest.fn() },
  authenticationAttempt: { create: jest.fn() },
  refreshSession: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  $transaction: jest.fn()
};
jest.mock("../src/db/prisma", () => ({ prisma: mockPrisma }));

import { authRoutes } from "../src/modules/auth/routes";
import { errorHandler } from "../src/middleware/error-handler";

const tenant = { id: "TEN-A", slug: "sunrise-hospital" };
const user = { id: "USR-A", email: "admin@sunrise.example", username: "admin", name: "Admin", status: "ACTIVE", failedLoginCount: 0, lockedUntil: null as Date | null, passwordHash: "" };
const membership = { id: "MEM-A", tenantId: tenant.id, userId: user.id, clientOrganizationId: null, practitionerId: null, user, roles: [{ role: { code: "tenant_admin", permissions: [{ permission: { code: "admin.users" } }] } }], siteScopes: [{ siteId: "SITE-A" }], departmentScopes: [{ departmentId: "DEPT-A" }] };

function makeApp() { const app = express(); app.use(express.json(), cookieParser()); app.use("/api/auth", authRoutes); app.use(errorHandler); return app; }

describe("unified authentication", () => {
  beforeAll(async () => { user.passwordHash = await argon2.hash("QlynoDemo!2026unit-test-password-pepper", { type: argon2.argon2id, memoryCost: 4096, timeCost: 2 }); });
  beforeEach(() => {
    jest.clearAllMocks(); user.failedLoginCount = 0; user.lockedUntil = null; user.status = "ACTIVE";
    mockPrisma.tenant.findUnique.mockResolvedValue(tenant); mockPrisma.user.findFirst.mockResolvedValue(user); mockPrisma.user.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ ...user, ...data })); mockPrisma.user.update.mockResolvedValue(user); mockPrisma.tenantMembership.findUnique.mockResolvedValue(membership); mockPrisma.tenantMembership.create.mockResolvedValue(membership); mockPrisma.role.findFirst.mockResolvedValue({ id: "ROLE-EXTERNAL", code: "referring_clinician" }); mockPrisma.clientOrganization.findFirst.mockResolvedValue({ id: "CLIENT-A" }); mockPrisma.practitioner.findFirst.mockResolvedValue({ id: "PRACTITIONER-A" }); mockPrisma.approvalRequest.create.mockResolvedValue({ id: "APPROVAL-A" }); mockPrisma.authenticationAttempt.create.mockResolvedValue({}); mockPrisma.refreshSession.create.mockResolvedValue({ id: "SESSION" }); mockPrisma.refreshSession.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.$transaction.mockImplementation(async (input: unknown) => Array.isArray(input) ? Promise.all(input) : (input as (database: typeof mockPrisma) => Promise<unknown>)(mockPrisma));
  });

  it("returns an access token and httpOnly refresh cookie on valid login", async () => { const response = await request(makeApp()).post("/api/auth/login").send({ identifier: user.email, password: "QlynoDemo!2026", tenantSlug: tenant.slug }).expect(200); expect(response.body.accessToken).toEqual(expect.any(String)); expect(response.body.user.tenantId).toBe(tenant.id); expect(response.headers["set-cookie"]?.[0]).toContain("qlyno_refresh="); expect(response.headers["set-cookie"]?.[0]).toContain("HttpOnly"); });
  it("records a failed login without exposing credential details", async () => { const response = await request(makeApp()).post("/api/auth/login").send({ identifier: user.email, password: "wrong-password", tenantSlug: tenant.slug }).expect(401); expect(response.body.error.message).toBe("Authentication required"); expect(mockPrisma.authenticationAttempt.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ success: false, reason: "INVALID_CREDENTIALS" }) })); });
  it("rejects an account during its lockout window", async () => { user.lockedUntil = new Date(Date.now() + 60_000); const response = await request(makeApp()).post("/api/auth/login").send({ identifier: user.email, password: "QlynoDemo!2026", tenantSlug: tenant.slug }).expect(423); expect(response.body.error.code).toBe("ACCOUNT_LOCKED"); });
  it("rejects crafted self-registration for internal roles with 403", async () => { await request(makeApp()).post("/api/auth/register").send({ tenantSlug: tenant.slug, email: "attacker@example.com", name: "Crafted User", password: "StrongPassword!123", requestedRole: "tenant_admin" }).expect(403); });
  it("creates an approval-gated external account through the single signup endpoint", async () => { const response = await request(makeApp()).post("/api/auth/register").send({ tenantSlug: tenant.slug, email: "doctor-new@example.com", name: "Dr. New User", password: "StrongPassword!123", requestedRole: "referring_clinician", practitionerId: "PRACTITIONER-A" }).expect(202); expect(response.body.data.status).toBe("PENDING_APPROVAL"); expect(mockPrisma.approvalRequest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tenantId: tenant.id, requestedRole: "referring_clinician", status: "PENDING" }) })); });
  it("returns the explicit approval gate instead of a token", async () => { user.status = "PENDING_APPROVAL"; const response = await request(makeApp()).post("/api/auth/login").send({ identifier: user.email, password: "QlynoDemo!2026", tenantSlug: tenant.slug }).expect(403); expect(response.body.error.code).toBe("AWAITING_APPROVAL"); expect(response.body.accessToken).toBeUndefined(); });
  it("consumes an internal invite once and activates the account", async () => { user.status = "PENDING_INVITE"; mockPrisma.userInvitation.findUnique.mockResolvedValue({ id: "INVITE-A", tenantId: tenant.id, email: user.email, usedAt: null, expiresAt: new Date(Date.now() + 60_000) }); mockPrisma.user.update.mockImplementation(async ({ data }: { data: { status: string } }) => ({ ...user, status: data.status })); const response = await request(makeApp()).post("/api/auth/register/complete-invite").send({ token: "invite-token-at-least-32-characters-long", name: "Invited User", password: "StrongPassword!123" }).expect(200); expect(response.body.data.status).toBe("ACTIVE"); expect(mockPrisma.userInvitation.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ usedAt: expect.any(Date) }) })); });
  it("rotates refresh tokens and revokes the entire family on replay", async () => { const current = { id: "SESSION-1", tenantId: tenant.id, userId: user.id, familyId: "FAMILY-1", tokenHash: "hash", expiresAt: new Date(Date.now() + 60_000), revokedAt: null as Date | null, replacedByTokenHash: null as string | null }; mockPrisma.refreshSession.findUnique.mockImplementation(async () => current); mockPrisma.refreshSession.update.mockImplementation(async ({ data }: { data: { revokedAt: Date; replacedByTokenHash: string } }) => { current.revokedAt = data.revokedAt; current.replacedByTokenHash = data.replacedByTokenHash; return current; }); const app = makeApp(); await request(app).post("/api/auth/refresh").set("Cookie", "qlyno_refresh=known-old-token").send({}).expect(200); await request(app).post("/api/auth/refresh").set("Cookie", "qlyno_refresh=known-old-token").send({}).expect(401); expect(mockPrisma.refreshSession.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { familyId: "FAMILY-1", userId: user.id } })); });
});

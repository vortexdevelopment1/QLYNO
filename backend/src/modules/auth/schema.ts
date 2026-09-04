import { z } from "zod";
import { SYSTEM_ROLES } from "../../config/permissions";
const password = z.string().min(12).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/);
export const loginSchema = z.object({ identifier: z.string().min(3).max(254), password: z.string().min(1).max(256), tenantSlug: z.string().min(2).max(80) }).strict();
export const registerSchema = z.object({ tenantSlug: z.string().min(2).max(80), email: z.string().email(), username: z.string().min(3).max(64).optional(), name: z.string().min(2).max(120), password, requestedRole: z.enum(SYSTEM_ROLES), clientOrganizationId: z.string().optional(), practitionerId: z.string().optional() }).strict();
export const completeInviteSchema = z.object({ token: z.string().min(32).max(512), name: z.string().min(2).max(120), username: z.string().min(3).max(64).optional(), password }).strict();
export const forgotPasswordSchema = z.object({ email: z.string().email(), tenantSlug: z.string().min(2).max(80) }).strict();
export const resetPasswordSchema = z.object({ token: z.string().min(32).max(512), password }).strict();
export const emptySchema = z.object({}).strict();

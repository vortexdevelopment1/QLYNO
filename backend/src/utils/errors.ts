export class AppError extends Error {
  constructor(public readonly status: number, message: string, public readonly code = "REQUEST_FAILED", public readonly details?: unknown) { super(message); }
}
export const unauthorized = () => new AppError(401, "Authentication required", "UNAUTHENTICATED");
export const forbidden = () => new AppError(403, "Insufficient permissions", "FORBIDDEN");
export const notFound = (entity = "Resource") => new AppError(404, `${entity} not found`, "NOT_FOUND");

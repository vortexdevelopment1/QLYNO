import type { AuthenticatedUser, RequestContext } from "./security";
declare global {
  namespace Express {
    interface Request { user?: AuthenticatedUser; context?: RequestContext; requestId: string; }
  }
}
export {};

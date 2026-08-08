// Better Auth route handler (catch-all).
// Mounts all auth endpoints (sign-in, sign-up, session, ...) under /api/auth.
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Auth endpoints are inherently dynamic; never statically prerender them.
export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth);

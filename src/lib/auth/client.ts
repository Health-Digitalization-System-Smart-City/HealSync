// Better Auth browser client. Used by client components (sign out, session
// refresh). Never use this in Server Components — resolve sessions with
// `getSession` / `requireAuth` from "@/lib/auth/session" instead.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

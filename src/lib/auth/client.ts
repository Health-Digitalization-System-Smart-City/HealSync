// Typed Better Auth client — used by client components for sign-in, sign-out,
// and password-reset requests. The API surface is inferred from the server
// configuration in src/lib/auth/index.ts (API.md §30).
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient();

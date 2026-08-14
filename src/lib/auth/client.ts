<<<<<<< HEAD
// Better Auth browser client. Used by client components (sign out, session
// refresh). Never use this in Server Components — resolve sessions with
// `getSession` / `requireAuth` from "@/lib/auth/session" instead.
import { createAuthClient } from "better-auth/react";
=======
// Typed Better Auth client — used by client components for sign-in, sign-out,
// and password-reset requests. The API surface is inferred from the server
// configuration in src/lib/auth/index.ts (API.md §30).
import { createAuthClient } from "better-auth/client";
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e

export const authClient = createAuthClient();

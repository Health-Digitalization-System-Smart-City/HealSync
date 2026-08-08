// Better Auth configuration.
//
// Phase 1 scope: the authentication *foundation* only.
// - Administrators will authenticate (email + password).
// - Patients do NOT authenticate — the patient feedback flow will remain
//   unauthenticated.
// Roles, permissions, and authorization policies are deliberately NOT
// configured yet; they will be designed in a later phase.
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export type Session = typeof auth.$Infer.Session;

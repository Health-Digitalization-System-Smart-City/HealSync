// Better Auth configuration.
//
// Dashboard users authenticate with email + password. Public self-registration
// is disabled; dashboard users are provisioned by an Admin through the
// createUser Server Action (see docs/SECURITY.md §9).
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { ROLES } from "@/lib/permissions";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      // RBAC role. Fixed set (Admin / Manager / Analyst); managed only through
      // the Admin createUser Server Action and the seed/bootstrap path.
      // `input: false` prevents clients from setting the role themselves.
      role: {
        type: "string",
        required: false,
        defaultValue: ROLES.ANALYST,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;

// Better Auth configuration — Authentication + RBAC target state.
//
<<<<<<< HEAD
// Dashboard users authenticate with email + password. Public self-registration
// is disabled; dashboard users are provisioned by an Admin through the
// createUser Server Action (see docs/SECURITY.md §9).
=======
// Implements docs/SECURITY.md §9 (Authentication) and §10 (Authorization):
// - Dashboard users authenticate with email + password only.
// - Public self-registration is disabled (disableSignUp = true); dashboard
//   users are provisioned by Admin via the createUser Server Action
//   (API.md §14, security.md §9 "Dashboard user provisioning").
// - The admin plugin (adminRoles: ["Admin"]) unlocks server-side user
//   provisioning and role management (security.md §9, API.md §30).
// - Disabled users cannot authenticate: the session.create.before hook rejects
//   sign-in when user.isActive is false (security.md §9). Protected code also
//   re-checks isActive server-side on every request (defense in depth).
// - lastLoginAt is tracked on each new session (database.md §3).
// - Password reset uses Better Auth's request/reset endpoints; the reset URL is
//   delivered by the email service (features/auth/email).
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

import { db } from "@/lib/db";
<<<<<<< HEAD
import { ROLES } from "@/lib/permissions";
=======
import { sendPasswordResetEmail } from "@/features/auth/email";
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
<<<<<<< HEAD
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
=======
    // Unauthenticated clients cannot self-register (security.md §9). The only
    // path that creates dashboard users is the Admin createUser Server Action.
    disableSignUp: true,
    // Password reset (ROADMAP 1.7). The reset URL is emailed to the user.
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },

  plugins: [
    admin({
      // security.md §4 — only Admin may manage dashboard users. The plugin
      // gates its /admin/* endpoints on user.role ∈ adminRoles.
      adminRoles: ["Admin"],
      defaultRole: "user",
    }),
  ],

  databaseHooks: {
    session: {
      create: {
        // Block sign-in for disabled accounts (security.md §9: "Disabled users
        // cannot authenticate"). Returning false aborts session creation.
        before: async (session) => {
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });
          if (user && !user.isActive) return false;
          return { data: session };
        },
        // Track the most recent sign-in (database.md §3 — User.lastLoginAt).
        after: async (session) => {
          await db.user
            .update({
              where: { id: session.userId },
              data: { lastLoginAt: new Date() },
            })
            .catch(() => {
              // Non-critical bookkeeping: never fail authentication because of it.
            });
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session expiry on active use within 24h
  },

  // Per-IP rate limiting for /api/auth/* endpoints. The global budget (100
  // per minute) applies to most endpoints; Better Auth's built-in special
  // rules additionally cap sign-in at 3 attempts per 10s per IP (brute-force
  // protection, security.md §9). The e2e suite signs in many times in
  // parallel, so BETTER_AUTH_RATE_LIMIT_RELAXED=true (test environments
  // only) widens the sign-in budget — never set it in production.
  rateLimit: {
    window: 60,
    max: 100,
    ...(process.env.BETTER_AUTH_RATE_LIMIT_RELAXED === "true"
      ? {
          customRules: {
            "/sign-in/email": { window: 60, max: 1000 },
            "/sign-in": { window: 60, max: 1000 },
          },
        }
      : {}),
>>>>>>> d7f1791ce0ab492099e231d8e60834dae192064e
  },
});

export type Session = typeof auth.$Infer.Session;

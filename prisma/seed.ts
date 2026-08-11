// Seed — HealSync development/staging database
//
// Populates the initial data required by the application per
// docs/DATABASE.md §28:
//
//   Roles (3 fixed — Admin / Manager / Analyst)
//   Permissions (18 — full set from API.md §8 / security.md §3)
//   Role→permission grants (the precise matrix, interpreted from the docs)
//   Initial admin user (created via the same Better Auth path used by
//     the createUser Server Action in production; security.md §9)
//   13 placeholder branches (configurable; PRD.md §33 decision 1)
//   3 services (Laboratory, Pharmacy, Reception)
//   Branch→service links
//   Sample feedback records
//
// Idempotent: safe to re-run (upserts, skips feedback if already present).
// Production: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars to avoid
// hard-coded defaults; seed only in controlled deployments.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { auth } from "../src/lib/auth";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DATABASE_URL is not set; seed requires a running database.");

const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@healsync.com";
const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("SEED_ADMIN_PASSWORD is required in production");
      })()
    : "Admin@12345");

const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "System Admin";

// ---------------------------------------------------------------------------
// Static data (database.md §4–§5, §6, §7)
// ---------------------------------------------------------------------------

interface RoleDef {
  name: string;
  description: string;
}

const ROLES: RoleDef[] = [
  {
    name: "Admin",
    description:
      "Full system access. Only role that can manage users and access raw patient phone numbers.",
  },
  {
    name: "Manager",
    description:
      "Operational dashboard access: analytics and permitted feedback. Cannot create users or view phone numbers.",
  },
  {
    name: "Analyst",
    description: "Read-only dashboard and analytics access.",
  },
];

/** All 18 permissions defined in API.md §8 / security.md §3. */
const PERMISSIONS: string[] = [
  "analytics.read",
  "analytics.ai",
  "feedback.read",
  "feedback.update",
  "feedback.delete",
  "branch.read",
  "branch.create",
  "branch.update",
  "branch.delete",
  "service.read",
  "service.create",
  "service.update",
  "service.delete",
  "user.read",
  "user.create",
  "user.update",
  "user.disable",
];

/**
 * Role→permission matrix.
 *
 * Interpreted from security.md §2–§6 and API.md §8; the final matrix is
 * defined here (seed/configuration) per security.md §3 and is not editable
 * through the dashboard.
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [...PERMISSIONS],
  Manager: ["analytics.read", "feedback.read", "branch.read", "service.read"],
  Analyst: ["analytics.read", "branch.read", "service.read"],
};

/**
 * 13 placeholder branches (PRD.md §33 decision 1: "Exact names of the 13
 * branches"). Replace with real names when resolved.
 */
const BRANCHES: { name: string; code: string }[] = Array.from(
  { length: 13 },
  (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { name: `Branch ${n}`, code: `BR-${n}` };
  },
);

/**
 * Core services from DATABASE.md §8 example. Extensible via the admin UI.
 */
const SERVICES: { name: string; description: string }[] = [
  { name: "Reception", description: "Front desk and patient intake services." },
  { name: "Pharmacy", description: "Dispensing of prescribed medications." },
  { name: "Laboratory", description: "Diagnostic tests and sample analysis." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("🌱 HealSync seed — starting");

  // ── 1. Roles ──────────────────────────────────────────────────────────

  console.log("  • Seeding roles…");
  const roleRecords: Record<string, string> = {}; // name → id
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
    roleRecords[role.name] = role.id;
  }

  // ── 2. Permissions ───────────────────────────────────────────────────

  console.log("  • Seeding permissions…");
  const permissionRecords: Record<string, string> = {}; // name → id
  for (const name of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    permissionRecords[perm.name] = perm.id;
  }

  // ── 3. Role→Permission grants ────────────────────────────────────────

  console.log("  • Seeding role-permission grants…");
  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleRecords[roleName];
    if (!roleId) throw new Error(`Role "${roleName}" not found`);

    for (const permName of permNames) {
      const permissionId = permissionRecords[permName];
      if (!permissionId) throw new Error(`Permission "${permName}" not found`);

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  // ── 4. Admin user ────────────────────────────────────────────────────

  console.log(`  • Seeding admin user (${ADMIN_EMAIL})…`);
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!existingAdmin) {
    // Use the app's auth flow (single source of truth for password hashing).
    // signUpEmail works server-side regardless of disableSignUp (security.md §9).
    const created = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });

    if ("user" in created) {
      await prisma.user.update({
        where: { id: created.user.id },
        data: {
          role: "Admin",
          roleId: roleRecords["Admin"],
        },
      });
    } else {
      throw new Error(
        `signUpEmail returned unexpected shape: ${JSON.stringify(created)}`,
      );
    }

    console.log("  ✓ Admin user created");
  } else {
    // Ensure role & roleId are set on re-run
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: "Admin",
        roleId: roleRecords["Admin"],
        isActive: true,
      },
    });
    console.log("  ✓ Admin user already exists — updated role/status");
  }

  // ── 5. Branches ──────────────────────────────────────────────────────

  console.log("  • Seeding branches…");
  for (const b of BRANCHES) {
    await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, isActive: true },
      create: { name: b.name, code: b.code },
    });
  }

  // ── 6. Services ──────────────────────────────────────────────────────

  console.log("  • Seeding services…");
  const serviceRecords: Record<string, string> = {};
  for (const s of SERVICES) {
    const existingSvc = await prisma.service.findFirst({
      where: { name: s.name },
    });
    if (existingSvc) {
      serviceRecords[existingSvc.name] = existingSvc.id;
      await prisma.service.update({
        where: { id: existingSvc.id },
        data: { description: s.description, isActive: true },
      });
    } else {
      const svc = await prisma.service.create({
        data: { name: s.name, description: s.description },
      });
      serviceRecords[svc.name] = svc.id;
    }
  }

  // ── 7. Branch→Service links ──────────────────────────────────────────

  console.log("  • Seeding branch-service links…");
  const branches = await prisma.branch.findMany({ where: { isActive: true } });
  for (const branch of branches) {
    for (const svc of SERVICES) {
      const serviceId = serviceRecords[svc.name];
      if (!serviceId) continue;

      await prisma.branchService.upsert({
        where: { branchId_serviceId: { branchId: branch.id, serviceId } },
        update: { isActive: true },
        create: { branchId: branch.id, serviceId },
      });
    }
  }

  // ── 8. Sample feedback (idempotent: only if table empty) ──────────────

  const existingFeedbackCount = await prisma.feedback.count();
  if (existingFeedbackCount === 0) {
    console.log("  • Seeding sample feedback…");

    const targetBranches = await prisma.branch.findMany({
      take: 3,
      orderBy: { createdAt: "asc" },
    });
    const targetServices = await prisma.branchService.findMany({
      take: 3,
      include: { service: true, branch: true },
    });

    const sampleFeedback = [
      {
        phoneNumber: "+251911111111",
        rating: "VERY_SATISFIED" as const,
        comment:
          "Excellent service, the staff was very professional and caring.",
      },
      {
        phoneNumber: "+251922222222",
        rating: "GOOD" as const,
        comment: "Generally satisfied but the waiting time could be improved.",
      },
      {
        phoneNumber: "+251933333333",
        rating: "NEUTRAL" as const,
        comment: "Average experience, nothing special.",
      },
      {
        phoneNumber: "+251944444444",
        rating: "NOT_SATISFIED" as const,
        comment: "Had issues with the reception process. Needs improvement.",
      },
      {
        phoneNumber: "+251955555555",
        rating: "VERY_SATISFIED" as const,
        comment: null,
      },
    ];

    for (const fb of sampleFeedback) {
      const branchSvc =
        targetServices[Math.floor(Math.random() * targetServices.length)];
      if (!branchSvc) continue;

      await prisma.feedback.create({
        data: {
          phoneNumber: fb.phoneNumber,
          branchId: branchSvc.branchId,
          serviceId: branchSvc.serviceId,
          rating: fb.rating,
          comment: fb.comment,
          createdAt: new Date(
            Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
          ), // random past 30d
        },
      });
    }

    console.log(`  ✓ Created ${sampleFeedback.length} sample feedback records`);
  } else {
    console.log(
      `  • Skipping sample feedback (${existingFeedbackCount} records already exist)`,
    );
  }

  console.log("✅ HealSync seed — complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

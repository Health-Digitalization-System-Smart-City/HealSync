// Seed — HealSync development/staging database
//
// Populates the initial data required by the application per
// docs/DATABASE.md §28:
//
//   Roles (3 fixed — Admin / Manager / Analyst)
//   Permissions (full set — mirrored from src/lib/permissions.ts)
//   Role→permission grants (the precise matrix, interpreted from the docs)
//   Initial admin user (bootstrapped with Better Auth's own password hashing;
//     security.md §9 "Dashboard user provisioning")
//   13 placeholder branches (configurable; PRD.md §33 decision 1)
//   3 services (Laboratory, Pharmacy, Reception)
//   Branch→service links
//   Sample feedback records
//   Sample operational tasks
//
// Idempotent: safe to re-run (upserts, skips feedback if already present).
// Production: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars to avoid
// hard-coded defaults; seed only in controlled deployments.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

import { PrismaClient } from "../src/generated/prisma/client";

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

/** All permissions — mirrored from src/lib/permissions.ts (single source of truth). */
const PERMISSIONS: string[] = [
  "analytics.read",
  "analytics.ai",
  "feedback.read",
  "feedback.update",
  "feedback.delete",
  "feedback.phone",
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
  "task.read",
  "task.manage",
];

/**
 * Role→permission matrix.
 *
 * Interpreted from security.md §2–§6 and API.md §8; the final matrix is
 * defined here (seed/configuration) per security.md §3 and is not editable
 * through the dashboard.
 */
// Mirrors the matrix in src/lib/permissions.ts. Feedback is strictly
// read-only for Manager/Analyst (no update/delete/phone — Admin only);
// tasks are manageable by Admin + Manager.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: [...PERMISSIONS],
  Manager: [
    "analytics.read",
    "analytics.ai",
    "feedback.read",
    "branch.read",
    "service.read",
    "task.read",
    "task.manage",
  ],
  Analyst: ["analytics.read", "analytics.ai", "feedback.read", "task.read"],
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

// function delay(ms: number): Promise<void> {
//   return new Promise((r) => setTimeout(r, ms));
// }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("🌱 HealSync seed — starting");

  // ── 1. Roles ──────────────────────────────────────────────────────────

  console.log("  • Seeding roles…");
  const roleRecords: Record<string, string> = {}; // name → id
  for (const r of ROLES) {
    const existingRole = await prisma.role.findUnique({
      where: { name: r.name },
      select: { id: true },
    });

    const role = existingRole
      ? await prisma.role.update({
          where: { id: existingRole.id },
          data: { description: r.description },
        })
      : await prisma.role.create({
          data: { name: r.name, description: r.description },
        });
    roleRecords[role.name] = role.id;
  }

  // ── 2. Permissions ───────────────────────────────────────────────────

  console.log("  • Seeding permissions…");
  const permissionRecords: Record<string, string> = {}; // name → id
  for (const name of PERMISSIONS) {
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
      select: { id: true },
    });

    const perm = existingPermission
      ? await prisma.permission.findUnique({
          where: { id: existingPermission.id },
        })
      : await prisma.permission.create({ data: { name } });

    if (!perm) throw new Error(`Permission "${name}" not found after seed`);
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

      const existingGrant = await prisma.rolePermission.findUnique({
        where: { roleId_permissionId: { roleId, permissionId } },
        select: { roleId: true, permissionId: true },
      });

      if (!existingGrant) {
        await prisma.rolePermission.create({
          data: { roleId, permissionId },
        });
      }
    }
  }

  // ── 4. Admin user ────────────────────────────────────────────────────

  console.log(`  • Seeding admin user (${ADMIN_EMAIL})…`);
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!existingAdmin) {
    // Public self-registration is disabled in the auth config (disableSignUp),
    // and auth.api.signUpEmail honors that flag server-side. The bootstrap
    // admin is therefore created directly through Prisma, mirroring Better
    // Auth's sign-up: a user row plus a "credential" account whose password
    // is hashed with the library's own hasher (better-auth/crypto) — the same
    // algorithm used to verify passwords at sign-in (security.md §9).
    const adminRoleId = roleRecords["Admin"];
    if (!adminRoleId) throw new Error('Role "Admin" not found');

    const adminUser = await prisma.user.create({
      data: {
        // Better Auth generates user ids itself (no DB default in the schema).
        id: crypto.randomUUID(),
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: "Admin",
        roleId: adminRoleId,
        isActive: true,
        emailVerified: true,
      },
    });

    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: adminUser.id,
        accountId: adminUser.id,
        providerId: "credential",
        password: await hashPassword(ADMIN_PASSWORD),
      },
    });

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
    const existingBranch = await prisma.branch.findUnique({
      where: { code: b.code },
      select: { id: true },
    });

    if (existingBranch) {
      await prisma.branch.update({
        where: { id: existingBranch.id },
        data: { name: b.name, isActive: true },
      });
    } else {
      await prisma.branch.create({
        data: { name: b.name, code: b.code },
      });
    }
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

      const existingLink = await prisma.branchService.findUnique({
        where: { branchId_serviceId: { branchId: branch.id, serviceId } },
        select: { branchId: true, serviceId: true },
      });

      if (existingLink) {
        await prisma.branchService.update({
          where: { branchId_serviceId: { branchId: branch.id, serviceId } },
          data: { isActive: true },
        });
      } else {
        await prisma.branchService.create({
          data: { branchId: branch.id, serviceId },
        });
      }
    }
  }

  // ── 8. Sample feedback (idempotent: only if table empty) ──────────────

  const existingFeedbackCount = await prisma.feedback.count();
  if (existingFeedbackCount === 0) {
    console.log("  • Seeding sample feedback…");

    // const targetBranches = await prisma.branch.findMany({
    //   take: 3,
    //   orderBy: { createdAt: "asc" },
    // });
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

  // ── 9. Sample tasks (idempotent: only if table empty) ────────────────

  const existingTaskCount = await prisma.task.count();
  if (existingTaskCount === 0) {
    console.log("  • Seeding sample tasks…");

    const taskBranches = await prisma.branch.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });
    const adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: { id: true },
    });

    const sampleTasks = [
      {
        title: "Urgent Patient Follow-up: Cardiology Consult",
        description:
          "Follow up with patient after a 2-star rating regarding extended wait time in the clinic.",
        category: "Follow-up",
        priority: "urgent",
        status: "pending",
        assigneeName: "Sarah Jenkins",
        assigneeRole: "Care Coordinator",
        dueDate: "Today, 4:00 PM",
        createdAt: 0,
      },
      {
        title: "Pharmacy Dispensing Speed Audit",
        description:
          "Review peak-hour medication dispensing bottlenecks reported at the branch.",
        category: "Inspection",
        priority: "high",
        status: "in_progress",
        assigneeName: "Kevin Miller",
        assigneeRole: "Lead Pharmacist",
        dueDate: "Tomorrow, 11:00 AM",
        createdAt: 1,
      },
      {
        title: "Quarterly Diagnostic Ultrasound Calibration",
        description:
          "Mandatory calibration and certified maintenance for the branch's ultrasound units.",
        category: "Equipment",
        priority: "medium",
        status: "pending",
        assigneeName: "Nathan Cole",
        assigneeRole: "Biomedical Engineer",
        dueDate: "Aug 18, 2026",
        createdAt: 2,
      },
      {
        title: "Pediatric Waiting Lounge Childproofing Review",
        description:
          "Verify sanitization stations and interactive play tablet stations are fully operational.",
        category: "Protocol",
        priority: "low",
        status: "completed",
        assigneeName: "Maya Sharma",
        assigneeRole: "Pediatric Lead",
        dueDate: "Aug 14, 2026",
        createdAt: 3,
      },
      {
        title: "Patient Feedback Resolution: Staff Courtesy Commendation",
        description:
          "Deliver a commendation certificate to the night-shift nursing team for outstanding patient care scores.",
        category: "Staffing",
        priority: "medium",
        status: "completed",
        assigneeName: "Liam Gallagher",
        assigneeRole: "Branch Director",
        dueDate: "Aug 13, 2026",
        createdAt: 4,
      },
      {
        title: "Investigate Peak-Hour Wait Times",
        description:
          "Analyze triage queue logs between 5 PM and 7 PM to reduce patient wait times.",
        category: "Inspection",
        priority: "high",
        status: "pending",
        assigneeName: "Rachel Zheng",
        assigneeRole: "Operations Lead",
        dueDate: "Aug 16, 2026",
        createdAt: 5,
      },
    ];

    const now = Date.now();
    for (const task of sampleTasks) {
      const branch =
        taskBranches[task.createdAt % Math.max(taskBranches.length, 1)];
      await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate,
          assigneeName: task.assigneeName,
          assigneeRole: task.assigneeRole,
          branchId: branch?.id ?? null,
          createdById: adminUser?.id ?? null,
          createdAt: new Date(now - (task.createdAt + 1) * 24 * 60 * 60 * 1000),
        },
      });
    }

    console.log(`  ✓ Created ${sampleTasks.length} sample task records`);
  } else {
    console.log(
      `  • Skipping sample tasks (${existingTaskCount} records already exist)`,
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

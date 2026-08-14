"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { fail, ok, type ActionResponse } from "@/lib/actions";
import { requirePermissionResult } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/permissions";
import { writeAudit } from "@/lib/audit";
import {
  createTaskSchema,
  updateTaskStatusSchema,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validation/tasks";

// ---------------------------------------------------------------------------
// Types & row mapping
// ---------------------------------------------------------------------------

/** The shape the dashboard renders (kept stable for the task board UI). */
export interface TaskData {
  id: string;
  title: string;
  description: string;
  branchId: string | null;
  branchName: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignee: { name: string; role: string };
  createdAt: string;
}

export interface TaskBoardData {
  tasks: TaskData[];
  branches: { id: string; name: string }[];
}

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  branchId: true,
  category: true,
  priority: true,
  status: true,
  dueDate: true,
  assigneeName: true,
  assigneeRole: true,
  createdAt: true,
  branch: { select: { name: true } },
} as const;

type TaskRow = {
  id: string;
  title: string;
  description: string;
  branchId: string | null;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  assigneeName: string;
  assigneeRole: string;
  createdAt: Date;
  branch: { name: string } | null;
};

function toTaskData(row: TaskRow): TaskData {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    branchId: row.branchId,
    branchName: row.branch?.name ?? "Unassigned",
    category: row.category as TaskCategory,
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    dueDate: row.dueDate,
    assignee: { name: row.assigneeName, role: row.assigneeRole },
    createdAt: row.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Loads the task board (tasks + branch options). Requires `task.read`.
 * Branch options come from the database so task creation always references a
 * real branch.
 */
export async function getTaskBoardData(): Promise<
  ActionResponse<TaskBoardData>
> {
  const auth = await requirePermissionResult(PERMISSIONS.TASK_READ);
  if (!auth.success) return auth;

  try {
    const [tasks, branches] = await Promise.all([
      db.task.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: TASK_SELECT,
      }),
      db.branch.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);

    return ok({ tasks: tasks.map(toTaskData), branches });
  } catch (error) {
    console.error("Failed to load task board:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to load tasks. Please try again later.",
    );
  }
}

// ---------------------------------------------------------------------------
// Mutations (require task.manage + audit)
// ---------------------------------------------------------------------------

/** Creates a task. Requires `task.manage`; writes an audit record. */
export async function createTask(
  input: unknown,
): Promise<ActionResponse<TaskData>> {
  const auth = await requirePermissionResult(PERMISSIONS.TASK_MANAGE);
  if (!auth.success) return auth;

  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      "Please check the task details and try again.",
      {
        ...parsed.error.flatten().fieldErrors,
      },
    );
  }

  const { title, description, branchId, category, priority, dueDate } =
    parsed.data;

  try {
    const task = await db.task.create({
      data: {
        title,
        description,
        branchId: branchId ?? null,
        category,
        priority,
        dueDate,
        status: "pending",
        assigneeName: "Clinic Duty Lead",
        assigneeRole: "Coordinator",
        createdById: auth.data.user.id,
      },
      select: TASK_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: "create",
      entityType: "task",
      entityId: task.id,
      metadata: { title, branchId: branchId ?? null },
    });

    revalidatePath("/dashboard/tasks");
    return ok(toTaskData(task));
  } catch (error) {
    console.error("Failed to create task:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to create the task. Please try again.",
    );
  }
}

/** Advances a task's status. Requires `task.manage`; writes an audit record. */
export async function updateTaskStatus(
  input: unknown,
): Promise<ActionResponse<TaskData>> {
  const auth = await requirePermissionResult(PERMISSIONS.TASK_MANAGE);
  if (!auth.success) return auth;

  const parsed = updateTaskStatusSchema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid status update.");
  }

  const { id, status } = parsed.data;

  try {
    const existing = await db.task.findUnique({
      where: { id },
      select: { id: true, deletedAt: true },
    });
    if (!existing || existing.deletedAt) {
      return fail("NOT_FOUND", "Task not found.");
    }

    const task = await db.task.update({
      where: { id },
      data: { status },
      select: TASK_SELECT,
    });

    await writeAudit({
      actorId: auth.data.user.id,
      action: "update",
      entityType: "task",
      entityId: id,
      metadata: { status },
    });

    revalidatePath("/dashboard/tasks");
    return ok(toTaskData(task));
  } catch (error) {
    console.error("Failed to update task:", error);
    return fail(
      "DATABASE_ERROR",
      "Unable to update the task. Please try again.",
    );
  }
}

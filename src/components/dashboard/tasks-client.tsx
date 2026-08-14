"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  User,
  X,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  createTask,
  getTaskBoardData,
  updateTaskStatus,
  type TaskData,
} from "@/features/tasks/actions";
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validation/tasks";
import { ROLES, type Role } from "@/lib/permissions";

function nextStatus(status: TaskStatus): TaskStatus {
  if (status === "pending") return "in_progress";
  if (status === "in_progress") return "completed";
  return "pending";
}

export function TasksClient({ userRole }: { userRole: Role }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Form state for creating a new task
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBranchId, setNewBranchId] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");
  const [newCategory, setNewCategory] =
    useState<(typeof TASK_CATEGORIES)[number]>("Follow-up");
  const [newDueDate, setNewDueDate] = useState("");

  const canManage = userRole === ROLES.ADMIN || userRole === ROLES.MANAGER;

  const boardQuery = useQuery({
    queryKey: ["task-board"],
    queryFn: async () => {
      const result = await getTaskBoardData();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const tasks = boardQuery.data?.tasks ?? [];
  const branches = boardQuery.data?.branches ?? [];
  const loading = boardQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task-board"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["task-board"] });
    },
  });

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" ? true : task.priority === priorityFilter;
    const matchesBranch =
      branchFilter === "all" ? true : task.branchId === branchFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesBranch;
  });

  function toggleTaskStatus(task: TaskData) {
    if (!canManage) return;
    statusMutation.mutate({ id: task.id, status: nextStatus(task.status) });
  }

  function openNewTaskDialog() {
    if (branches.length > 0) setNewBranchId(branches[0].id);
    setIsNewTaskOpen(true);
  }

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || createMutation.isPending) return;

    createMutation.mutate(
      {
        title: newTitle.trim(),
        description: newDescription.trim(),
        branchId: newBranchId || undefined,
        category: newCategory,
        priority: newPriority,
        dueDate: newDueDate.trim(),
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewDescription("");
          setNewBranchId("");
          setNewPriority("medium");
          setNewCategory("Follow-up");
          setNewDueDate("");
          setIsNewTaskOpen(false);
        },
      },
    );
  }

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="animate-in fade-in-50 flex flex-col gap-6 duration-300">
      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          onClick={() =>
            setStatusFilter(statusFilter === "pending" ? "all" : "pending")
          }
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
            statusFilter === "pending"
              ? "border-amber-500/80 bg-amber-500/10 shadow-xs"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}
        >
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Pending Actions
            </span>
            <div className="text-foreground text-2xl font-bold">
              {pendingCount}
            </div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-4.5" />
          </span>
        </div>

        <div
          onClick={() =>
            setStatusFilter(
              statusFilter === "in_progress" ? "all" : "in_progress",
            )
          }
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
            statusFilter === "in_progress"
              ? "border-blue-500/80 bg-blue-500/10 shadow-xs"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}
        >
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              In Progress
            </span>
            <div className="text-foreground text-2xl font-bold">
              {inProgressCount}
            </div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <AlertCircle className="size-4.5" />
          </span>
        </div>

        <div
          onClick={() =>
            setStatusFilter(statusFilter === "completed" ? "all" : "completed")
          }
          className={cn(
            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
            statusFilter === "completed"
              ? "border-emerald-500/80 bg-emerald-500/10 shadow-xs"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}
        >
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Completed
            </span>
            <div className="text-foreground text-2xl font-bold">
              {completedCount}
            </div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4.5" />
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                placeholder="Search tasks, descriptions, or assignees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-border bg-background text-foreground focus:ring-ring h-9 rounded-lg border px-2.5 text-xs font-medium outline-none focus:ring-2"
                aria-label="Filter by task status"
              >
                <option value="all">All Statuses</option>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border-border bg-background text-foreground focus:ring-ring h-9 rounded-lg border px-2.5 text-xs font-medium outline-none focus:ring-2"
                aria-label="Filter by task priority"
              >
                <option value="all">All Priorities</option>
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="border-border bg-background text-foreground focus:ring-ring h-9 max-w-[180px] rounded-lg border px-2.5 text-xs font-medium outline-none focus:ring-2"
                aria-label="Filter by clinic branch"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {canManage ? (
                <Button
                  onClick={openNewTaskDialog}
                  className="h-9 gap-1.5 shadow-xs"
                >
                  <Plus className="size-4" />
                  <span>New Task</span>
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">Loading tasks…</p>
          </Card>
        ) : boardQuery.isError ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {boardQuery.error instanceof Error
                ? boardQuery.error.message
                : "Unable to load tasks."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void boardQuery.refetch()}
            >
              Retry
            </Button>
          </Card>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">
              {tasks.length === 0
                ? "No tasks yet. Create your first operational task."
                : "No tasks match your current filter criteria."}
            </p>
            {tasks.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                  setBranchFilter("all");
                }}
              >
                Reset Filters
              </Button>
            ) : null}
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between",
                  isCompleted
                    ? "border-border/50 bg-muted/20 opacity-70"
                    : "border-border/80 bg-card hover:border-primary/40 hover:shadow-2xs",
                )}
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={() => toggleTaskStatus(task)}
                    disabled={!canManage || statusMutation.isPending}
                    aria-label={`Mark task ${task.title} status`}
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : task.status === "in_progress"
                          ? "border-blue-500 bg-blue-500/20 text-blue-600"
                          : "border-muted-foreground/40 hover:border-primary",
                      !canManage && "cursor-default opacity-70",
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="size-4" />
                    ) : task.status === "in_progress" ? (
                      <div className="size-2 rounded-full bg-blue-600" />
                    ) : null}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={cn(
                          "text-foreground text-sm font-semibold",
                          isCompleted && "text-muted-foreground line-through",
                        )}
                      >
                        {task.title}
                      </h3>
                      <Badge
                        variant={
                          task.priority === "urgent"
                            ? "destructive"
                            : task.priority === "high"
                              ? "secondary"
                              : "outline"
                        }
                        className="px-1.5 py-0 text-[10px] font-bold uppercase"
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {task.category}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
                      {task.description || "No description provided."}
                    </p>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                      <span className="text-foreground font-medium">
                        {task.branchName}
                      </span>
                      <span>•</span>
                      {task.dueDate ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>Due {task.dueDate}</span>
                          </span>
                          <span>•</span>
                        </>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        <span>
                          {task.assignee.name} ({task.assignee.role})
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Status Badge / Action */}
                <div className="flex items-center gap-2 sm:self-center">
                  <Badge
                    variant={
                      task.status === "completed"
                        ? "default"
                        : task.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                    className="text-xs capitalize"
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Dialog / Modal */}
      <Dialog.Root open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity" />
          <Dialog.Popup className="border-border bg-card fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl">
            <div className="border-border flex items-center justify-between border-b pb-4">
              <h2 className="text-foreground text-lg font-bold">
                Create Clinic Operational Task
              </h2>
              <Dialog.Close
                aria-label="Close dialog"
                className="text-muted-foreground hover:bg-muted rounded-lg p-1"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-semibold">
                  Task Title
                </label>
                <Input
                  required
                  placeholder="e.g. Urgent Follow-up on Pediatric Triage Wait Times"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-semibold">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="border-input placeholder:text-muted-foreground focus:ring-ring w-full rounded-lg border bg-transparent p-2 text-xs outline-none focus:ring-2"
                  placeholder="Actionable steps or patient context..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-semibold">
                    Clinic Branch
                  </label>
                  <select
                    value={newBranchId}
                    onChange={(e) => setNewBranchId(e.target.value)}
                    className="border-input focus:ring-ring h-9 w-full rounded-lg border bg-transparent px-2 text-xs outline-none focus:ring-2"
                  >
                    {branches.length === 0 ? (
                      <option value="" className="bg-popover text-foreground">
                        No branches available
                      </option>
                    ) : (
                      branches.map((b) => (
                        <option
                          key={b.id}
                          value={b.id}
                          className="bg-popover text-foreground"
                        >
                          {b.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-semibold">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as TaskPriority)
                    }
                    className="border-input focus:ring-ring h-9 w-full rounded-lg border bg-transparent px-2 text-xs outline-none focus:ring-2"
                  >
                    {TASK_PRIORITIES.map((priority) => (
                      <option
                        key={priority}
                        value={priority}
                        className="bg-popover text-foreground"
                      >
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-semibold">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as (typeof TASK_CATEGORIES)[number],
                      )
                    }
                    className="border-input focus:ring-ring h-9 w-full rounded-lg border bg-transparent px-2 text-xs outline-none focus:ring-2"
                  >
                    {TASK_CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="bg-popover text-foreground"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-foreground text-xs font-semibold">
                    Due Date
                  </label>
                  <Input
                    placeholder="e.g. Tomorrow, 4:00 PM"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-border flex justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating…" : "Create Task"}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

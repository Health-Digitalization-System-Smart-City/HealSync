"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  Tag,
  User,
  X,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CLINIC_BRANCHES,
  DASHBOARD_TASKS,
  type DashboardTask,
} from "@/lib/dashboard-data";
import type { Role } from "@/lib/permissions";

export function TasksClient({ userRole }: { userRole: Role }) {
  const [tasks, setTasks] = useState<DashboardTask[]>(DASHBOARD_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // Form state for creating a new task
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBranch, setNewBranch] = useState(CLINIC_BRANCHES[0]?.name || "");
  const [newPriority, setNewPriority] = useState<"urgent" | "high" | "medium" | "low">("medium");
  const [newCategory, setNewCategory] = useState<DashboardTask["category"]>("Follow-up");
  const [newDueDate, setNewDueDate] = useState("Tomorrow, 5:00 PM");

  const canManage = userRole === "admin" || userRole === "manager";

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
      branchFilter === "all" ? true : task.branchName === branchFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesBranch;
  });

  function toggleTaskStatus(id: string) {
    if (!canManage) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus =
            t.status === "completed"
              ? "pending"
              : t.status === "pending"
                ? "in_progress"
                : "completed";
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    );
  }

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: DashboardTask = {
      id: `tsk-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      description: newDescription.trim() || "No additional description provided.",
      branchName: newBranch,
      category: newCategory,
      priority: newPriority,
      status: "pending",
      assignee: {
        name: "Clinic Duty Lead",
        role: "Coordinator",
      },
      dueDate: newDueDate,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDescription("");
    setIsNewTaskOpen(false);
  }

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50 duration-300">
      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          className={cn(
            "flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer",
            statusFilter === "pending"
              ? "border-amber-500/80 bg-amber-500/10 shadow-xs"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Actions
            </span>
            <div className="text-2xl font-bold text-foreground">{pendingCount}</div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-4.5" />
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}
          className={cn(
            "flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer",
            statusFilter === "in_progress"
              ? "border-blue-500/80 bg-blue-500/10 shadow-xs"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress
            </span>
            <div className="text-2xl font-bold text-foreground">{inProgressCount}</div>
          </div>
          <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <AlertCircle className="size-4.5" />
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
          className={cn(
            "flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer",
            statusFilter === "completed"
              ? "border-emerald-500/80 bg-emerald-500/10 shadow-xs"
              : "border-border/80 bg-card hover:bg-muted/40",
          )}
        >
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </span>
            <div className="text-2xl font-bold text-foreground">{completedCount}</div>
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
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, descriptions, or assignees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by task status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring"
                aria-label="Filter by task priority"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-ring max-w-[180px]"
                aria-label="Filter by clinic branch"
              >
                <option value="all">All Branches</option>
                {CLINIC_BRANCHES.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>

              {canManage ? (
                <Button
                  onClick={() => setIsNewTaskOpen(true)}
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
        {filteredTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks match your current filter criteria.
            </p>
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
                    onClick={() => toggleTaskStatus(task.id)}
                    disabled={!canManage}
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
                          "text-sm font-semibold text-foreground",
                          isCompleted && "line-through text-muted-foreground",
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
                        className="text-[10px] uppercase font-bold px-1.5 py-0"
                      >
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {task.category}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">{task.branchName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>Due {task.dueDate}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        <span>{task.assignee.name} ({task.assignee.role})</span>
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
                    className="capitalize text-xs"
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
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Create Clinic Operational Task</h2>
              <Dialog.Close
                aria-label="Close dialog"
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Task Title</label>
                <Input
                  required
                  placeholder="e.g. Urgent Follow-up on Pediatric Triage Wait Times"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-input bg-transparent p-2 text-xs placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none"
                  placeholder="Actionable steps or patient context..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Clinic Branch</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-xs focus:ring-2 focus:ring-ring outline-none"
                  >
                    {CLINIC_BRANCHES.map((b) => (
                      <option key={b.id} value={b.name} className="bg-popover text-foreground">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-xs focus:ring-2 focus:ring-ring outline-none"
                  >
                    <option value="urgent" className="bg-popover text-foreground">Urgent</option>
                    <option value="high" className="bg-popover text-foreground">High</option>
                    <option value="medium" className="bg-popover text-foreground">Medium</option>
                    <option value="low" className="bg-popover text-foreground">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2 text-xs focus:ring-2 focus:ring-ring outline-none"
                  >
                    <option value="Follow-up" className="bg-popover text-foreground">Follow-up</option>
                    <option value="Inspection" className="bg-popover text-foreground">Inspection</option>
                    <option value="Equipment" className="bg-popover text-foreground">Equipment</option>
                    <option value="Protocol" className="bg-popover text-foreground">Protocol</option>
                    <option value="Staffing" className="bg-popover text-foreground">Staffing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Due Date</label>
                  <Input
                    placeholder="e.g. Tomorrow, 4:00 PM"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create Task
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

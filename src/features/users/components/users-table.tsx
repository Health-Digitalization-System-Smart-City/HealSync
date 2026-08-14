"use client";

import * as React from "react";
import { Loader2, ShieldBan, UserX } from "lucide-react";
import { useRouter } from "next/navigation";

import { FormAlert } from "@/components/form-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  disableUser,
  updateUser,
  type RoleData,
  type UserData,
} from "@/features/users/actions";

interface UsersTableProps {
  users: UserData[];
  roles: RoleData[];
  currentUserId: string;
}

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function UsersTable({ users, roles, currentUserId }: UsersTableProps) {
  const router = useRouter();

  const [updatingUserId, setUpdatingUserId] = React.useState<string | null>(
    null,
  );
  const [disablingUserId, setDisablingUserId] = React.useState<string | null>(
    null,
  );
  const [confirmingDisableId, setConfirmingDisableId] = React.useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleRoleChange = async (userId: string, roleId: string) => {
    setErrorMessage(null);
    setUpdatingUserId(userId);
    try {
      const res = await updateUser({ userId, roleId });
      if (!res.success) setErrorMessage(res.error.message);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDisable = async (userId: string) => {
    setErrorMessage(null);
    setDisablingUserId(userId);
    try {
      const res = await disableUser({ userId });
      if (!res.success) setErrorMessage(res.error.message);
      setConfirmingDisableId(null);
      router.refresh();
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setDisablingUserId(null);
    }
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="text-lg">Dashboard users</CardTitle>
        <CardDescription>
          {users.length} account{users.length === 1 ? "" : "s"} with access to
          the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage ? (
          <FormAlert messages={errorMessage} className="mb-4" />
        ) : null}

        {users.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No dashboard users yet.
          </p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isUpdating = updatingUserId === user.id;
                const isDisabling = disablingUserId === user.id;
                const isConfirming = confirmingDisableId === user.id;

                return (
                  <div
                    key={user.id}
                    className="border-border/80 bg-muted/30 rounded-xl border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 font-semibold">
                          <span className="truncate">{user.name}</span>
                          {isSelf ? (
                            <Badge
                              variant="outline"
                              className="px-1.5 text-[10px]"
                            >
                              You
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {user.email}
                        </p>
                      </div>
                      {user.isActive ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldBan className="h-3 w-3" aria-hidden />
                          Disabled
                        </Badge>
                      )}
                    </div>

                    <div className="border-border/70 mt-4 grid gap-3 border-t pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground text-xs font-medium">
                          Role
                        </span>
                        {isSelf ? (
                          <span className="text-sm font-medium">
                            {user.role}
                          </span>
                        ) : (
                          <select
                            aria-label={`Role for ${user.name}`}
                            value={user.roleId ?? ""}
                            disabled={isUpdating || !user.isActive}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            className="border-input bg-background focus-visible:ring-ring h-11 min-w-32 rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-muted-foreground font-medium">
                          Last sign-in
                        </span>
                        <span className="text-muted-foreground text-right">
                          {formatDate(user.lastLoginAt)}
                        </span>
                      </div>
                      {isUpdating ? (
                        <p className="text-primary flex items-center gap-2 text-xs">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving role…
                        </p>
                      ) : null}
                      {isSelf || !user.isActive ? (
                        <p className="text-muted-foreground text-xs">
                          {isSelf
                            ? "You cannot disable your own account."
                            : "This account is disabled."}
                        </p>
                      ) : isConfirming ? (
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleDisable(user.id)}
                            disabled={isDisabling}
                            className="flex-1"
                          >
                            {isDisabling ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserX className="h-4 w-4" aria-hidden />
                            )}
                            Confirm disable
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setConfirmingDisableId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => setConfirmingDisableId(user.id)}
                          className="text-destructive hover:text-destructive w-full"
                        >
                          <UserX className="h-4 w-4" aria-hidden />
                          Disable account
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs tracking-wide uppercase">
                    <th className="py-3 pr-4 font-medium">User</th>
                    <th className="py-3 pr-4 font-medium">Role</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Last sign-in</th>
                    <th className="py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.id === currentUserId;
                    const isUpdating = updatingUserId === user.id;
                    const isDisabling = disablingUserId === user.id;
                    const isConfirming = confirmingDisableId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-accent/30 border-b transition-colors last:border-0"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 font-medium">
                                <span className="truncate">{user.name}</span>
                                {isSelf && (
                                  <Badge
                                    variant="outline"
                                    className="px-1.5 text-[10px]"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground truncate text-xs">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 pr-4">
                          {isSelf ? (
                            <span className="text-muted-foreground text-xs">
                              {user.role}
                            </span>
                          ) : (
                            <select
                              value={user.roleId ?? ""}
                              disabled={isUpdating || !user.isActive}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                              className="border-input bg-background focus-visible:ring-ring h-9 w-full min-w-[110px] rounded-md border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {isUpdating && (
                            <Loader2 className="text-primary mt-1 h-3 w-3 animate-spin" />
                          )}
                        </td>

                        <td className="py-3 pr-4">
                          {user.isActive ? (
                            <Badge
                              variant="outline"
                              className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <ShieldBan className="h-3 w-3" aria-hidden />
                              Disabled
                            </Badge>
                          )}
                        </td>

                        <td className="text-muted-foreground py-3 pr-4 text-xs">
                          {formatDate(user.lastLoginAt)}
                        </td>

                        <td className="py-3">
                          {isSelf || !user.isActive ? (
                            <span className="text-muted-foreground text-xs">
                              {isSelf ? "—" : "Already disabled"}
                            </span>
                          ) : isConfirming ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDisable(user.id)}
                                disabled={isDisabling}
                                className="gap-1"
                              >
                                {isDisabling ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <UserX className="h-3.5 w-3.5" aria-hidden />
                                )}
                                Confirm
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmingDisableId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmingDisableId(user.id)}
                              className="text-destructive hover:text-destructive gap-1.5"
                            >
                              <UserX className="h-3.5 w-3.5" aria-hidden />
                              Disable
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

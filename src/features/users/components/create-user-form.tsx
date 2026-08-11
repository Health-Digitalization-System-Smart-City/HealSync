"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createUser, type RoleData } from "@/features/users/actions";

interface CreateUserFormProps {
  roles: RoleData[];
}

export function CreateUserForm({ roles }: CreateUserFormProps) {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [roleId, setRoleId] = React.useState(roles[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({});
  const [created, setCreated] = React.useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(roles[0]?.id ?? "");
    setCreated(false);
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const res = await createUser({ name, email, password, roleId });
      if (res.success) {
        setCreated(true);
        reset();
        router.refresh();
      } else {
        setErrorMessage(res.error.message);
        if (res.error.fieldErrors) setFieldErrors(res.error.fieldErrors);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="text-primary h-5 w-5" aria-hidden />
          Create dashboard user
        </CardTitle>
        <CardDescription>
          Provision a new dashboard account. Only Administrators can create
          users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {created && (
          <Alert
            variant="success"
            className="animate-in fade-in mb-4 duration-200"
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>User created</AlertTitle>
            <AlertDescription>
              The dashboard user was provisioned successfully.
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert
            variant="destructive"
            className="animate-in fade-in mb-4 duration-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not create user</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-user-name" className="text-sm font-medium">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-user-name"
              placeholder="e.g. Sara Ahmed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={Boolean(fieldErrors.name?.length)}
              className="h-10"
              autoComplete="off"
              required
            />
            {fieldErrors.name?.map((err, idx) => (
              <p
                key={idx}
                className="text-destructive mt-1 text-xs font-medium"
              >
                {err}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-user-email" className="text-sm font-medium">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-user-email"
              type="email"
              placeholder="name@healsync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(fieldErrors.email?.length)}
              className="h-10"
              autoComplete="off"
              required
            />
            {fieldErrors.email?.map((err, idx) => (
              <p
                key={idx}
                className="text-destructive mt-1 text-xs font-medium"
              >
                {err}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-user-password" className="text-sm font-medium">
              Temporary password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-user-password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(fieldErrors.password?.length)}
              className="h-10"
              autoComplete="new-password"
              minLength={8}
              required
            />
            {fieldErrors.password?.map((err, idx) => (
              <p
                key={idx}
                className="text-destructive mt-1 text-xs font-medium"
              >
                {err}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-user-role" className="text-sm font-medium">
              Role <span className="text-destructive">*</span>
            </Label>
            <select
              id="new-user-role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              required
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                  {role.description ? ` — ${role.description}` : ""}
                </option>
              ))}
            </select>
            {fieldErrors.roleId?.map((err, idx) => (
              <p
                key={idx}
                className="text-destructive mt-1 text-xs font-medium"
              >
                {err}
              </p>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 font-semibold shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create user
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

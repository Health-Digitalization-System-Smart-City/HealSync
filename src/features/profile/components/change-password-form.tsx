"use client";

import * as React from "react";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";

import { FormAlert } from "@/components/form-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { authClient } from "@/lib/auth/client";

const MIN_PASSWORD_LENGTH = 8;

/** Maps Better Auth change-password error codes to friendly messages. */
function changePasswordErrorMessage(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case "INVALID_PASSWORD":
      return "Your current password is incorrect.";
    case "PASSWORD_TOO_SHORT":
      return `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "PASSWORD_TOO_LONG":
      return "Your new password is too long.";
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return "No password is set for this account. Contact your administrator.";
    default:
      return error.message ?? "Unable to change your password. Please try again.";
  }
}

/**
 * Self-service password change. Accounts are provisioned by an administrator,
 * so this is the only profile detail the user can edit themselves. Changing
 * the password signs out sessions on other devices (revokeOtherSessions).
 */
export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [changed, setChanged] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setChanged(false);

    if (!currentPassword) {
      setErrorMessage("Enter your current password.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Your new password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Your new passwords do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMessage(
        "Your new password must be different from your current password.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setErrorMessage(changePasswordErrorMessage(error));
        return;
      }

      setChanged(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage ? (
        <FormAlert messages={errorMessage} className="mb-2" />
      ) : null}
      {changed ? (
        <FormAlert
          variant="success"
          messages="Your password has been updated. Other signed-in devices have been signed out."
          className="mb-2"
        />
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
          <Input
            id="current-password"
            type={showCurrent ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isSubmitting}
            className="h-11 pl-9 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            aria-label={showCurrent ? "Hide current password" : "Show current password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
            tabIndex={-1}
          >
            {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
          <Input
            id="new-password"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isSubmitting}
            className="h-11 pl-9 pr-10"
            minLength={MIN_PASSWORD_LENGTH}
            required
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            aria-label={showNew ? "Hide new password" : "Show new password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
            tabIndex={-1}
          >
            {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Use at least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute inset-y-0 left-0 flex h-full items-center pl-3 text-slate-400" />
          <Input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            className="h-11 pl-9 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 transition hover:text-slate-600"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={isSubmitting}
        className="h-10 w-full gap-1.5 text-xs"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Updating…
          </>
        ) : (
          <>
            <ShieldCheck className="size-3.5" aria-hidden />
            Update password
          </>
        )}
      </Button>
    </form>
  );
}

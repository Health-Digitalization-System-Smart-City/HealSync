"use client";

import * as React from "react";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth/client";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("healsync:session-active");
    }
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("[auth] Sign out failed:", error);
    } finally {
      router.replace("/");
      router.refresh();
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="gap-2"
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      Sign out
    </Button>
  );
}

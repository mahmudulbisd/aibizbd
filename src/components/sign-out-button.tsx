"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="h-3.5 w-3.5" />
      Sign out
    </Button>
  );
}

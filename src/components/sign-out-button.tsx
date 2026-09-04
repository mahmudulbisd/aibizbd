"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/locale-provider";

export function SignOutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { dict } = useI18n();

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
      {dict.dashboard.signOut}
    </Button>
  );
}

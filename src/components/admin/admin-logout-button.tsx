"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/locale-provider";

export function AdminLogoutButton() {
  const { dict } = useI18n();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleLogout}
      loading={loading}
      variant="ghost"
      size="sm"
      className="w-full justify-start px-3 text-xs text-subtle hover:text-rose-300"
    >
      <LogOut className="h-3.5 w-3.5" />
      {dict.admin.signOut}
    </Button>
  );
}

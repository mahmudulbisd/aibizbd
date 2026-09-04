"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/");
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-sm font-semibold text-[#aab3c5] transition hover:border-rose-500/40 hover:text-rose-300"
    >
      <LogOut size={15} /> Sign out
    </button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/locale-provider";

export function AdminLoginForm() {
  const { dict } = useI18n();
  const a = dict.admin;
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error(a.loginError);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 400);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : a.loginError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={a.loginLabel}>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            placeholder={a.loginPlaceholder}
            className="pl-10"
          />
        </div>
      </Field>

      {error && (
        <Alert tone="danger" icon={<ShieldAlert className="h-4 w-4" />}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert tone="success" icon={<CheckCircle2 className="h-4 w-4" />}>
          {a.loginSuccess}
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!password}
        loading={loading}
      >
        {!loading && !success && (
          <>
            {a.loginSubmit}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
        {loading && a.loginVerifying}
        {success && a.loginWelcome}
      </Button>
    </form>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface SessionUser {
  email: string;
}

interface AuthState {
  user: SessionUser | null;
  /** True until the initial /api/auth/me lookup finishes. */
  loading: boolean;
  signIn: (email: string) => Promise<{ ok: boolean; error?: string; devMagicUrl?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (res.ok) {
          const data = (await res.json()) as { user?: SessionUser };
          if (!cancelled && data.user) setUser(data.user);
        }
      } catch {
        // network error — treat as signed out
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      devMagicUrl?: string;
    };
    return { ok: !!data.ok, error: data.error, devMagicUrl: data.devMagicUrl };
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

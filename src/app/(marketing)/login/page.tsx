import type { Metadata } from "next";
import { Suspense } from "react";
import { MagicLinkForm } from "@/components/magic-link-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Ai Biz BD account with a passwordless email link.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-display text-center text-3xl font-bold">
        Welcome <span className="text-gradient">back</span>
      </h1>
      <p className="mt-2 text-center text-sm text-[#8b93a7]">
        Sign in to view your orders, licenses and receipts.
      </p>
      <div className="mt-8">
        <Suspense>
          <MagicLinkForm />
        </Suspense>
      </div>
    </div>
  );
}

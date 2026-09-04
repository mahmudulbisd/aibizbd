import type { Metadata } from "next";
import { Suspense } from "react";
import { MagicLinkForm } from "@/components/magic-link-form";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return {
    title: dict.auth.metaTitle,
    description: dict.auth.metaDescription,
  };
}

export default async function LoginPage() {
  const { dict } = await getI18n();

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-display text-center text-3xl font-bold">
        {dict.auth.titleA} <span className="text-gradient">{dict.auth.titleB}</span>
      </h1>
      <p className="mt-2 text-center text-sm text-[#8b93a7]">{dict.auth.sub}</p>
      <div className="mt-8">
        <Suspense>
          <MagicLinkForm />
        </Suspense>
      </div>
    </div>
  );
}

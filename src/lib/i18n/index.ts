import type { Locale } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { bn } from "./dictionaries/bn";

export type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, Dictionary> = { bn, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

/** Replace {placeholders} in a template string. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Random id for client-side rows. Prefer this over `crypto.randomUUID()` — that API is
 * unavailable on non-HTTPS pages (insecure contexts), which breaks "Add parent" etc. on live HTTP.
 */
export function safeRandomId(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    /* randomUUID can throw outside a secure context */
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Temporary password for API payloads. Uses getRandomValues when possible (works on HTTP);
 * falls back to Math.random.
 */
export function randomTempPassword(length = 12): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    try {
      const buf = new Uint8Array(length);
      globalThis.crypto.getRandomValues(buf);
      return Array.from(buf, (b) => alphabet[b % alphabet.length]).join("");
    } catch {
      /* fall through */
    }
  }
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

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

/** Some DB rows use `Franchise_<id>` as name — never treat that as public-facing copy. */
export function isInternalFranchisePlaceholder(name: string) {
  return /^franchise_\d+$/i.test(name.trim());
}

/**
 * Line under “Welcome to T.I.M.E. Kids” on centre pages: real franchise name, or city/state,
 * or a URL-derived fallback when the API name is a placeholder.
 */
export function franchisePublicLocationLine(
  name: string,
  opts?: { city?: string | null; state?: string | null; urlCityFallback?: string | null }
): string | null {
  const n = (name ?? "").trim();
  if (n && !isInternalFranchisePlaceholder(n)) return n;
  const city = (opts?.city ?? "").trim();
  const state = (opts?.state ?? "").trim();
  if (city || state) return [city, state].filter(Boolean).join(", ");
  const fromUrl = (opts?.urlCityFallback ?? "").trim();
  return fromUrl ? fromUrl.replace(/-/g, " ") : null;
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

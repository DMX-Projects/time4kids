/**
 * Hard territory for known CRM zonal logins.
 * Used as a client-side guard so out-of-scope states (e.g. Jammu and Kashmir
 * for East) never appear even if the API returns a national list.
 */
export const CRM_EMAIL_STATE_NAMES: Record<string, readonly string[]> = {
  "jyoti.mishra@timekidspreschools.com": [
    "Bihar",
    "Chhattisgarh",
    "Odisha",
    "West Bengal",
  ],
  "tejbal@timekidspreschools.com": [
    "Andhra Pradesh",
    "Telangana",
    "Karnataka",
  ],
  "gaurav@timekidspreschools.com": [
    "Tamil Nadu",
    "Kerala",
    "Maharashtra",
  ],
};

export function territoryStateNamesForEmail(email?: string | null): string[] | null {
  const key = (email || "").trim().toLowerCase();
  if (!key) return null;
  const names = CRM_EMAIL_STATE_NAMES[key];
  return names ? [...names] : null;
}

export function filterStatesToEmailTerritory<T extends { name?: string }>(
  rows: T[],
  email?: string | null,
): T[] {
  const allowed = territoryStateNamesForEmail(email);
  if (!allowed || allowed.length === 0) return rows;
  const set = new Set(allowed.map((n) => n.trim().toLowerCase()));
  return rows.filter((row) => set.has((row?.name || "").trim().toLowerCase()));
}

export function filterStateNameListToEmailTerritory(
  names: string[],
  email?: string | null,
): string[] {
  const allowed = territoryStateNamesForEmail(email);
  if (!allowed || allowed.length === 0) return names;
  const set = new Set(allowed.map((n) => n.trim().toLowerCase()));
  return names.filter((n) => set.has((n || "").trim().toLowerCase()));
}

/**
 * CRM access helpers for paid-campaign and agency accounts.
 *
 * - Campaign-only (e.g. Sachin): paid campaign; can see contact; view-only writes in current backend.
 * - External viewer (campaign.viewer): paid campaign; no mobile/email; view-only; no Reports.
 * - Agency viewers (Bcwebwise / Ants): state-scoped leads; no mobile/email; History only
 *   (no comment box, status/assignment/WhatsApp/email edits).
 *   Bcwebwise also sees Google city landing pages (timekids-2g).
 */

export const CAMPAIGN_ONLY_CRM_EMAILS = new Set([
  "sachin.dhakate@time4education.com",
]);

/** Third-party logins — add new emails here, never Sachin's. */
export const CAMPAIGN_EXTERNAL_VIEWER_EMAILS = new Set<string>([
  "campaign.viewer@gmail.com",
]);

export const BCWEBWISE_AGENCY_EMAILS = new Set<string>(["bcwebwise.agency@gmail.com"]);
export const ANTS_AGENCY_EMAILS = new Set<string>(["ants.agency@gmail.com"]);
export const AGENCY_VIEWER_EMAILS = new Set<string>([
  "bcwebwise.agency@gmail.com",
  "ants.agency@gmail.com",
]);

export const AGENCY_VIEWER_LABELS: Record<string, string> = {
  "bcwebwise.agency@gmail.com": "Bcwebwise Agency",
  "ants.agency@gmail.com": "Ants Agency",
};

/** Maps agency email to the API agency filter slug (bcww | ants) */
export const AGENCY_EMAIL_SLUG: Record<string, "bcww" | "ants"> = {
  "bcwebwise.agency@gmail.com": "bcww",
  "ants.agency@gmail.com": "ants",
};

/** Returns the agency API slug for agency-viewer emails, or "" for non-agency */
export function agencySlugForEmail(email?: string | null): "" | "bcww" | "ants" {
  return AGENCY_EMAIL_SLUG[normEmail(email)] ?? "";
}

function normEmail(email?: string | null): string {
  return String(email || "").trim().toLowerCase();
}

export function isAgencyCrmEmail(email?: string | null): boolean {
  return AGENCY_VIEWER_EMAILS.has(normEmail(email));
}

export function isCampaignOnlyCrmEmail(email?: string | null): boolean {
  const e = normEmail(email);
  return CAMPAIGN_ONLY_CRM_EMAILS.has(e) || CAMPAIGN_EXTERNAL_VIEWER_EMAILS.has(e);
}

/** Locked dashboard logins (campaign-only or agency). */
export function isRestrictedCrmViewerEmail(email?: string | null): boolean {
  return isCampaignOnlyCrmEmail(email) || isAgencyCrmEmail(email);
}

export function isCampaignExternalViewerEmail(email?: string | null): boolean {
  const e = normEmail(email);
  return CAMPAIGN_EXTERNAL_VIEWER_EMAILS.has(e) || AGENCY_VIEWER_EMAILS.has(e);
}

export function shouldHideReportsTab(email?: string | null): boolean {
  const e = normEmail(email);
  // Hide Reports for external campaign viewers + Ants agency only.
  // Bcwebwise agency keeps Reports (agency lead report).
  return CAMPAIGN_EXTERNAL_VIEWER_EMAILS.has(e) || ANTS_AGENCY_EMAILS.has(e);
}

export function agencyViewerLabel(email?: string | null): string {
  return AGENCY_VIEWER_LABELS[normEmail(email)] || "Agency";
}

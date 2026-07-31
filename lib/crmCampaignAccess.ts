/**
 * CRM access helpers for paid-campaign and agency accounts.
 *
 * - Campaign-only (e.g. Sachin): paid campaign; can see contact; view-only writes in current backend.
 * - External viewer (campaign.viewer): paid campaign; no mobile/email; view-only; no Reports.
 * - Agency viewers:
 *   - Bcwebwise: 6-state landing + Facebook/Meta leads
 *   - Ants: West Bengal city landing pages only
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

export function agencyViewerLabel(email?: string | null): string {
  return AGENCY_VIEWER_LABELS[normEmail(email)] || "Agency";
}

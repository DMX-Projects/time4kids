/**
 * CRM access helpers for paid-campaign accounts.
 *
 * - Campaign-only (e.g. Sachin): paid campaign + reports; can see contact; normal CRM edit rules.
 * - External viewer (new third-party): paid campaign + reports; no mobile/email; view-only.
 */

export const CAMPAIGN_ONLY_CRM_EMAILS = new Set([
  "sachin.dhakate@time4education.com",
]);

/** Third-party logins — add new emails here, never Sachin's. */
export const CAMPAIGN_EXTERNAL_VIEWER_EMAILS = new Set<string>([
  "campaign.viewer@gmail.com",
]);

export function isCampaignOnlyCrmEmail(email?: string | null): boolean {
  const e = String(email || "").trim().toLowerCase();
  return CAMPAIGN_ONLY_CRM_EMAILS.has(e) || CAMPAIGN_EXTERNAL_VIEWER_EMAILS.has(e);
}

export function isCampaignExternalViewerEmail(email?: string | null): boolean {
  return CAMPAIGN_EXTERNAL_VIEWER_EMAILS.has(String(email || "").trim().toLowerCase());
}

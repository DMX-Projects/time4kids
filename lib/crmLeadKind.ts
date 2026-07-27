/** Active franchise campaign channels (META + Google LPs). */
export const FRANCHISE_CAMPAIGN_SOURCES = [
  "google",
  "july_lp",
  "july_meta",
  "lp_wb",
] as const;

/** July / LP-WB only — state-city from franchise-lp geo, no centre. */
export const FRANCHISE_LP_GEO_SOURCES = ["july_lp", "july_meta", "lp_wb", "google"] as const;

export function isFranchiseCampaignSource(source?: string | null): boolean {
  if (!source) return false;
  return (FRANCHISE_CAMPAIGN_SOURCES as readonly string[]).includes(source);
}

export function isFranchiseLpGeoSource(source?: string | null): boolean {
  if (!source) return false;
  return (FRANCHISE_LP_GEO_SOURCES as readonly string[]).includes(source);
}

/** Page-configured campaign names for July LP / Meta forms (`data-campaign`). */
const LP_PAGE_CAMPAIGN_BY_SOURCE: Record<string, string> = {
  july_lp: "lp-tkktam",
  july_meta: "meta-tkktam",
  lp_wb: "lp-wb",
};

/**
 * Campaign column label — form page names only (lp-tkktam / meta-tkktam / lp-wb),
 * never Google Ads UTM slugs like `google_generic_alllocation`.
 */
export function campaignDisplayName(lead: {
  source?: string | null;
  campaign?: string | null;
  utmCampaign?: string | null;
} | null | undefined): string {
  if (!lead) return "—";
  const src = String(lead.source || "").toLowerCase();
  const pageName = LP_PAGE_CAMPAIGN_BY_SOURCE[src];
  if (pageName) return pageName;

  const raw = String(lead.campaign || lead.utmCampaign || "").trim().toLowerCase();
  if (!raw) return "—";
  // Already a page form name
  if (raw === "lp-tkktam" || raw === "meta-tkktam" || raw === "lp-wb") return raw;
  // Hide ad-platform UTM campaign ids / legacy "july" blob if they slipped into older leads.
  if (
    raw === "july" ||
    /^google[_-]/i.test(raw) ||
    /_alllocation/i.test(raw) ||
    /_generic_/i.test(raw)
  ) {
    return "—";
  }
  return String(lead.campaign || lead.utmCampaign || "").trim();
}

/** True when this lead should use franchise statuses + workflow. */
export function isFranchiseLead(lead: {
  leadKind?: string | null;
  enquiryType?: string | null;
  source?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  if (lead.leadKind === "franchiseenquiry") return true;
  if (lead.leadKind === "crm") return true; // campaign_leads table
  if (lead.enquiryType === "FRANCHISE") return true;
  if (lead.source === "franchise") return true;
  if (isFranchiseCampaignSource(lead.source)) return true;
  return false;
}

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

/** Form page names for July LP / Meta forms. */
const LP_FORM_NAME_BY_SOURCE: Record<string, string> = {
  july_lp: "lp-tkktam",
  july_meta: "meta-tkktam",
  lp_wb: "lp-wb",
};

/** Which LP form was used (lp-tkktam / meta-tkktam / lp-wb). */
export function formDisplayName(lead: {
  source?: string | null;
  formName?: string | null;
  pageType?: string | null;
} | null | undefined): string {
  if (!lead) return "—";
  const fromApi = String(lead.formName || "").trim();
  if (fromApi) return fromApi;
  const src = String(lead.source || "").toLowerCase();
  if (LP_FORM_NAME_BY_SOURCE[src]) return LP_FORM_NAME_BY_SOURCE[src];
  const page = String(lead.pageType || "").trim().toLowerCase();
  if (page === "lp-tkktam" || page === "meta-tkktam" || page === "lp-wb") return page;
  return "—";
}

/** Dynamic ad / Meta form name for Campaign (not the LP page slug). */
export function utmCampaignDisplay(lead: {
  campaign?: string | null;
  utmCampaign?: string | null;
  formName?: string | null;
  pageType?: string | null;
} | null | undefined): string {
  if (!lead) return "—";
  const pageSlugs = new Set(["lp-tkktam", "meta-tkktam", "lp-wb", "july"]);
  const raw = String(lead.utmCampaign || lead.campaign || "").trim();
  if (raw && !pageSlugs.has(raw.toLowerCase())) return raw;
  return "—";
}

/** @deprecated Prefer utmCampaignDisplay for UTM campaign; formDisplayName for form page. */
export function campaignDisplayName(lead: {
  source?: string | null;
  campaign?: string | null;
  utmCampaign?: string | null;
  formName?: string | null;
  pageType?: string | null;
} | null | undefined): string {
  return utmCampaignDisplay(lead);
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

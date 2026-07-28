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

/** True when lead came from Meta Instant Form (not a website LP). */
export function isMetaInstantFormLead(lead: {
  utmSource?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  const utm = String(lead.utmSource || "").trim().toLowerCase();
  if (utm === "facebook_lead_ads") return true;
  return false;
}

/** Form page names for July LP / Meta forms. */
const LP_FORM_NAME_BY_SOURCE: Record<string, string> = {
  july_lp: "lp-tkktam",
  july_meta: "meta-tkktam",
  lp_wb: "lp-wb",
  google: "lp-tkktam",
};

/** Which LP form was used (lp-tkktam / meta-tkktam / lp-wb). Blank for Instant Forms. */
export function formDisplayName(lead: {
  source?: string | null;
  formName?: string | null;
  pageType?: string | null;
  utmSource?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): string {
  if (!lead) return "—";
  // Instant Forms: form name lives in Medium/Campaign — keep Form column empty.
  if (isMetaInstantFormLead(lead)) return "—";
  const fromApi = String(lead.formName || "").trim();
  if (fromApi) return fromApi;
  const page = String(lead.pageType || "").trim().toLowerCase();
  if (page === "lp-tkktam" || page === "meta-tkktam" || page === "lp-wb") return page;
  const url = String(lead.landingPageUrl || "").toLowerCase();
  if (url.includes("timekids-meta-tkktam")) return "meta-tkktam";
  if (url.includes("timekids-lp-wb")) return "lp-wb";
  if (url.includes("timekids-lp-tkktam")) return "lp-tkktam";
  const src = String(lead.source || "").toLowerCase();
  if (LP_FORM_NAME_BY_SOURCE[src]) return LP_FORM_NAME_BY_SOURCE[src];
  return "—";
}

/** UTM source from ad URL (e.g. bcwebwise_meta). */
export function utmSourceDisplay(lead: {
  utmSource?: string | null;
} | null | undefined): string {
  if (!lead) return "—";
  const raw = String(lead.utmSource || "").trim();
  return raw || "—";
}

/** UTM medium (e.g. tamil_interest_p1, cpc). */
export function utmMediumDisplay(lead: {
  utmMedium?: string | null;
} | null | undefined): string {
  if (!lead) return "—";
  const raw = String(lead.utmMedium || "").trim();
  return raw || "—";
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

/** Franchise vs admission TKPL sheet for Select User / assign lists. */
export function crmPipelineForLead(
  lead: {
    leadKind?: string | null;
    enquiryType?: string | null;
    source?: string | null;
  } | null | undefined,
): "franchise" | "admission" | undefined {
  if (!lead) return undefined;
  if (isFranchiseLead(lead)) return "franchise";
  const kind = String(lead.leadKind || "").toLowerCase();
  if (kind === "enquiry" || kind === "landing") return "admission";
  return undefined;
}

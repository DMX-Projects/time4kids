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
  source?: string | null;
  utmSource?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  const utm = String(lead.utmSource || "").trim().toLowerCase();
  if (utm === "facebook_lead_ads") return true;
  const source = String(lead.source || "").trim().toLowerCase();
  return source === "july_meta" || source === "july-meta" || source === "facebook_lead_ads";
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

/** True for West Bengal LP form (Timekids-lp-WB / source lp_wb). */
export function isWestBengalLpLead(lead: {
  source?: string | null;
  formName?: string | null;
  pageType?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  const src = String(lead.source || "").trim().toLowerCase();
  if (src === "lp_wb") return true;
  const page = String(lead.formName || lead.pageType || "")
    .trim()
    .toLowerCase();
  if (page === "lp-wb") return true;
  const url = String(lead.landingPageUrl || "").toLowerCase();
  return url.includes("timekids-lp-wb");
}

/** West Bengal territory (Ants) — LP + Instant Form / Meta leads with WB state. */
export function isWestBengalTerritoryLead(lead: {
  source?: string | null;
  state?: string | null;
  formName?: string | null;
  pageType?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  if (isWestBengalLpLead(lead)) return true;
  const state = String(lead.state || "").trim().toLowerCase();
  if (!state) return false;
  return state === "west bengal" || state === "wb" || state.includes("bengal");
}

function isMetaAdTraffic(lead: {
  source?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  if (isMetaInstantFormLead(lead)) return true;
  const utm = String(lead.utmSource || "").trim().toLowerCase();
  if (utm === "facebook_lead_ads") return true;
  if (/(meta|facebook|\bfb\b|instagram|\big\b)/.test(utm)) return true;
  const medium = String(lead.utmMedium || "").trim().toLowerCase();
  return /(meta|facebook|instagram)/.test(medium);
}

/**
 * Real Google Ads click on the landing page URL. Mirrors is_google_ads_landing_url()
 * on the backend, which decides whether a lead lands in the Google channel.
 * Deliberately narrow: Meta LP campaigns also run with utm_medium=cpc.
 */
function hasGoogleAdsClick(lead: { landingPageUrl?: string | null } | null | undefined): boolean {
  if (!lead) return false;
  const url = String(lead.landingPageUrl || "").toLowerCase();
  return ["gclid=", "gad_source=", "gad_campaignid=", "gbraid=", "wbraid="].some((m) =>
    url.includes(m),
  );
}

function isGoogleAdTraffic(lead: {
  utmSource?: string | null;
  utmMedium?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): boolean {
  if (!lead) return false;
  if (hasGoogleAdsClick(lead)) return true;
  const utm = String(lead.utmSource || "").trim().toLowerCase();
  if (utm === "google" || utm.includes("google")) return true;
  const medium = String(lead.utmMedium || "").trim().toLowerCase();
  return medium === "cpc" || medium.includes("google");
}

/**
 * UTM / channel source label for CRM tables & detail.
 * West Bengal (Ants): Google → Ants_Google, Meta → Ants_Meta.
 * BCWW (Bcwebwise) only for the 6 Instant-Form / TKKTAM states — never West Bengal.
 */
export function utmSourceDisplay(lead: {
  source?: string | null;
  state?: string | null;
  formName?: string | null;
  pageType?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  landingPageUrl?: string | null;
} | null | undefined): string {
  if (!lead) return "—";

  const src = String(lead.source || "").trim().toLowerCase();
  const isMetaSource = src === "july_meta" || src === "facebook_lead_ads";

  if (isWestBengalTerritoryLead(lead)) {
    if (isMetaSource || isMetaAdTraffic(lead)) return "Ants_Meta";
    // WB page / Google LP default.
    return "Ants_Google";
  }

  // Only a real Google Ads click overrides the stored channel — same rule the
  // Google filter uses, so the label always matches the channel the lead sits in.
  if (hasGoogleAdsClick(lead)) return "BCWW_Google";
  if (isMetaSource) return "BCWW_Meta";
  if (src === "july_lp") return "BCWW_Google";
  if (isMetaAdTraffic(lead)) return "BCWW_Meta";

  const raw = String(lead.utmSource || "").trim();
  if (!raw) return "—";
  const key = raw.toLowerCase();
  if (key === "facebook_lead_ads") return "BCWW_Meta";
  if (key === "google") return "BCWW_Google";
  return raw;
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

/** Pretty Meta Instant Form start-period values (3_months → 3 months). Yes/No → blank. */
export function formatMetaChoiceLabel(value?: string | null): string {
  const text = String(value || "").trim();
  if (!text) return "";
  const lower = text.toLowerCase().replace(/^_+|_+$/g, "");
  if (["yes", "no", "y", "n"].includes(lower)) return "";
  const known: Record<string, string> = {
    "3_months": "3 months",
    "6_months": "6 months",
    "1_month": "1 month",
    "12_months": "12 months",
    "1_year": "1 year",
    immediately: "Immediately",
    asap: "ASAP",
    test: "Test",
  };
  if (known[text.toLowerCase()]) return known[text.toLowerCase()];
  if (known[lower]) return known[lower];
  const pretty = text.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
  if (["yes", "y", "no", "n"].includes(pretty.toLowerCase())) return "";
  if (/\d+\s*(month|months|year|years|week|weeks|day|days)/i.test(pretty)) return pretty;
  if (["immediately", "asap", "test"].includes(pretty.toLowerCase())) {
    return pretty.toLowerCase() === "asap" ? "ASAP" : pretty.charAt(0).toUpperCase() + pretty.slice(1).toLowerCase();
  }
  // Hide unknown yes/no-style tokens
  if (/^[a-zA-Z]+$/.test(pretty) && !["immediately", "asap", "test"].includes(pretty.toLowerCase())) {
    return "";
  }
  return pretty;
}

export function expectedStartDisplay(lead: { expectedStartDate?: string | null } | null | undefined): string {
  const raw = String(lead?.expectedStartDate || "").trim();
  if (!raw) return "—";
  return formatMetaChoiceLabel(raw) || "—";
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

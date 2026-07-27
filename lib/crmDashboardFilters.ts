export const CRM_DASHBOARD_FILTERS_KEY = "crm-dashboard-filters-v3";
export const CRM_REPORTS_FILTERS_KEY = "crm-reports-filters-v3";
/** Tracks which CRM view was last persisted (for lead-detail back fallback). */
const CRM_LAST_VIEW_KEY = "crm-last-view-path";

export type CrmDashboardFiltersSnapshot = {
  returnPath: string;
  selectedCity: string[];
  selectedState: string[];
  selectedCentre: string[];
  selectedSource: string;
  selectedCampaignChannel: string;
  selectedUtmCampaign: string;
  selectedUtmMedium: string;
  selectedStatus: string;
  selectedUserId: string;
  filterStart: string | null;
  filterEnd: string | null;
  appliedStart: string | null;
  appliedEnd: string | null;
  reportsFiltersApplied: boolean;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function splitCsv(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isReportsPath(returnPath?: string | null): boolean {
  return Boolean(returnPath && returnPath.includes("/reports"));
}

export function storageKeyForPath(returnPath?: string | null): string {
  return isReportsPath(returnPath) ? CRM_REPORTS_FILTERS_KEY : CRM_DASHBOARD_FILTERS_KEY;
}

function normalizeSnapshot(data: CrmDashboardFiltersSnapshot & { selectedCentre?: string | string[] }): CrmDashboardFiltersSnapshot {
  if (typeof data.selectedCentre === "string") {
    data.selectedCentre = data.selectedCentre ? [data.selectedCentre] : [];
  } else if (!Array.isArray(data.selectedCentre)) {
    data.selectedCentre = [];
  }
  if (typeof data.selectedUserId !== "string") {
    data.selectedUserId = "";
  }
  if (typeof data.selectedUtmMedium !== "string") {
    data.selectedUtmMedium = "";
  }
  return data as CrmDashboardFiltersSnapshot;
}

function readSnapshot(key: string): CrmDashboardFiltersSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as CrmDashboardFiltersSnapshot & { selectedCentre?: string | string[] };
    if (!data || typeof data !== "object") return null;
    return normalizeSnapshot(data);
  } catch {
    return null;
  }
}

/**
 * Load filters for a specific CRM view (dashboard vs reports).
 * Pass the target path so Dashboard and Reports stay independent.
 */
export function loadCrmDashboardFilters(returnPath?: string | null): CrmDashboardFiltersSnapshot | null {
  if (typeof window === "undefined") return null;
  const key = storageKeyForPath(returnPath);
  const saved = readSnapshot(key);
  if (saved) return saved;

  // One-time migration: older builds used a single shared key for both views.
  if (key === CRM_DASHBOARD_FILTERS_KEY) {
    const legacy = readSnapshot(CRM_DASHBOARD_FILTERS_KEY);
    if (legacy && !isReportsPath(legacy.returnPath)) return legacy;
  }
  return null;
}

export function saveCrmDashboardFilters(snapshot: CrmDashboardFiltersSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    const key = storageKeyForPath(snapshot.returnPath);
    sessionStorage.setItem(key, JSON.stringify(snapshot));
    sessionStorage.setItem(
      CRM_LAST_VIEW_KEY,
      isReportsPath(snapshot.returnPath) ? "/crm-admin/reports" : "/crm-admin",
    );
  } catch {
    // ignore quota / private mode
  }
}

export function snapshotToSearchParams(snapshot: CrmDashboardFiltersSnapshot): URLSearchParams {
  const params = new URLSearchParams();
  if (snapshot.selectedSource) params.set("source", snapshot.selectedSource);
  if (snapshot.selectedCampaignChannel) params.set("channel", snapshot.selectedCampaignChannel);
  if (snapshot.selectedUtmCampaign) params.set("campaign", snapshot.selectedUtmCampaign);
  if (snapshot.selectedUtmMedium) params.set("medium", snapshot.selectedUtmMedium);
  if (snapshot.selectedStatus) params.set("status", snapshot.selectedStatus);
  if (snapshot.selectedUserId) params.set("userId", snapshot.selectedUserId);
  if (snapshot.selectedState.length) params.set("state", snapshot.selectedState.join(","));
  if (snapshot.selectedCity.length) params.set("city", snapshot.selectedCity.join(","));
  if (snapshot.selectedCentre.length) params.set("centreId", snapshot.selectedCentre.join(","));
  if (snapshot.filterStart) params.set("filterStart", snapshot.filterStart);
  if (snapshot.filterEnd) params.set("filterEnd", snapshot.filterEnd);
  if (snapshot.appliedStart) params.set("start", snapshot.appliedStart);
  if (snapshot.appliedEnd) params.set("end", snapshot.appliedEnd);
  if (snapshot.reportsFiltersApplied) params.set("applied", "1");
  return params;
}

export function snapshotFromSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null },
): CrmDashboardFiltersSnapshot | null {
  const source = searchParams.get("source") || "";
  const channel = searchParams.get("channel") || "";
  const campaign = searchParams.get("campaign") || "";
  const medium = searchParams.get("medium") || "";
  const status = searchParams.get("status") || "";
  const userId = searchParams.get("userId") || "";
  const state = splitCsv(searchParams.get("state"));
  const city = splitCsv(searchParams.get("city"));
  const centreId = splitCsv(searchParams.get("centreId"));
  const filterStart = searchParams.get("filterStart");
  const filterEnd = searchParams.get("filterEnd");
  const appliedStart = searchParams.get("start");
  const appliedEnd = searchParams.get("end");
  const applied = searchParams.get("applied") === "1";

  const hasAny =
    source ||
    channel ||
    campaign ||
    medium ||
    status ||
    userId ||
    state.length ||
    city.length ||
    centreId.length ||
    filterStart ||
    filterEnd ||
    appliedStart ||
    appliedEnd ||
    applied;

  if (!hasAny) return null;

  return {
    returnPath: "/crm-admin",
    selectedSource: source,
    selectedCampaignChannel: channel,
    selectedUtmCampaign: campaign,
    selectedUtmMedium: medium,
    selectedStatus: !status || status === "all" ? "all" : status,
    selectedUserId: userId,
    selectedState: state,
    selectedCity: city,
    selectedCentre: centreId,
    filterStart,
    filterEnd,
    appliedStart,
    appliedEnd,
    reportsFiltersApplied: applied,
  };
}

export function buildCrmDashboardHref(snapshot: CrmDashboardFiltersSnapshot): string {
  const path =
    snapshot.returnPath === "/crm-admin/reports" ? "/crm-admin/reports" : "/crm-admin";
  const qs = snapshotToSearchParams(snapshot).toString();
  return qs ? `${path}?${qs}` : path;
}

export function getCrmDashboardReturnHref(fallback = "/crm-admin"): string {
  if (typeof window === "undefined") return fallback;
  let lastPath = fallback;
  try {
    lastPath = sessionStorage.getItem(CRM_LAST_VIEW_KEY) || fallback;
  } catch {
    // ignore
  }
  const saved = loadCrmDashboardFilters(lastPath);
  if (!saved) return lastPath.startsWith("/crm-admin") ? lastPath : fallback;
  return buildCrmDashboardHref({
    ...saved,
    returnPath: isReportsPath(lastPath) ? "/crm-admin/reports" : "/crm-admin",
  });
}

export function datesFromSnapshot(snapshot: CrmDashboardFiltersSnapshot) {
  return {
    filterDateRange: {
      startDate: parseDate(snapshot.filterStart),
      endDate: parseDate(snapshot.filterEnd),
    },
    dateRange: {
      startDate: parseDate(snapshot.appliedStart),
      endDate: parseDate(snapshot.appliedEnd),
    },
  };
}

export function isSafeCrmReturnHref(href: string | null | undefined): href is string {
  if (!href) return false;
  try {
    // Relative only — block open redirects
    if (!href.startsWith("/crm-admin")) return false;
    if (href.startsWith("//")) return false;
    // Allow /crm-admin, /crm-admin/, /crm-admin/reports, and query strings
    if (href === "/crm-admin" || href.startsWith("/crm-admin?") || href.startsWith("/crm-admin/")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function clearCrmDashboardFilters(returnPath?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (returnPath) {
      sessionStorage.removeItem(storageKeyForPath(returnPath));
      return;
    }
    sessionStorage.removeItem(CRM_DASHBOARD_FILTERS_KEY);
    sessionStorage.removeItem(CRM_REPORTS_FILTERS_KEY);
    sessionStorage.removeItem(CRM_LAST_VIEW_KEY);
  } catch {
    // ignore
  }
}

/** Full CRM reset — clears saved filters and hard-reloads a clean dashboard. */
export function hardRefreshCrmDashboard(): void {
  clearCrmDashboardFilters();
  if (typeof window !== "undefined") {
    window.location.assign("/crm-admin");
  }
}

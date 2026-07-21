export const CRM_DASHBOARD_FILTERS_KEY = "crm-dashboard-filters-v1";

export type CrmDashboardFiltersSnapshot = {
  returnPath: string;
  selectedCity: string[];
  selectedState: string[];
  selectedCentre: string[];
  selectedSource: string;
  selectedCampaignChannel: string;
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

export function loadCrmDashboardFilters(): CrmDashboardFiltersSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CRM_DASHBOARD_FILTERS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CrmDashboardFiltersSnapshot & { selectedCentre?: string | string[] };
    if (!data || typeof data !== "object") return null;
    // Migrate older single-centre snapshots
    if (typeof data.selectedCentre === "string") {
      data.selectedCentre = data.selectedCentre ? [data.selectedCentre] : [];
    } else     if (!Array.isArray(data.selectedCentre)) {
      data.selectedCentre = [];
    }
    if (typeof (data as CrmDashboardFiltersSnapshot).selectedUserId !== "string") {
      (data as CrmDashboardFiltersSnapshot).selectedUserId = "";
    }
    return data as CrmDashboardFiltersSnapshot;
  } catch {
    return null;
  }
}

export function saveCrmDashboardFilters(snapshot: CrmDashboardFiltersSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CRM_DASHBOARD_FILTERS_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore quota / private mode
  }
}

export function snapshotToSearchParams(snapshot: CrmDashboardFiltersSnapshot): URLSearchParams {
  const params = new URLSearchParams();
  if (snapshot.selectedSource) params.set("source", snapshot.selectedSource);
  if (snapshot.selectedCampaignChannel) params.set("channel", snapshot.selectedCampaignChannel);
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
  const saved = loadCrmDashboardFilters();
  if (!saved) return fallback;
  return buildCrmDashboardHref(saved);
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
    return true;
  } catch {
    return false;
  }
}

export function clearCrmDashboardFilters(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CRM_DASHBOARD_FILTERS_KEY);
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

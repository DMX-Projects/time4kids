import axios, { type AxiosRequestConfig } from "axios";
import { apiUrl } from "@/lib/api-client";

const CRM_STORAGE_KEY = "tk-auth-crm";

function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(CRM_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as { tokens?: { access?: string } };
        return parsed.tokens?.access ?? null;
    } catch {
        return null;
    }
}

function mapSourceParam(params: URLSearchParams) {
    const source = params.get("source");
    if (source === "website") params.set("source", "web");
    else if (source === "facebook") params.set("source", "fb");
    else if (source === "instagram") params.set("source", "insta");
}

function resolveCrmUrl(path: string): string {
    const [pathname, query = ""] = path.split("?");
    const params = new URLSearchParams(query);
    mapSourceParam(params);
    const qs = params.toString();

    if (pathname === "/leads/dashboard") {
        return apiUrl(`/enquiries/admin/crm-leads/stats/${qs ? `?${qs}` : ""}`);
    }
    if (pathname === "/leads/reminders") {
        return apiUrl(`/enquiries/admin/crm-leads/reminders/${qs ? `?${qs}` : ""}`);
    }
    if (pathname === "/leads/send-reminder") {
        return apiUrl("/enquiries/admin/crm-leads/send-reminder/");
    }
    if (pathname === "/leads" || pathname.startsWith("/leads?")) {
        return apiUrl(`/enquiries/admin/crm-leads/${qs ? `?${qs}` : ""}`);
    }
    if (pathname === "/centres" || pathname.startsWith("/centres?")) {
        return apiUrl(`/enquiries/admin/crm-centres/${qs ? `?${qs}` : ""}`);
    }
    if (pathname === "/cities") {
        return apiUrl("/enquiries/admin/crm-cities/");
    }

    const leadMatch = pathname.match(/^\/leads\/([^/?]+)$/);
    if (leadMatch) {
        return apiUrl(`/enquiries/admin/crm-leads/${encodeURIComponent(leadMatch[1])}/`);
    }

    const noteMatch = pathname.match(/^\/leads\/([^/?]+)\/notes$/);
    if (noteMatch) {
        return apiUrl(`/enquiries/admin/crm-leads/${encodeURIComponent(noteMatch[1])}/notes/`);
    }

    return apiUrl(path);
}

const crmApi = axios.create({
    headers: { "Content-Type": "application/json" },
});

crmApi.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.url) {
        config.url = resolveCrmUrl(config.url);
    }
    return config;
});

crmApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            window.location.href = "/crm-admin/login";
        }
        return Promise.reject(error);
    },
);

export default crmApi;

export async function crmGet<T = unknown>(path: string, config?: AxiosRequestConfig) {
    const res = await crmApi.get<T>(path, config);
    return res;
}

export async function crmPost<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig) {
    const res = await crmApi.post<T>(path, data, config);
    return res;
}

export async function crmPatch<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig) {
    const res = await crmApi.patch<T>(path, data, config);
    return res;
}

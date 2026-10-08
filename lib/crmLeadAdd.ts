import { isRestrictedCrmViewerEmail } from "@/lib/crmCampaignAccess";
import { isCrmSuperAdminUser } from "@/lib/crmSuperAdmin";

/** Zonal Managers (mirrors backend `ZONAL_MANAGER_ASSIGN_EMAILS`). Super Admins come from `isCrmSuperAdminUser`. */
const CRM_ZONAL_MANAGER_EMAILS = new Set([
    "tejbal@timekidspreschools.com",
    "gaurav@timekidspreschools.com",
    "jyoti.mishra@timekidspreschools.com",
]);

/** Manual "Add Lead": Zonal Managers and CRM Super Admins only (mirrors backend `user_can_add_crm_leads`). */
export function canAddCrmLeads(user?: { email?: string | null; isCrmSuperAdmin?: boolean } | null): boolean {
    if (!user) return false;
    const email = String(user.email || "").trim().toLowerCase();
    if (isRestrictedCrmViewerEmail(email)) return false;
    return CRM_ZONAL_MANAGER_EMAILS.has(email) || isCrmSuperAdminUser(user);
}

/** National CRM Super Admins (mirrors backend `CRM_SUPER_ADMIN_ASSIGN_EMAILS`). */
const CRM_SUPER_ADMIN_EMAILS = new Set([
    "admin@timekids.com",
    "jayesh@time4education.com",
    "bethleena@timekidspreschools.com",
    "prashant.mishra@timekidspreschools.com",
]);

export function isCrmSuperAdminUser(user?: { email?: string | null; isCrmSuperAdmin?: boolean } | null): boolean {
    if (!user) return false;
    return Boolean(user.isCrmSuperAdmin || CRM_SUPER_ADMIN_EMAILS.has(String(user.email || "").trim().toLowerCase()));
}

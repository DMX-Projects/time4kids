import { redirect } from "next/navigation";

export default function LegacyParentNotificationsRedirect() {
    redirect("/dashboard/admin/notifications-cms");
}

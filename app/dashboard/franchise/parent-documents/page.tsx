import { redirect } from "next/navigation";

/** Parent app CMS — holidays, newsletters, notifications (centre + head office). */
export default function FranchiseParentDocumentsRedirectPage() {
    redirect("/dashboard/franchise/parent-portal/?tab=holidays");
}

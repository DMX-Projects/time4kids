import { redirect } from "next/navigation";

/** Parent app documents are managed by head office (Admin CMS), not franchise centres. */
export default function FranchiseParentDocumentsRedirectPage() {
    redirect("/dashboard/franchise/parent-portal/");
}

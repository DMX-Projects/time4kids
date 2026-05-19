import { redirect } from "next/navigation";

/** Legacy route — centre updates are managed by head office (Admin CMS). */
export default function FranchiseUpdatesRedirectPage() {
    redirect("/dashboard/franchise/#center-page");
}

import { redirect } from "next/navigation";

/** Event photos are managed under Events (powers “Life at [centre]” on the public page). */
export default function FranchiseGalleryRedirectPage() {
    redirect("/dashboard/franchise/parent-portal/?tab=showcase");
}

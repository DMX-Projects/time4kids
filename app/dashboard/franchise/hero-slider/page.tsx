import { redirect } from "next/navigation";

/** Centre pages no longer use a top banner slider — use Event Gallery for event photos. */
export default function FranchiseHeroSliderRedirectPage() {
    redirect("/dashboard/franchise/parent-portal/?tab=showcase");
}

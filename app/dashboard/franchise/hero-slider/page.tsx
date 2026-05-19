import { redirect } from "next/navigation";

/** Centre pages no longer use a top banner slider — use Events & gallery for event photos. */
export default function FranchiseHeroSliderRedirectPage() {
    redirect("/dashboard/franchise/events/");
}

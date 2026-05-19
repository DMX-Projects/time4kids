import { redirect } from "next/navigation";

/** Achievements are managed by head office (Admin CMS), not franchise centres. */
export default function FranchiseStudentAchievementsRedirectPage() {
    redirect("/dashboard/franchise/");
}

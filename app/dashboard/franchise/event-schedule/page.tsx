import { redirect } from "next/navigation";

/** Event schedule is covered under Events. */
export default function FranchiseEventScheduleRedirectPage() {
    redirect("/dashboard/franchise/events/");
}

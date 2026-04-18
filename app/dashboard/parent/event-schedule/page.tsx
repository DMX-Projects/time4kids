import { redirect } from "next/navigation";

/** Old route — calendar lives at `/dashboard/parent/calendar`. */
export default function EventScheduleRedirectPage() {
    redirect("/dashboard/parent/calendar");
}

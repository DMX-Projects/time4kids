import { redirect } from "next/navigation";

/** Admin home — no dashboard screen; land on first sidebar item. */
export default function AdminRootPage() {
    redirect("/dashboard/admin/hero-slides/");
}

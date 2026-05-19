import { redirect } from "next/navigation";

/** “Our Classes” photos are managed by head office (Admin → Centre class photos). */
export default function FranchiseClassesPhotosRedirectPage() {
    redirect("/dashboard/franchise/");
}

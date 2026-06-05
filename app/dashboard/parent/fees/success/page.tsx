import { redirect } from "next/navigation";

export default function FeePaymentSuccessPage() {
    redirect("/dashboard/parent/fees");
}

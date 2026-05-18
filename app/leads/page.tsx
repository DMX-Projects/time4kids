import { redirect } from "next/navigation";

export default function LeadsIndexPage({
    searchParams,
}: {
    searchParams?: { key?: string };
}) {
    const key = searchParams?.key?.trim();
    redirect(key ? `/leads/all/?key=${encodeURIComponent(key)}` : "/leads/all/");
}

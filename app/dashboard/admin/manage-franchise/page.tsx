import { redirect } from "next/navigation";

type Props = {
    searchParams?: { city?: string; id?: string };
};

/** Legacy URL — all franchise management lives under /locations now. */
export default function ManageFranchisePage({ searchParams }: Props) {
    const q = new URLSearchParams();
    if (searchParams?.city?.trim()) q.set("city", searchParams.city.trim());
    if (searchParams?.id?.trim()) q.set("id", searchParams.id.trim());
    const suffix = q.toString() ? `?${q.toString()}` : "";
    redirect(`/dashboard/admin/locations${suffix}`);
}

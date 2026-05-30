import { redirect } from "next/navigation";

type Props = { params: { id: string } };

/** Legacy deep link — opens the unified centres editor. */
export default function ManageFranchiseDetailPage({ params }: Props) {
    redirect(`/dashboard/admin/locations?id=${encodeURIComponent(params.id)}`);
}

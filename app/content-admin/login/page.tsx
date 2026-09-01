import { redirect } from "next/navigation";

type Props = {
    searchParams?: { next?: string };
};

/** Legacy URL — content admin uses the normal site login at `/login`. */
export default function ContentAdminLoginRedirect({ searchParams }: Props) {
    const next = searchParams?.next?.trim() || "/dashboard/admin";
    redirect(`/login?next=${encodeURIComponent(next)}`);
}

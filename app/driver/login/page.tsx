import { redirect } from "next/navigation";

type Props = {
    searchParams?: { next?: string };
};

/** Legacy URL — same sign-in as everyone else at `/login`. */
export default function DriverLoginRedirect({ searchParams }: Props) {
    const next = searchParams?.next?.trim() || "/driver/trip";
    redirect(`/login?next=${encodeURIComponent(next)}`);
}

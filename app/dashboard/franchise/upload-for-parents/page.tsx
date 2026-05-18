'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Bulk centre upload is admin-only; franchise users are sent to the dashboard. */
export default function FranchiseUploadCentreFilesRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/franchise/');
    }, [router]);

    return (
        <p className="text-sm text-gray-500 p-6">Redirecting…</p>
    );
}

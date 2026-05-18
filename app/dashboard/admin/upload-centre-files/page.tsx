'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Bulk upload is on Centre page documents — keep this URL working for bookmarks. */
export default function AdminUploadCentreFilesRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/admin/franchise-documents');
    }, [router]);

    return <p className="text-sm text-gray-500 p-6">Redirecting to Centre page documents…</p>;
}

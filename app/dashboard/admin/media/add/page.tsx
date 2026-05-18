'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy route — gallery CMS is on the main media page with headings. */
export default function AddMediaPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/admin/media');
    }, [router]);

    return (
        <div className="p-6 text-sm text-gray-500">Redirecting to Photo / Video Gallery CMS…</div>
    );
}

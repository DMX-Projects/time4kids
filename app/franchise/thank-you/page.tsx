'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FranchiseThankYouPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 pt-28 pb-16 md:pt-36">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-lg rounded-2xl border border-slate-200/90 bg-white p-8 text-center shadow-xl md:p-10">
                    <CheckCircle className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden />
                    <h1 className="font-display mb-3 text-2xl font-bold text-[#003366] md:text-3xl">
                        Thank you for your enquiry
                    </h1>
                    <p className="mb-8 text-gray-600 leading-relaxed">
                        We have received your franchise enquiry. Our team will contact you shortly.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link href="/franchise/">
                            <Button variant="primary">Back to franchise page</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="outline">Go to homepage</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

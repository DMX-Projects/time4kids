'use client';

import FranchiseNopaperFormEmbed from '@/components/franchise/FranchiseNopaperFormEmbed';

type FranchiseFormProps = {
    compact?: boolean;
    className?: string;
};

const FranchiseForm = ({ compact = false, className = '' }: FranchiseFormProps) => {
    const wrap = compact
        ? 'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg md:p-6'
        : 'rounded-2xl bg-white p-8 shadow-xl';
    const titleClass = compact
        ? 'mb-4 text-lg font-bold text-gray-900'
        : 'mb-6 text-2xl font-bold text-gray-900';

    return (
        <div className={`${wrap} ${className}`.trim()}>
            <h3 className={`font-display ${titleClass}`}>Franchise Enquiry Form</h3>
            <FranchiseNopaperFormEmbed height="600px" />
        </div>
    );
};

export default FranchiseForm;

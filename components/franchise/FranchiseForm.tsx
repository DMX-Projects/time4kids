'use client';

import CustomFranchiseEnquiryForm from '@/components/franchise/CustomFranchiseEnquiryForm';

type FranchiseFormProps = {
    compact?: boolean;
    className?: string;
};

const FranchiseForm = ({ compact = false, className = '' }: FranchiseFormProps) => {
    const wrap = compact
        ? 'rounded-2xl border border-slate-200/90 bg-white p-5 shadow-lg md:p-6'
        : 'rounded-2xl bg-white p-8 shadow-xl';

    return (
        <div className={`${wrap} ${className}`.trim()}>
            <CustomFranchiseEnquiryForm />
        </div>
    );
};

export default FranchiseForm;

import Link from "next/link";

export default function ResourcePlaceholder({
    title,
    description,
    details,
}: {
    title: string;
    description: string;
    details?: string[];
}) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-[#111827]">{title}</h1>
                <p className="text-sm text-[#374151]">{description}</p>
            </div>

            <div className="bg-[#fffaf0] border border-[#E5E7EB] rounded-2xl p-5">
                <p className="text-sm font-semibold text-[#9A3412]">This module is being prepared.</p>
                <p className="text-sm text-[#374151] mt-1">
                    You can access this page to confirm the resource name and the expected workflow.
                    Once the document/workflow is ready, it will be enabled here without changing your navigation.
                </p>

                {details && details.length > 0 && (
                    <ul className="mt-3 list-disc pl-5 text-sm text-[#374151] space-y-1">
                        {details.map((d, idx) => (
                            <li key={idx}>{d}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="pt-2">
                <Link href="/dashboard/franchise" className="text-sm font-semibold text-[#FF922B] hover:text-orange-600 underline">
                    Back to Resource Hub
                </Link>
            </div>
        </div>
    );
}


"use client";

import Link from "next/link";
import { FolderUp } from "lucide-react";
import { FranchiseCentreBulkUpload } from "@/components/franchise/FranchiseCentreBulkUpload";

export default function UploadCentreFilesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <FolderUp className="w-7 h-7 text-[#FF922B]" />
                    Upload centre files
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Upload from your computer — single files, many files, or a whole local folder. Choose whether files
                    go to the <strong>parents app</strong>, your <strong>franchise centre pages</strong>, or both.
                </p>
                <p className="text-xs text-[#6B7280] mt-2">
                    Also available on{" "}
                    <Link href="/dashboard/franchise/parent-documents/" className="text-[#2563EB] font-semibold">
                        Parent documents
                    </Link>
                    .
                </p>
            </div>

            <FranchiseCentreBulkUpload />
        </div>
    );
}

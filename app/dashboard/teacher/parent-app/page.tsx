"use client";

import { Suspense } from "react";
import { ParentPortalAdmin } from "@/components/dashboard/franchise/ParentPortalAdmin";

export default function TeacherParentAppPage() {
    return (
        <Suspense fallback={null}>
            <ParentPortalAdmin mode="teacher" />
        </Suspense>
    );
}

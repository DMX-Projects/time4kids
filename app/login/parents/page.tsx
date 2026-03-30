"use client";

import { LoginPageContent } from "@/components/auth/LoginPageContent";

export const dynamic = "force-dynamic";

export default function ParentLoginPage() {
    return <LoginPageContent variant="parent" />;
}

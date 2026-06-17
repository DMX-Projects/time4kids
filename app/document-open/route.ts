import { NextRequest, NextResponse } from "next/server";

const ALLOWED_API_PREFIXES = [
    "documents/franchise/documents/",
    "documents/parent/documents/",
];

function djangoApiOrigin(): string {
    return (
        process.env.INTERNAL_API_URL ||
        process.env.DJANGO_DEV_BACKEND_URL ||
        "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
}

function isAllowedProxyPath(pathname: string): boolean {
    const clean = pathname.replace(/^\/+/, "").split("?")[0].split("#")[0];
    return ALLOWED_API_PREFIXES.some(
        (prefix) => clean.startsWith(prefix) && clean.endsWith("/file/"),
    );
}

function errorHtml(message: string, status: number): NextResponse {
    const body =
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unable to open file</title>` +
        `<style>body{margin:0;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f8fafc;color:#334155;padding:24px}</style></head>` +
        `<body><p style="max-width:28rem;text-align:center;line-height:1.5">${message}</p></body></html>`;
    return new NextResponse(body, {
        status,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    let pathname = "";
    let token = "";
    let name = "";
    let student = "";
    let studentId = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const form = await request.formData();
        pathname = String(form.get("p") || "").trim();
        token = String(form.get("token") || "").trim();
        name = String(form.get("name") || "").trim();
        student = String(form.get("student") || "").trim();
        studentId = String(form.get("student_id") || "").trim();
    } else {
        try {
            const json = (await request.json()) as {
                p?: string;
                token?: string;
                name?: string;
                student?: string;
                student_id?: string;
            };
            pathname = (json.p || "").trim();
            token = (json.token || "").trim();
            name = (json.name || "").trim();
            student = String(json.student || "").trim();
            studentId = String(json.student_id || "").trim();
        } catch {
            return errorHtml("Invalid request.", 400);
        }
    }

    if (!pathname || !isAllowedProxyPath(pathname)) {
        return errorHtml("Invalid document path.", 400);
    }
    if (!token) {
        return errorHtml("Authentication required. Go back to the dashboard and try again.", 401);
    }

    const upstreamParams = new URLSearchParams();
    if (name) upstreamParams.set("name", name);
    if (student) upstreamParams.set("student", student);
    if (studentId) upstreamParams.set("student_id", studentId);
    const rel = pathname.replace(/^\/+/, "");
    const query = upstreamParams.toString();
    const upstream = `${djangoApiOrigin()}/api/${rel}${query ? `?${query}` : ""}`;

    let upstreamRes: Response;
    try {
        upstreamRes = await fetch(upstream, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch {
        return errorHtml("Document server unreachable. Try again in a moment.", 502);
    }

    if (!upstreamRes.ok) {
        if (upstreamRes.status === 401 || upstreamRes.status === 403) {
            return errorHtml(
                "Your session expired. Close this tab, return to the dashboard, and sign in again.",
                401,
            );
        }
        return errorHtml("Could not load this file. Close this tab and try again from the dashboard.", upstreamRes.status);
    }

    const upstreamType = (upstreamRes.headers.get("content-type") || "").toLowerCase();
    if (upstreamType.includes("application/json")) {
        return errorHtml("Could not load this file. Close this tab and try again from the dashboard.", 502);
    }

    const headers = new Headers();
    if (upstreamRes.headers.get("content-type")) {
        headers.set("Content-Type", upstreamRes.headers.get("content-type")!);
    }
    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const disposition = upstreamRes.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition);
    headers.set("Cache-Control", "private, no-store");

    return new NextResponse(upstreamRes.body, { status: 200, headers });
}

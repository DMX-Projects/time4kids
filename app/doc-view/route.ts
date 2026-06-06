import { NextRequest, NextResponse } from "next/server";

const DOC_VIEW_COOKIE = "tk_dva";

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

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    const pathname = (request.nextUrl.searchParams.get("p") || "").trim();
    if (!pathname || !isAllowedProxyPath(pathname)) {
        return NextResponse.json({ detail: "Invalid document path" }, { status: 400 });
    }

    const token = request.cookies.get(DOC_VIEW_COOKIE)?.value?.trim();
    if (!token) {
        return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
    }

    const upstreamParams = new URLSearchParams();
    const name = request.nextUrl.searchParams.get("name");
    if (name?.trim()) upstreamParams.set("name", name.trim());

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
        return NextResponse.json({ detail: "Document backend unreachable" }, { status: 502 });
    }

    const headers = new Headers();
    const contentType = upstreamRes.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const disposition = upstreamRes.headers.get("content-disposition");
    if (disposition) headers.set("Content-Disposition", disposition);
    headers.set("Cache-Control", "private, no-store");

    const secure = request.nextUrl.protocol === "https:";
    headers.append(
        "Set-Cookie",
        `${DOC_VIEW_COOKIE}=; Path=/doc-view; Max-Age=0; SameSite=Lax${secure ? "; Secure" : ""}`,
    );

    return new NextResponse(upstreamRes.body, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        headers,
    });
}

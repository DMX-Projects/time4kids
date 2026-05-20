import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { publicStaticFallbackForMediaPath } from "@/lib/api-client";

/**
 * Serve Django uploads at `/cms-media/*` (same origin as the marketing site).
 * Rewrites in next.config can miss on some hosts; this route always proxies to Django `/media/*`.
 */
function djangoMediaOrigin(): string {
    return (
        process.env.INTERNAL_API_URL ||
        process.env.DJANGO_DEV_BACKEND_URL ||
        "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
    request: NextRequest,
    context: { params: { path?: string[] } },
) {
    const segments = (context.params.path || []).filter((s) => s.length > 0);
    const relPath = segments.join("/");
    if (!relPath) {
        return NextResponse.json({ detail: "Missing file path" }, { status: 400 });
    }

    const upstream = `${djangoMediaOrigin()}/media/${relPath}${request.nextUrl.search}`;
    let upstreamRes: Response;
    try {
        upstreamRes = await fetch(upstream, {
            method: "GET",
            cache: "no-store",
        });
    } catch {
        return NextResponse.json({ detail: "Media backend unreachable" }, { status: 502 });
    }

    if (!upstreamRes.ok) {
        const staticPath = publicStaticFallbackForMediaPath(`/media/${relPath}`);
        if (staticPath) {
            try {
                const filePath = path.join(process.cwd(), "public", staticPath.replace(/^\//, ""));
                const body = await readFile(filePath);
                const ext = path.extname(filePath).toLowerCase();
                const contentType =
                    ext === ".png"
                        ? "image/png"
                        : ext === ".jpg" || ext === ".jpeg"
                          ? "image/jpeg"
                          : ext === ".webp"
                            ? "image/webp"
                            : "application/octet-stream";
                return new NextResponse(body, {
                    status: 200,
                    headers: {
                        "Content-Type": contentType,
                        "Cache-Control": "public, max-age=86400",
                    },
                });
            } catch {
                const url = new URL(staticPath, request.nextUrl.origin);
                return NextResponse.redirect(url, 307);
            }
        }
        return new NextResponse(upstreamRes.body, {
            status: upstreamRes.status,
            statusText: upstreamRes.statusText,
        });
    }

    const headers = new Headers();
    const contentType = upstreamRes.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    const len = upstreamRes.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    headers.set("Cache-Control", "public, max-age=86400");

    return new NextResponse(upstreamRes.body, { status: 200, headers });
}

/**
 * Franchise centre files: PDFs open in a new tab with the correct filename;
 * ZIPs download directly. Uses direct URLs + ?name= so browser Save uses link text.
 */

import { apiUrl, mediaUrl } from "@/lib/api-client";
import { isLegacyFranchiseUploadUrl, legacyPcHrefToMediaUrl } from "@/lib/franchise-center-page-links";
import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import {
    parseFilenameFromContentDisposition,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";

export type AuthFetchBlobResponse = (
    path: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

export type AuthFetchBlobFromHref = (
    href: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

/** Build authenticated view URL — browser PDF viewer gets correct Content-Disposition name. */
export function buildFranchiseFileViewUrl(
    accessToken: string,
    downloadName: string,
    options: { hubDocId?: number; href: string },
): string | null {
    const token = accessToken.trim();
    const name = downloadName.trim();
    if (!token || !name) return null;

    const params = new URLSearchParams();
    params.set("access", token);
    params.set("name", name);

    if (options.hubDocId != null) {
        return `${apiUrl(`/documents/franchise/documents/${options.hubDocId}/file/`)}?${params}`;
    }

    const href = options.href.trim();
    if (!href || isLegacyFranchiseUploadUrl(href)) {
        return null;
    }

    const mediaFromLegacy = legacyPcHrefToMediaUrl(href);
    const base = mediaFromLegacy
        ? mediaFromLegacy
        : /^https?:\/\//i.test(href)
          ? href
          : href.startsWith("/media/")
            ? mediaUrl(href.replace(/^\/media\/?/i, ""))
            : null;

    if (!base) return null;

    const joiner = base.includes("?") ? "&" : "?";
    return `${base}${joiner}${params}`;
}

function saveBlobFile(blob: Blob, fileName: string): void {
    const safeName = fileName.trim() || "document";
    const named =
        typeof File !== "undefined"
            ? new File([blob], safeName, { type: blob.type || "application/octet-stream" })
            : blob;
    const url = URL.createObjectURL(named);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

function openViaBlobFetch(
    fetcher: () => Promise<Blob>,
    downloadName: string,
): void {
    void (async () => {
        try {
            const blob = await fetcher();
            saveBlobFile(blob, downloadName);
        } catch {
            /* silent */
        }
    })();
}

function openFranchiseFile(
    accessToken: string | undefined,
    downloadName: string,
    options: {
        hubDocId?: number;
        href: string;
        authFetchBlobResponse: AuthFetchBlobResponse;
        authFetchBlobFromHref: AuthFetchBlobFromHref;
    },
): void {
    const name = downloadName.trim() || "document";

    if (shouldViewFileInline(name) && accessToken) {
        const viewUrl = buildFranchiseFileViewUrl(accessToken, name, {
            hubDocId: options.hubDocId,
            href: options.href,
        });
        if (viewUrl) {
            window.open(viewUrl, "_blank", "noopener,noreferrer");
            return;
        }
    }

    if (options.hubDocId != null) {
        openViaBlobFetch(
            () =>
                options.authFetchBlobResponse(
                    `/documents/franchise/documents/${options.hubDocId}/file/`,
                ).then((r) => r.blob),
            name,
        );
        return;
    }

    const href = options.href.trim();
    if (!href) return;

    if (shouldViewFileInline(name)) {
        const tab = window.open("about:blank", "_blank", "noopener,noreferrer");
        void (async () => {
            try {
                const { blob } = await options.authFetchBlobFromHref(href);
                const file = new File([blob], name, { type: blob.type || "application/pdf" });
                const url = URL.createObjectURL(file);
                if (tab && !tab.closed) tab.location.href = url;
                else window.open(url, "_blank", "noopener,noreferrer");
                window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
            } catch {
                if (tab && !tab.closed) tab.close();
            }
        })();
        return;
    }

    openViaBlobFetch(() => options.authFetchBlobFromHref(href).then((r) => r.blob), name);
}

export function openFranchiseHubDocument(
    accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    authFetchBlobFromHref: AuthFetchBlobFromHref,
    fileApiPath: string,
    downloadName: string,
    hubDocId: number,
    href: string,
): void {
    openFranchiseFile(accessToken, downloadName, {
        hubDocId,
        href,
        authFetchBlobResponse,
        authFetchBlobFromHref,
    });
}

/** Open YouTube / MediaDelivery / iframe embed in a new tab. */
export function openFranchiseEmbedLink(rawEmbedUrl: string): void {
    const embedSrc = resolveFranchiseEmbedSrc(rawEmbedUrl);
    if (!embedSrc) return;
    window.open(embedSrc, "_blank", "noopener,noreferrer");
}

export function openFranchiseFileFromHref(
    accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    authFetchBlobFromHref: AuthFetchBlobFromHref,
    href: string,
    downloadName: string,
): void {
    openFranchiseFile(accessToken, downloadName, {
        href,
        authFetchBlobResponse,
        authFetchBlobFromHref,
    });
}

export { parseFilenameFromContentDisposition };

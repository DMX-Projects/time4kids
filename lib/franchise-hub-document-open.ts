/**
 * Franchise centre files — opens in a new tab without putting tokens in the URL.
 * Each click fetches the file in the background (session auto-refreshes if idle).
 */

import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import {
    parseFilenameFromContentDisposition,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";
import { extensionFromPath } from "@/lib/franchise-download-filename";
import { openBlobInlineInNewTab, openViewUrlInNewTab } from "@/lib/inline-document-open";
import {
    GetAccessToken,
    normalizeProtectedDocumentApiPath,
    openProtectedDocumentView,
} from "@/lib/protected-document-view-url";

export type AuthFetchBlobResponse = (
    path: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

export type AuthFetchBlobFromHref = (
    href: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

function filePathWithDownloadName(apiPath: string, downloadName: string): string {
    const params = new URLSearchParams();
    params.set("name", downloadName.trim() || "document");
    const joiner = apiPath.includes("?") ? "&" : "?";
    return `${apiPath}${joiner}${params}`;
}

function resolveDownloadName(preferred: string, fromServer?: string): string {
    const server = fromServer?.trim();
    if (server) return server;
    return preferred.trim() || "document";
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

type BlobFetchResult = { blob: Blob; filename?: string };

function openViaBlobFetch(
    fetcher: () => Promise<BlobFetchResult>,
    downloadName: string,
): void {
    void (async () => {
        try {
            const { blob, filename } = await fetcher();
            saveBlobFile(blob, resolveDownloadName(downloadName, filename));
        } catch {
            /* silent */
        }
    })();
}

function openFranchiseFile(
    getAccessToken: GetAccessToken,
    downloadName: string,
    options: {
        hubDocId?: number;
        href: string;
        authFetchBlobResponse: AuthFetchBlobResponse;
        authFetchBlobFromHref: AuthFetchBlobFromHref;
    },
): void {
    const name = downloadName.trim() || "document";
    const hubApiPath =
        options.hubDocId != null
            ? filePathWithDownloadName(
                  `/documents/franchise/documents/${options.hubDocId}/file/`,
                  name,
              )
            : null;
    const fetchHub = hubApiPath ? () => options.authFetchBlobResponse(hubApiPath) : null;
    const href = options.href.trim();
    const fetchHref = href ? () => options.authFetchBlobFromHref(href) : null;
    const isPdf = extensionFromPath(name).toLowerCase() === ".pdf";

    if (shouldViewFileInline(name)) {
        const protectedPath = hubApiPath || normalizeProtectedDocumentApiPath(href);
        if (isPdf && protectedPath) {
            void openProtectedDocumentView(getAccessToken, protectedPath);
            return;
        }
        if (fetchHub) {
            openBlobInlineInNewTab(
                () => fetchHub().then((r) => ({ blob: r.blob, filename: resolveDownloadName(name, r.filename) })),
                name,
            );
            return;
        }
        if (fetchHref) {
            openBlobInlineInNewTab(
                () => fetchHref().then((r) => ({ blob: r.blob, filename: resolveDownloadName(name, r.filename) })),
                name,
            );
        }
        return;
    }

    if (fetchHub) {
        openViaBlobFetch(() => fetchHub(), name);
        return;
    }
    if (fetchHref) {
        openViaBlobFetch(() => fetchHref(), name);
    }
}

export function openFranchiseHubDocument(
    getAccessToken: GetAccessToken,
    authFetchBlobResponse: AuthFetchBlobResponse,
    authFetchBlobFromHref: AuthFetchBlobFromHref,
    _fileApiPath: string,
    downloadName: string,
    hubDocId: number,
    href: string,
): void {
    openFranchiseFile(getAccessToken, downloadName, {
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
    openViewUrlInNewTab(embedSrc);
}

export function openFranchiseFileFromHref(
    getAccessToken: GetAccessToken,
    authFetchBlobResponse: AuthFetchBlobResponse,
    authFetchBlobFromHref: AuthFetchBlobFromHref,
    href: string,
    downloadName: string,
): void {
    openFranchiseFile(getAccessToken, downloadName, {
        href,
        authFetchBlobResponse,
        authFetchBlobFromHref,
    });
}

export { parseFilenameFromContentDisposition };

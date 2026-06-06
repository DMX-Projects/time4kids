/**
 * Franchise centre files — opens in a new tab without putting tokens in the URL.
 * Each click fetches the file in the background (session auto-refreshes if idle).
 */

import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import {
    parseFilenameFromContentDisposition,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";
import { openBlobInlineInNewTab, openViewUrlInNewTab } from "@/lib/inline-document-open";

export type AuthFetchBlobResponse = (
    path: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

export type AuthFetchBlobFromHref = (
    href: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

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
    downloadName: string,
    options: {
        hubDocId?: number;
        href: string;
        authFetchBlobResponse: AuthFetchBlobResponse;
        authFetchBlobFromHref: AuthFetchBlobFromHref;
    },
): void {
    const name = downloadName.trim() || "document";
    const fetchHub =
        options.hubDocId != null
            ? () =>
                  options
                      .authFetchBlobResponse(`/documents/franchise/documents/${options.hubDocId}/file/`)
                      .then((r) => r.blob)
            : null;
    const href = options.href.trim();
    const fetchHref = href ? () => options.authFetchBlobFromHref(href).then((r) => r.blob) : null;

    if (shouldViewFileInline(name)) {
        if (fetchHub) {
            openBlobInlineInNewTab(fetchHub, name);
            return;
        }
        if (fetchHref) {
            openBlobInlineInNewTab(fetchHref, name);
        }
        return;
    }

    if (fetchHub) {
        openViaBlobFetch(fetchHub, name);
        return;
    }
    if (fetchHref) {
        openViaBlobFetch(fetchHref, name);
    }
}

export function openFranchiseHubDocument(
    _accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    authFetchBlobFromHref: AuthFetchBlobFromHref,
    _fileApiPath: string,
    downloadName: string,
    hubDocId: number,
    href: string,
): void {
    openFranchiseFile(downloadName, {
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
    _accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    authFetchBlobFromHref: AuthFetchBlobFromHref,
    href: string,
    downloadName: string,
): void {
    openFranchiseFile(downloadName, {
        href,
        authFetchBlobResponse,
        authFetchBlobFromHref,
    });
}

export { parseFilenameFromContentDisposition };

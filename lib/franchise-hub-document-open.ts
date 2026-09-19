/**
 * Franchise centre files — downloads PDFs and opens previewable media in a new tab.
 * Each click fetches the file with the session token (auto-refreshes if idle).
 */

import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import {
    parseFilenameFromContentDisposition,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";
import { extensionFromPath } from "@/lib/franchise-download-filename";
import { openBlobInlineInNewTab, openViewUrlInNewTab } from "@/lib/inline-document-open";
import { saveBlobFile } from "@/lib/save-blob-file";
import type { GetAccessToken } from "@/lib/protected-document-view-url";

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

type BlobFetchResult = { blob: Blob; filename?: string };

function openViaBlobFetch(
    fetcher: () => Promise<BlobFetchResult>,
    downloadName: string,
): void {
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    void (async () => {
        try {
            const { blob, filename } = await fetcher();
            saveBlobFile(blob, resolveDownloadName(downloadName, filename));
            if (tab && !tab.closed) tab.close();
        } catch {
            const message = "Could not download this file. Make sure you are signed in and try again.";
            if (tab && !tab.closed) {
                tab.document.open();
                tab.document.write(
                    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Download failed</title></head>` +
                        `<body style="font-family:system-ui;display:flex;min-height:100vh;align-items:center;justify-content:center;color:#334155">${message}</body></html>`,
                );
                tab.document.close();
            } else {
                window.alert(message);
            }
        }
    })();
}

function openFranchiseFile(
    _getAccessToken: GetAccessToken,
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

    // PDFs must download as a real file. POST /document-open/ makes Chrome save a
    // nameless "download" and then retry with GET, which shows "Site wasn't available".
    if (isPdf) {
        if (fetchHub) {
            openViaBlobFetch(() => fetchHub(), name);
            return;
        }
        if (fetchHref) {
            openViaBlobFetch(() => fetchHref(), name);
            return;
        }
    }

    if (shouldViewFileInline(name)) {
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

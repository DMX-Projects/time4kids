/**
 * Parent documents — opens in a new tab without tokens in the URL.
 */

import {
    downloadFilenameFromLinkLabel,
    extensionFromPath,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";
import { isNewsletterAudioMediaUrl } from "@/config/parent-newsletter";
import { openFranchiseEmbedLink } from "@/lib/franchise-hub-document-open";
import { resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import { openBlobInlineInNewTab, openDirectAudioUrlInNewTab } from "@/lib/inline-document-open";
import { GetAccessToken, openProtectedDocumentView } from "@/lib/protected-document-view-url";

export type ParentDocFileInput = {
    id: number;
    title: string;
    file: string;
    display_title?: string;
    audio_file?: string;
};

export type AuthFetchBlobResponse = (
    path: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

function linkLabel(doc: ParentDocFileInput): string {
    return (doc.display_title || doc.title || "").trim() || "document";
}

function filePathWithDownloadName(docId: number, downloadName: string): string {
    const params = new URLSearchParams();
    params.set("name", downloadName.trim() || "document");
    return `/documents/parent/documents/${docId}/file/?${params}`;
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

/** Play newsletter video embed; uses audio player when the link is audio, not a blank video frame. */
export function openNewsletterVideoEmbedLink(rawEmbedUrl: string, title?: string): void {
    const candidate = rawEmbedUrl.trim();
    if (!candidate) return;
    if (isNewsletterAudioMediaUrl(candidate)) {
        openDirectAudioUrlInNewTab(candidate, title || "Audio");
        return;
    }
    const resolved = resolveFranchiseEmbedSrc(candidate);
    if (resolved && isNewsletterAudioMediaUrl(resolved)) {
        openDirectAudioUrlInNewTab(resolved, title || "Audio");
        return;
    }
    openFranchiseEmbedLink(candidate);
}

export function openParentDocumentAudioFile(
    getAccessToken: GetAccessToken,
    authFetchBlobResponse: AuthFetchBlobResponse,
    doc: ParentDocFileInput,
): void {
    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.audio_file || "") || ".mp3");
    const params = new URLSearchParams();
    params.set("name", name.trim() || "audio");
    const apiPath = `/documents/parent/documents/${doc.id}/audio/?${params}`;
    openBlobInlineInNewTab(
        () => authFetchBlobResponse(apiPath).then((r) => ({ blob: r.blob, filename: resolveDownloadName(name, r.filename) })),
        name,
        { forceAudio: true },
    );
}

export function openParentDocumentFile(
    getAccessToken: GetAccessToken,
    authFetchBlobResponse: AuthFetchBlobResponse,
    doc: ParentDocFileInput,
): void {
    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.file) || undefined);
    const apiPath = filePathWithDownloadName(doc.id, name);
    const fetchDoc = () => authFetchBlobResponse(apiPath);
    const isPdf = extensionFromPath(name).toLowerCase() === ".pdf";

    if (shouldViewFileInline(name)) {
        if (isPdf) {
            void openProtectedDocumentView(getAccessToken, apiPath);
            return;
        }
        openBlobInlineInNewTab(
            () => fetchDoc().then((r) => ({ blob: r.blob, filename: resolveDownloadName(name, r.filename) })),
            name,
        );
        return;
    }

    void (async () => {
        try {
            const { blob, filename } = await fetchDoc();
            saveBlobFile(blob, resolveDownloadName(name, filename));
        } catch {
            /* silent */
        }
    })();
}

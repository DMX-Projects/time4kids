/**
 * Parent documents — opens in a new tab without tokens in the URL.
 */

import {
    downloadFilenameFromLinkLabel,
    extensionFromPath,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";
import { openBlobInlineInNewTab } from "@/lib/inline-document-open";

export type ParentDocFileInput = { id: number; title: string; file: string; display_title?: string };

export type AuthFetchBlobResponse = (
    path: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

function linkLabel(doc: ParentDocFileInput): string {
    return (doc.display_title || doc.title || "").trim() || "document";
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

export function openParentDocumentFile(
    _accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    doc: ParentDocFileInput,
): void {
    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.file) || undefined);
    const fetchDoc = () =>
        authFetchBlobResponse(`/documents/parent/documents/${doc.id}/file/`).then((r) => r.blob);

    if (shouldViewFileInline(name)) {
        openBlobInlineInNewTab(fetchDoc, name);
        return;
    }

    void (async () => {
        try {
            const { blob, filename } = await authFetchBlobResponse(`/documents/parent/documents/${doc.id}/file/`);
            saveBlobFile(blob, filename || name);
        } catch {
            /* silent */
        }
    })();
}

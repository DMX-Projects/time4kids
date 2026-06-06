/**
 * Parent portal / franchise parent-documents: open files in a new tab with inline content.
 */

import { apiUrl } from "@/lib/api-client";
import {
    downloadFilenameFromLinkLabel,
    extensionFromPath,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";
import { openBlobInlineInNewTab, openViewUrlInNewTab } from "@/lib/inline-document-open";

export type ParentDocFileInput = { id: number; title: string; file: string; display_title?: string };

export type AuthFetchBlobResponse = (
    path: string,
    init?: RequestInit,
) => Promise<{ blob: Blob; filename?: string }>;

function linkLabel(doc: ParentDocFileInput): string {
    return (doc.display_title || doc.title || "").trim() || "document";
}

export function buildParentDocumentFileViewUrl(accessToken: string, doc: ParentDocFileInput): string | null {
    const token = accessToken.trim();
    if (!token) return null;
    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.file) || undefined);
    const params = new URLSearchParams();
    params.set("access", token);
    params.set("name", name);
    return `${apiUrl(`/documents/parent/documents/${doc.id}/file/`)}?${params}`;
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
    accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    doc: ParentDocFileInput,
): void {
    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.file) || undefined);

    if (shouldViewFileInline(name)) {
        const viewUrl = accessToken?.trim() ? buildParentDocumentFileViewUrl(accessToken, doc) : null;
        if (viewUrl) {
            openViewUrlInNewTab(viewUrl);
            return;
        }

        openBlobInlineInNewTab(
            () => authFetchBlobResponse(`/documents/parent/documents/${doc.id}/file/`).then((r) => r.blob),
            name,
        );
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

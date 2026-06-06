/**
 * Parent portal / franchise parent-documents: open files via authenticated API
 * (`/documents/parent/documents/<id>/file/`) so the browser does not depend on public `/media/…`.
 */

import { apiUrl } from "@/lib/api-client";
import {
    downloadFilenameFromLinkLabel,
    extensionFromPath,
    shouldViewFileInline,
} from "@/lib/franchise-download-filename";

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

function openInlineViaBlob(
    authFetchBlobResponse: AuthFetchBlobResponse,
    docId: number,
    filename: string,
): void {
    const tab = window.open("about:blank", "_blank", "noopener,noreferrer");
    void (async () => {
        try {
            const { blob } = await authFetchBlobResponse(`/documents/parent/documents/${docId}/file/`);
            const ext = extensionFromPath(filename).replace(/^\./, "");
            const file = new File([blob], filename, {
                type: blob.type || (ext === "pdf" ? "application/pdf" : "application/octet-stream"),
            });
            const url = URL.createObjectURL(file);
            if (tab && !tab.closed) tab.location.href = url;
            else window.open(url, "_blank", "noopener,noreferrer");
            window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
        } catch {
            if (tab && !tab.closed) tab.close();
        }
    })();
}

export function openParentDocumentFile(
    _accessToken: string | undefined,
    authFetchBlobResponse: AuthFetchBlobResponse,
    doc: ParentDocFileInput,
): void {
    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.file) || undefined);

    if (shouldViewFileInline(name)) {
        openInlineViaBlob(authFetchBlobResponse, doc.id, name);
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

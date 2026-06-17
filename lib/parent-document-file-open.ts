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

import { withParentStudentQuery } from "@/lib/parent-student-query";

import type { GetAccessToken } from "@/lib/protected-document-view-url";



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



function filePathWithDownloadName(docId: number, downloadName: string, studentId?: string | null): string {

    const params = new URLSearchParams();

    params.set("name", downloadName.trim() || "document");

    const base = `/documents/parent/documents/${docId}/file/?${params}`;

    return withParentStudentQuery(base, studentId);

}



function resolveDownloadName(preferred: string, fromServer?: string): string {

    const server = fromServer?.trim();

    if (server) return server;

    return preferred.trim() || "document";

}



function resolveFileExtension(doc: ParentDocFileInput): string {
    const fileRef = (doc.file || "").trim();
    const fromFile = extensionFromPath(fileRef);
    if (fromFile) return fromFile;
    if (fileRef.includes("/documents/parent/documents/") && fileRef.includes("/file")) {
        return ".pdf";
    }
    return (
        extensionFromPath(doc.audio_file || "") ||
        extensionFromPath(doc.display_title || doc.title || "")
    );
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



function showOpenError(tab: Window | null, message: string): void {

    const safe = message

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;");

    if (tab && !tab.closed) {

        tab.document.open();

        tab.document.write(

            `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unable to open file</title>` +

                `<style>body{margin:0;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f8fafc;color:#334155;padding:24px}</style></head>` +

                `<body><p style="max-width:28rem;text-align:center;line-height:1.5">${safe}</p></body></html>`,

        );

        tab.document.close();

        return;

    }

    window.alert(message);

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

    _getAccessToken: GetAccessToken,

    authFetchBlobResponse: AuthFetchBlobResponse,

    doc: ParentDocFileInput,

    studentId?: string | null,

): void {

    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extensionFromPath(doc.audio_file || "") || ".mp3");

    const params = new URLSearchParams();

    params.set("name", name.trim() || "audio");

    const apiPath = withParentStudentQuery(

        `/documents/parent/documents/${doc.id}/audio/?${params}`,

        studentId,

    );

    openBlobInlineInNewTab(

        () => authFetchBlobResponse(apiPath).then((r) => ({ blob: r.blob, filename: resolveDownloadName(name, r.filename) })),

        name,

        { forceAudio: true },

    );

}



export function openParentDocumentFile(

    _getAccessToken: GetAccessToken,

    authFetchBlobResponse: AuthFetchBlobResponse,

    doc: ParentDocFileInput,

    studentId?: string | null,

): void {

    const extHint = resolveFileExtension(doc) || undefined;

    const name = downloadFilenameFromLinkLabel(linkLabel(doc), extHint);

    const apiPath = filePathWithDownloadName(doc.id, name, studentId);

    const fetchDoc = () => authFetchBlobResponse(apiPath);



    if (shouldViewFileInline(name)) {

        openBlobInlineInNewTab(

            () => fetchDoc().then((r) => ({ blob: r.blob, filename: resolveDownloadName(name, r.filename) })),

            name,

        );

        return;

    }



    const tab = window.open("about:blank", "_blank");

    if (tab) tab.opener = null;

    void (async () => {

        try {

            const { blob, filename } = await fetchDoc();

            saveBlobFile(blob, resolveDownloadName(name, filename));

            if (tab && !tab.closed) tab.close();

        } catch (err) {

            const message =

                err instanceof Error && /session expired|sign in|authentication required/i.test(err.message)

                    ? "Your session expired. Go back to the dashboard and sign in again."

                    : "Could not open this file. Make sure you are signed in and try again.";

            showOpenError(tab, message);

        }

    })();

}



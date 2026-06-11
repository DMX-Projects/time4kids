import { extensionFromPath } from "@/lib/franchise-download-filename";

/** Open a protected file URL in one new tab (browser renders PDF/image/video inline). */
export function openViewUrlInNewTab(viewUrl: string): void {
    window.open(viewUrl, "_blank", "noopener,noreferrer");
}

/** Open a direct audio URL in a simple player tab (avoids blank video for audio-only files). */
export function openDirectAudioUrlInNewTab(mediaUrl: string, title = "Audio"): void {
    const safeUrl = escapeHtml(mediaUrl.trim());
    const safeTitle = escapeHtml(title.trim() || "Audio");
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
        openViewUrlInNewTab(mediaUrl);
        return;
    }
    tab.opener = null;
    tab.document.open();
    tab.document.write(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title>` +
            `<style>body{margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#f8fafc}</style></head>` +
            `<body><audio src="${safeUrl}" controls autoplay style="width:min(480px,90vw)"></audio></body></html>`,
    );
    tab.document.close();
}

function mimeFromExtension(ext: string): string {
    switch (ext) {
        case "pdf":
            return "application/pdf";
        case "png":
            return "image/png";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "gif":
            return "image/gif";
        case "webp":
            return "image/webp";
        case "svg":
            return "image/svg+xml";
        case "mp4":
            return "video/mp4";
        case "webm":
            return "video/webm";
        case "mov":
            return "video/quicktime";
        case "mp3":
            return "audio/mpeg";
        case "wav":
            return "audio/wav";
        case "m4a":
            return "audio/mp4";
        case "amr":
            return "audio/amr";
        case "opus":
            return "audio/opus";
        case "caf":
            return "audio/x-caf";
        case "aiff":
        case "aif":
            return "audio/aiff";
        case "3gp":
            return "audio/3gpp";
        case "weba":
            return "audio/webm";
        case "htm":
        case "html":
            return "text/html";
        default:
            return "application/octet-stream";
    }
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Show fetched bytes in a new tab (legacy URLs / no view URL).
 * Opens one placeholder tab on click, then renders PDF/image/audio/video inside it.
 */
export function openBlobInlineInNewTab(
    fetcher: () => Promise<Blob | { blob: Blob; filename?: string }>,
    downloadName: string,
    options?: { forceAudio?: boolean },
): void {
    const name = downloadName.trim() || "document";
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;

    void (async () => {
        try {
            const result = await fetcher();
            const blob = result instanceof Blob ? result : result.blob;
            const resolvedName =
                result instanceof Blob
                    ? name
                    : (result.filename?.trim() || name);
            const ext = extensionFromPath(resolvedName).replace(/^\./, "").toLowerCase();
            const type = (blob.type || mimeFromExtension(ext)).toLowerCase();
            const file = new File([blob], resolvedName, { type });
            const url = URL.createObjectURL(file);
            const safeTitle = escapeHtml(resolvedName);
            const audioExts = new Set([
                "mp3",
                "wav",
                "m4a",
                "aac",
                "ogg",
                "flac",
                "wma",
                "amr",
                "opus",
                "caf",
                "aiff",
                "aif",
                "mpeg",
                "mpg",
                "3gp",
                "weba",
            ]);
            const videoExts = new Set(["webm", "mov", "m4v", "avi", "mkv"]);
            const isAudio = Boolean(options?.forceAudio) || type.startsWith("audio/") || audioExts.has(ext);
            const isVideo = !isAudio && (type.startsWith("video/") || ext === "mp4" || videoExts.has(ext));

            const target = tab && !tab.closed ? tab : window.open("about:blank", "_blank");
            if (!target || target.closed) {
                window.open(url, "_blank", "noopener,noreferrer");
                window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
                return;
            }
            if (target !== tab) target.opener = null;

            if (ext === "pdf") {
                target.location.href = url;
            } else if (isAudio) {
                target.document.open();
                target.document.write(
                    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title>` +
                        `<style>body{margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#f8fafc}</style></head>` +
                        `<body><audio src="${url}" controls autoplay style="width:min(480px,90vw)"></audio></body></html>`,
                );
                target.document.close();
            } else if (isVideo) {
                target.document.open();
                target.document.write(
                    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title>` +
                        `<style>body{margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#111}</style></head>` +
                        `<body><video src="${url}" controls autoplay playsinline style="max-width:100%;max-height:100vh"></video></body></html>`,
                );
                target.document.close();
            } else if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) {
                target.document.open();
                target.document.write(
                    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${safeTitle}</title>` +
                        `<style>body{margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f1f5f9}</style></head>` +
                        `<body><img src="${url}" alt="${safeTitle}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`,
                );
                target.document.close();
            } else {
                target.location.href = url;
            }

            window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
        } catch (err) {
            const message =
                err instanceof Error && /session expired|sign in|authentication required/i.test(err.message)
                    ? "Your session expired. Close this tab, go back to the dashboard, and sign in again."
                    : "Could not load this file. Close this tab and try again from the dashboard.";
            const target = tab && !tab.closed ? tab : null;
            if (target) {
                target.document.open();
                target.document.write(
                    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unable to open file</title>` +
                        `<style>body{margin:0;font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f8fafc;color:#334155;padding:24px}</style></head>` +
                        `<body><p style="max-width:28rem;text-align:center;line-height:1.5">${escapeHtml(message)}</p></body></html>`,
                );
                target.document.close();
            }
        }
    })();
}

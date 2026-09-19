/**
 * Trigger a real disk download from fetched bytes.
 *
 * Chrome ignores `<a download>` when the blob type is `application/pdf` and instead
 * tries to persist a `blob:` URL. That shows in download history as a file named
 * "download" with "Site wasn't available". Force octet-stream so Chrome saves the file.
 */
export function saveBlobFile(blob: Blob, fileName: string): void {
    const safeName = fileName.trim() || "document";
    const downloadBlob = new Blob([blob], { type: "application/octet-stream" });
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Open a downloaded hub document (PDF, etc.) in a new tab using a temporary blob URL. */
export function openFranchiseHubDocumentBlobInNewTab(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const handle = window.open(url, "_blank", "noopener,noreferrer");
    if (!handle) {
        URL.revokeObjectURL(url);
        throw new Error("Pop-up blocked. Allow pop-ups for this site, then try again.");
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

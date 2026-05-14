/**
 * Infer display metadata for franchise hub uploads from stored relative paths / URLs.
 */

export type FranchiseResourceFileKind =
    | "archive"
    | "video"
    | "audio"
    | "pdf"
    | "image"
    | "spreadsheet"
    | "document"
    | "presentation"
    | "generic";

export type FranchiseResourceFileMeta = {
    kind: FranchiseResourceFileKind;
    ext: string;
    /** Short label for chips, e.g. "ZIP", "MP4" */
    extLabel: string;
    /** Primary CTA verb */
    actionLabel: string;
};

function extensionFromPath(file: string): string {
    const noQuery = file.split("?")[0] ?? file;
    const base = noQuery.split("/").pop() ?? noQuery;
    const dot = base.lastIndexOf(".");
    if (dot <= 0 || dot === base.length - 1) return "";
    return base.slice(dot + 1).toLowerCase();
}

export function getFranchiseResourceFileMeta(file: string | null | undefined): FranchiseResourceFileMeta {
    if (!file || !file.trim()) {
        return {
            kind: "generic",
            ext: "",
            extLabel: "FILE",
            actionLabel: "Open",
        };
    }
    const ext = extensionFromPath(file);
    const extLabel = ext ? ext.toUpperCase() : "FILE";

    const archive = new Set(["zip", "rar", "7z", "tar", "gz", "tgz"]);
    const video = new Set(["mp4", "webm", "mov", "m4v", "avi", "mkv", "ogv"]);
    const audio = new Set(["mp3", "wav", "m4a", "aac", "flac", "ogg", "opus", "wma"]);
    const image = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"]);
    const spreadsheet = new Set(["xls", "xlsx", "csv", "ods"]);
    const document = new Set(["doc", "docx", "odt", "txt", "rtf"]);
    const presentation = new Set(["ppt", "pptx", "odp"]);

    if (archive.has(ext)) {
        return { kind: "archive", ext, extLabel, actionLabel: "Download" };
    }
    if (video.has(ext)) {
        return { kind: "video", ext, extLabel, actionLabel: "Watch" };
    }
    if (audio.has(ext)) {
        return { kind: "audio", ext, extLabel, actionLabel: "Listen" };
    }
    if (ext === "pdf") {
        return { kind: "pdf", ext, extLabel, actionLabel: "Open PDF" };
    }
    if (image.has(ext)) {
        return { kind: "image", ext, extLabel, actionLabel: "View" };
    }
    if (spreadsheet.has(ext)) {
        return { kind: "spreadsheet", ext, extLabel, actionLabel: "Download" };
    }
    if (document.has(ext)) {
        return { kind: "document", ext, extLabel, actionLabel: "Download" };
    }
    if (presentation.has(ext)) {
        return { kind: "presentation", ext, extLabel, actionLabel: "Download" };
    }
    return { kind: "generic", ext, extLabel, actionLabel: "Open" };
}

export function franchiseResourceRowAccentClasses(kind: FranchiseResourceFileKind): string {
    switch (kind) {
        case "archive":
            return "bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-500";
        case "video":
            return "bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500";
        case "audio":
            return "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500";
        case "pdf":
            return "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500";
        case "image":
            return "bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-500";
        case "spreadsheet":
            return "bg-green-700 text-white hover:bg-green-800 focus-visible:ring-green-500";
        case "document":
            return "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500";
        case "presentation":
            return "bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-500";
        default:
            return "bg-[#FF922B] text-white hover:brightness-105 focus-visible:ring-[#74C0FC]";
    }
}

export function franchiseResourceIconWrapClasses(kind: FranchiseResourceFileKind): string {
    switch (kind) {
        case "archive":
            return "bg-amber-100 text-amber-800";
        case "video":
            return "bg-violet-100 text-violet-800";
        case "audio":
            return "bg-emerald-100 text-emerald-800";
        case "pdf":
            return "bg-rose-100 text-rose-800";
        case "image":
            return "bg-sky-100 text-sky-800";
        case "spreadsheet":
            return "bg-green-100 text-green-800";
        case "document":
            return "bg-blue-100 text-blue-800";
        case "presentation":
            return "bg-orange-100 text-orange-800";
        default:
            return "bg-orange-50 text-orange-800";
    }
}

export const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
export const labelClass = "block text-xs font-medium text-slate-600 mb-1";

export const NAV_CLASS_OPTIONS = [
    { value: "nav-link1", label: "Orange bubble", swatch: "from-[#ECB248] to-[#DD6705]" },
    { value: "nav-link2", label: "Green bubble", swatch: "from-[#B0CD67] to-[#789F35]" },
    { value: "nav-link3", label: "Red bubble", swatch: "from-[#D36655] to-[#BD2B13]" },
];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    if (typeof createImageBitmap === "function") {
        const bmp = await createImageBitmap(file);
        const dims = { width: bmp.width, height: bmp.height };
        bmp.close?.();
        return dims;
    }
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new window.Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Could not read image"));
            el.src = url;
        });
        return { width: img.naturalWidth, height: img.naturalHeight };
    } finally {
        URL.revokeObjectURL(url);
    }
}

export function colorForMethodologyClass(cls: string): string {
    if (cls === "nav-item2" || cls === "nav-item5") return "#94b64f";
    if (cls === "nav-item3" || cls === "nav-item6") return "#c94a36";
    return "#e6952e";
}

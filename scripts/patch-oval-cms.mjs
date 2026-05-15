import fs from "fs";

const p = "app/dashboard/admin/home-content/page.tsx";
let s = fs.readFileSync(p, "utf8");

const m = s.match(
    /<Section title="2b\. Franchise advantage videos[\s\S]*?<\/Section>\s*<Section title="2c\. Franchise advantage photos[\s\S]*?<\/Section>\s*/,
);
if (!m) {
    console.error("regex fail");
    process.exit(1);
}

const T = "div";
const repl = `<Section title="2b. Oval blob — video (top right)" defaultOpen>
                        <${T} className="rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-slate-700">
                            <strong>On the homepage:</strong> Top orange oval — thumbnail before play; video inside blob. Delete slide removes it. Save changes when done.
                        </${T}>
                        {data.franchise_advantage_videos.map((row, i) => (
                            <${T} key={i} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white shadow-sm">
                                <${T} className="flex flex-wrap items-start justify-between gap-3">
                                    <${T} className="flex items-center gap-2">
                                        <Film className="h-5 w-5 text-orange-500" />
                                        <span className="text-sm font-semibold text-slate-900">Video slide {i + 1}</span>
                                    </${T}>
                                    <button type="button" onClick={() => removeFranchiseVideo(i)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete slide
                                    </button>
                                </${T}>
                                <${T} className="flex flex-wrap gap-4">
                                    <${T} className="min-w-0 flex-1 space-y-3">
                                        <${T}>
                                            <label className={labelClass}>Thumbnail (poster)</label>
                                            <${T} className="flex flex-wrap items-center gap-2 mt-1">
                                                <input className={inputClass} value={row.poster} onChange={(e) => updateFranchiseVideo(i, { poster: e.target.value })} placeholder="/media/…" />
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                    <input type="file" accept="image/*" className="hidden" disabled={uploadingSpotlight === i} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadFranchiseVideoPoster(i, f); }} />
                                                    <Upload className="h-3.5 w-3.5" /> {uploadingSpotlight === i ? "Uploading…" : "Upload"}
                                                </label>
                                                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateFranchiseVideo(i, { poster: "" })}>Clear</button>
                                            </${T}>
                                        </${T}>
                                        <${T}>
                                            <label className={labelClass}>Video URL (MediaDelivery / YouTube / MP4)</label>
                                            <input className={inputClass} placeholder="https://iframe.mediadelivery.net/embed/…" value={row.src} onChange={(e) => updateFranchiseVideo(i, { src: e.target.value })} />
                                            <${T} className="mt-2 flex flex-wrap gap-2">
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                    <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" disabled={uploadingFranchiseVideo === i} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadFranchiseVideoFile(i, f); }} />
                                                    <Film className="h-3.5 w-3.5" /> {uploadingFranchiseVideo === i ? "Uploading…" : "Upload MP4"}
                                                </label>
                                                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateFranchiseVideo(i, { src: "" })}>Clear video</button>
                                            </${T}>
                                        </${T}>
                                        <${T}>
                                            <label className={labelClass}>Alt text</label>
                                            <input className={inputClass} value={row.alt ?? ""} onChange={(e) => updateFranchiseVideo(i, { alt: e.target.value })} />
                                        </${T}>
                                    </${T}>
                                    {(row.poster || "").trim() ? <BlobMediaPreview src={row.poster} alt={row.alt || \`Video \${i + 1}\`} /> : null}
                                </${T}>
                            </${T}>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addFranchiseVideo} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add video slide</Button>
                    </Section>

                    <Section title="2c. Oval blob — promotion photos (below video)" defaultOpen>
                        <${T} className="rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2 text-xs text-slate-700">
                            <strong>On the homepage:</strong> Lower oval carousel (NEP, brochure, promos).
                        </${T}>
                        {(data.franchise_advantage_photos ?? []).map((row, i) => (
                            <${T} key={i} className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white shadow-sm">
                                <${T} className="flex flex-wrap items-start justify-between gap-3">
                                    <${T} className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-orange-500" />
                                        <span className="text-sm font-semibold text-slate-900">Photo slide {i + 1}</span>
                                    </${T}>
                                    <button type="button" onClick={() => removeFranchisePhoto(i)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100">
                                        <Trash2 className="h-3.5 w-3.5" /> Delete slide
                                    </button>
                                </${T}>
                                <${T} className="flex flex-wrap gap-4">
                                    <${T} className="min-w-0 flex-1 space-y-3">
                                        <${T}>
                                            <label className={labelClass}>Image URL</label>
                                            <${T} className="flex flex-wrap items-center gap-2 mt-1">
                                                <input className={inputClass} value={row.src} onChange={(e) => updateFranchisePhoto(i, { src: e.target.value })} placeholder="/franchise-gallery/…" />
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                                    <input type="file" accept="image/*" className="hidden" disabled={uploadingFranchisePhoto === i} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadFranchisePhoto(i, f); }} />
                                                    <Upload className="h-3.5 w-3.5" /> {uploadingFranchisePhoto === i ? "Uploading…" : "Upload"}
                                                </label>
                                                <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" onClick={() => updateFranchisePhoto(i, { src: "" })}>Clear</button>
                                            </${T}>
                                        </${T}>
                                        <${T}>
                                            <label className={labelClass}>Alt text</label>
                                            <input className={inputClass} value={row.alt ?? ""} onChange={(e) => updateFranchisePhoto(i, { alt: e.target.value })} />
                                        </${T}>
                                    </${T}>
                                    {(row.src || "").trim() ? <BlobMediaPreview src={row.src} alt={row.alt || \`Photo \${i + 1}\`} /> : null}
                                </${T}>
                            </${T}>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addFranchisePhoto} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add photo slide</Button>
                        <${T} className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                            <label className={labelClass}>News box — when no updates</label>
                            <input className={inputClass} value={data.updates_empty_message ?? ""} onChange={(e) => setData({ ...data, updates_empty_message: e.target.value })} />
                            <p className="text-xs text-slate-500">Live news: <Link href="/dashboard/admin/updates" className="text-orange-600 underline">Admin → Updates</Link></p>
                        </${T}>
                    </Section>

                    `;

s = s.replace(m[0], repl);
fs.writeFileSync(p, s);
console.log("patched oval cms");

'use client';

import { ImageIcon, Link2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import { resolveCmsMediaUrl } from '@/lib/api-client';

const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100';
const labelClass = 'block text-xs font-medium text-slate-600 mb-1';

export type EmbedVideoDraftPanelProps = {
    draftTitle: string;
    onDraftTitleChange: (value: string) => void;
    draftThumbnail: string;
    onDraftThumbnailChange: (value: string) => void;
    draftEmbedInput: string;
    onDraftEmbedInputChange: (value: string) => void;
    onSubmit: () => void;
    submitLabel?: string;
    uploadingThumbnail?: boolean;
    onThumbnailFileSelect?: (file: File) => void | Promise<void>;
    className?: string;
};

/** Admin: add iframe / YouTube / MediaDelivery video with optional thumbnail poster. */
export function EmbedVideoDraftPanel({
    draftTitle,
    onDraftTitleChange,
    draftThumbnail,
    onDraftThumbnailChange,
    draftEmbedInput,
    onDraftEmbedInputChange,
    onSubmit,
    submitLabel = 'Add embedded video',
    uploadingThumbnail = false,
    onThumbnailFileSelect,
    className = '',
}: EmbedVideoDraftPanelProps) {
    return (
        <div className={`rounded-xl border border-blue-100 bg-blue-50/80 p-4 space-y-3 ${className}`.trim()}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Link2 className="h-4 w-4 text-blue-600" aria-hidden />
                Add iframe / YouTube / MediaDelivery video
            </h3>
            <input
                className={inputClass}
                value={draftTitle}
                onChange={(e) => onDraftTitleChange(e.target.value)}
                placeholder="Video title (optional)"
            />
            <div>
                <label className={`${labelClass} flex items-center gap-1.5`}>
                    <ImageIcon className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                    Thumbnail photo (optional)
                </label>
                <div className="mt-1 flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <input
                                className={inputClass}
                                value={draftThumbnail}
                                onChange={(e) => onDraftThumbnailChange(e.target.value)}
                                placeholder="/media/… or upload a JPG/PNG"
                            />
                            {onThumbnailFileSelect ? (
                                <label
                                    className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                        uploadingThumbnail
                                            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingThumbnail}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = '';
                                            if (file) void onThumbnailFileSelect(file);
                                        }}
                                    />
                                    <Upload className="mr-2 h-4 w-4" aria-hidden />
                                    {uploadingThumbnail ? 'Uploading…' : 'Upload photo'}
                                </label>
                            ) : null}
                        </div>
                        <p className="text-[11px] text-slate-500">
                            Max 5MB. Shown on the slider / gallery before the video plays.
                        </p>
                    </div>
                    {draftThumbnail.trim() ? (
                        <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg border-2 border-blue-200 bg-slate-100 shadow-inner">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resolveCmsMediaUrl(draftThumbnail) || draftThumbnail}
                                alt="Thumbnail preview"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
            <textarea
                className={`${inputClass} min-h-[80px] font-mono text-xs`}
                value={draftEmbedInput}
                onChange={(e) => onDraftEmbedInputChange(e.target.value)}
                placeholder='Paste embed URL or full <iframe src="…" …> code'
            />
            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={onSubmit}>
                {submitLabel}
            </Button>
        </div>
    );
}

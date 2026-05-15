"use client";

import Modal from "@/components/ui/Modal";
import { resolveVirtualTourEmbedUrl } from "@/lib/virtual-tour";

type VirtualTourModalProps = {
    isOpen: boolean;
    onClose: () => void;
    /** CMS / marketing asset link; falls back to default Street View embed. */
    embedUrl?: string | null;
};

export default function VirtualTourModal({ isOpen, onClose, embedUrl }: VirtualTourModalProps) {
    const src = resolveVirtualTourEmbedUrl(embedUrl);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Virtual Tour" size="xl">
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
                {isOpen ? (
                    <iframe
                        src={src}
                        title="TIME Kids virtual tour"
                        className="block h-[min(72vh,640px)] w-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : null}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
                Use the controls inside the tour to look around. Close this window when you are done.
            </p>
        </Modal>
    );
}

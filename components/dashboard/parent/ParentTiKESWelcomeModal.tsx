"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "time4kids-parent-tikes-important-message-dismissed";

export function ParentTiKESWelcomeModal() {
    const [open, setOpen] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            if (sessionStorage.getItem(STORAGE_KEY)) return;
        } catch {
            /* ignore private mode / quota */
        }
        setOpen(true);
    }, []);

    useEffect(() => {
        if (!open) return;
        const t = window.setTimeout(() => closeButtonRef.current?.focus(), 50);
        return () => window.clearTimeout(t);
    }, [open]);

    const handleClose = useCallback(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, "1");
        } catch {
            /* ignore */
        }
        setOpen(false);
    }, []);

    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        const prevPosition = document.body.style.position;
        const prevWidth = document.body.style.width;
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.position = prevPosition;
            document.body.style.width = prevWidth;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, handleClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[10020] flex items-center justify-center p-4 animate-fade-in motion-reduce:animate-none"
            role="presentation"
        >
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm motion-reduce:backdrop-blur-none"
                aria-label="Dismiss overlay"
                onClick={handleClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="parent-tikes-modal-title"
                className="animate-scale-in motion-reduce:animate-none relative z-[10021] flex max-h-[min(85vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="parent-tikes-modal-title"
                    className="shrink-0 border-b border-slate-100 bg-white px-6 py-4 text-center text-xl font-bold tracking-tight text-[#1e3a5f]"
                >
                    Important Message
                </h2>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 text-sm leading-relaxed text-slate-800 sm:text-[0.9375rem] sm:leading-relaxed">
                    <p className="mb-3 font-medium">Dear Parent,</p>
                    <p className="mb-3">
                        We have introduced a new computerized enrolment management system called{" "}
                        <strong>TiKES</strong> across all <strong>T.I.M.E. Kids</strong> centres. Manual handwritten
                        receipts are being replaced by printed receipts on pre-printed stationery.
                    </p>
                    <p className="mb-3">
                        You can view the format of the new receipt here:{" "}
                        <a
                            href="https://tikes.in/receipt.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-700 underline decoration-blue-400 underline-offset-2 hover:text-blue-900"
                        >
                            https://tikes.in/receipt.html
                        </a>
                    </p>
                    <p className="mb-2 font-semibold underline decoration-slate-700 underline-offset-2">Important point:</p>
                    <p className="mb-3">
                        For every payment you make, you will receive an <strong>SMS from &quot;MDTIME&quot;</strong> on your
                        registered mobile number. If you <strong>do not</strong> receive this SMS, the receipt was not
                        officially recorded and your payment is <strong>not</strong> accounted for in the system — even if
                        a slip was printed (for example due to printer failure).
                    </p>
                    <p className="mb-3">
                        If you do not receive the SMS after a payment, please write to us at{" "}
                        <a
                            href="mailto:admintikes@timekidspreschools.com"
                            className="font-medium text-blue-700 underline decoration-blue-400 underline-offset-2 hover:text-blue-900"
                        >
                            admintikes@timekidspreschools.com
                        </a>
                        .
                    </p>
                    <p className="mb-3 font-semibold italic text-slate-900">
                        Kindly ask your centre for a receipt for the complete payment made by you.
                    </p>
                    <p className="mb-3">
                        On the physical receipt, the numbers in <strong>BOX 1</strong> and <strong>BOX 2</strong> (top
                        right of the receipt) <strong>must match</strong>. If they do not, email{" "}
                        <a
                            href="mailto:admintikes@timekidspreschools.com"
                            className="font-medium text-blue-700 underline decoration-blue-400 underline-offset-2 hover:text-blue-900"
                        >
                            admintikes@timekidspreschools.com
                        </a>{" "}
                        with your child&apos;s name, ID, fee paid, and centre details.
                    </p>
                    <p className="text-slate-700">
                        Regards,
                        <br />
                        <span className="font-semibold">T.I.M.E. Kids Team</span>
                    </p>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={handleClose}
                        className="mx-auto block rounded-lg border border-slate-300 bg-white px-8 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a5f]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

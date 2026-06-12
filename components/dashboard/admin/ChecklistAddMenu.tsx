"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";

export type ChecklistAddOption<K extends string> = {
    kind: K;
    label: string;
};

/**
 * “+ Add” for admin checklists — uses a modal popup (not a dropdown) so menus are not clipped by `overflow-hidden`.
 */
export function ChecklistAddMenu<K extends string>({
    options,
    onPick,
    sectionTitle,
}: {
    options: ChecklistAddOption<K>[];
    onPick: (kind: K) => void;
    sectionTitle?: string;
}) {
    const [open, setOpen] = useState(false);

    if (options.length === 0) return null;

    const handleAddClick = () => {
        if (options.length === 1) {
            onPick(options[0].kind);
            return;
        }
        setOpen(true);
    };

    const handlePick = (kind: K) => {
        setOpen(false);
        // Defer so the picker modal unmounts before the parent name/upload modal opens.
        window.setTimeout(() => onPick(kind), 0);
    };

    return (
        <>
            <button
                type="button"
                onClick={handleAddClick}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-orange-300 bg-white px-2.5 py-1 text-xs font-semibold text-orange-900 shadow-sm hover:bg-orange-50"
                aria-haspopup={options.length > 1 ? "dialog" : undefined}
                aria-expanded={options.length > 1 ? open : undefined}
            >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add
                {options.length > 1 ? (
                    <ChevronDown className="h-3 w-3 opacity-70" aria-hidden />
                ) : null}
            </button>
            {options.length > 1 ? (
                <Modal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    title={sectionTitle ? `Add — ${sectionTitle}` : "Add"}
                    size="sm"
                >
                    <p className="mb-3 text-sm text-slate-600">Choose what to add:</p>
                    <ul className="flex flex-col gap-2" role="menu">
                        {options.map((opt) => (
                            <li key={opt.kind} role="none">
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-orange-300 hover:bg-orange-50"
                                    onClick={() => handlePick(opt.kind)}
                                >
                                    {opt.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </Modal>
            ) : null}
        </>
    );
}

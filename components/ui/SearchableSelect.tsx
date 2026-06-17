"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";

export type SearchableSelectOption = {
    value: string;
    label: string;
};

type Props = {
    value: string;
    onChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    /** Render the menu in a portal (avoids clipping inside modals / overflow containers). */
    menuPortal?: boolean;
};

export function SearchableSelect({
    value,
    onChange,
    options,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    disabled = false,
    loading = false,
    emptyMessage = "No matches.",
    className = "",
    menuPortal = false,
}: Props) {
    const listboxId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number } | null>(null);

    const selected = options.find((opt) => opt.value === value);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((opt) => opt.label.toLowerCase().includes(q));
    }, [options, query]);

    const updateMenuPosition = useCallback(() => {
        if (!rootRef.current) return;
        const rect = rootRef.current.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }, []);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node;
            if (rootRef.current?.contains(target)) return;
            if (menuRef.current?.contains(target)) return;
            setOpen(false);
            setQuery("");
        };
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    useEffect(() => {
        if (!open || !menuPortal) return;
        updateMenuPosition();
        const onReposition = () => updateMenuPosition();
        window.addEventListener("scroll", onReposition, true);
        window.addEventListener("resize", onReposition);
        return () => {
            window.removeEventListener("scroll", onReposition, true);
            window.removeEventListener("resize", onReposition);
        };
    }, [open, menuPortal, updateMenuPosition]);

    useEffect(() => {
        if (open) {
            window.setTimeout(() => searchRef.current?.focus(), 0);
        } else {
            setQuery("");
        }
    }, [open]);

    const pick = (next: string) => {
        onChange(next);
        setOpen(false);
        setQuery("");
    };

    const menuInner = (
        <>
            <div className="border-b border-[#F3F4F6] p-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full rounded-lg border border-[#E5E7EB] py-2 pl-8 pr-2 text-sm outline-none focus:border-[#FF922B]"
                    />
                </div>
            </div>
            <ul id={listboxId} role="listbox" className="max-h-52 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-[#6B7280]">{emptyMessage}</li>
                ) : (
                    filtered.map((opt) => {
                        const active = opt.value === value;
                        return (
                            <li key={opt.value} role="option" aria-selected={active}>
                                <button
                                    type="button"
                                    onClick={() => pick(opt.value)}
                                    className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#FFF7ED] ${
                                        active ? "bg-[#FFF4CC] font-medium text-[#111827]" : "text-[#374151]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            </li>
                        );
                    })
                )}
            </ul>
        </>
    );

    const menuPanel = (
        <div
            ref={menuRef}
            className={
                menuPortal
                    ? "overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
                    : "absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
            }
            style={
                menuPortal && menuPosition
                    ? {
                          position: "fixed",
                          top: menuPosition.top,
                          left: menuPosition.left,
                          width: menuPosition.width,
                          zIndex: 10150,
                      }
                    : undefined
            }
        >
            {menuInner}
        </div>
    );

    return (
        <div ref={rootRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled || loading}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={() => {
                    if (disabled || loading) return;
                    if (!open && menuPortal) updateMenuPosition();
                    setOpen((prev) => !prev);
                }}
                className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left text-sm disabled:bg-slate-50 disabled:text-[#9CA3AF]"
            >
                <span className={`truncate ${selected ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                    {loading ? "Loading centres…" : selected?.label || placeholder}
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[#6B7280] transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open
                ? menuPortal && typeof document !== "undefined"
                    ? createPortal(menuPanel, document.body)
                    : menuPanel
                : null}
        </div>
    );
}

"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { ChecklistFileUploadField } from "@/components/dashboard/admin/ChecklistFileUploadField";
import { CmsPublishTargetFields } from "@/components/dashboard/admin/CmsPublishTargetFields";
import { ParentDocumentCmsLayout, type ParentDocumentSentRow } from "@/components/dashboard/ParentDocumentCmsLayout";
import HolidayEntriesEditor from "@/components/dashboard/HolidayEntriesEditor";
import HolidayEntriesReadOnly from "@/components/dashboard/HolidayEntriesReadOnly";
import type { AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";
import {
    DEFAULT_HOLIDAY_ACADEMIC_YEAR,
    PARENT_DOCUMENT_STATES,
    parentDocumentStateLabel,
    resolveParentDocumentStateCode,
} from "@/config/parent-document-categories";
import { CENTRE_PROGRAM_LABELS } from "@/config/centre-program-cards-defaults";
import {
    emptyHolidayEntry,
    parseHolidayEntries,
    requireHolidayEntries,
    serializeHolidayEntries,
    validateHolidayEntries,
    type HolidayEntry,
} from "@/config/holiday-entries";
import {
    emptyCmsPublishTarget,
    holidayCityDropdownOptions,
    parentDocumentTargetPayload,
    publishTargetFromDoc,
    publishTargetSummary,
    validateCmsPublishTarget,
    type CmsPublishTargetForm,
} from "@/lib/cms-publish-target";
import { jsonHeaders } from "@/lib/api-client";

const todayLocal = () => new Date().toISOString().slice(0, 10);

type AuthFetchFn = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
type ShowToastFn = (message: string, type?: "success" | "error" | "info") => void;

type HolidayDocRow = {
    id: number;
    title: string;
    state?: string;
    state_display?: string;
    academic_year?: string;
    franchise?: number | null;
    franchise_name?: string | null;
    file?: string;
    holiday_entries?: HolidayEntry[] | unknown;
    created_at?: string;
    updated_at?: string;
    publish_scope?: string;
    target_states?: string[];
    target_cities?: string[];
    target_franchise_ids?: number[];
    target_class_names?: string[];
};

function normalizeList<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: unknown[] }).results)) {
        return (data as { results: T[] }).results;
    }
    return [];
}

type Props = {
    mode: "admin" | "franchise";
    authFetch: AuthFetchFn;
    showToast: ShowToastFn;
    franchises?: AdminFranchise[];
    /** Pre-built city list for admin holiday rows (all centres). */
    holidayCityOptions?: string[];
    /** Franchise profile state text — used to lock centre holiday uploads to one state. */
    centreStateFromProfile?: string;
    /** Franchise profile city — prefilled on centre holiday rows. */
    centreCityFromProfile?: string;
};

export function ParentHolidayCmsPanel({
    mode,
    authFetch,
    showToast,
    franchises = [],
    holidayCityOptions: holidayCityOptionsProp = [],
    centreStateFromProfile = "",
    centreCityFromProfile = "",
}: Props) {
    const isAdmin = mode === "admin";
    const centreCity = centreCityFromProfile.trim();
    const centreStateCode = useMemo(
        () => (isAdmin ? null : resolveParentDocumentStateCode(centreStateFromProfile)),
        [isAdmin, centreStateFromProfile],
    );
    const centreStateLabel = centreStateCode
        ? parentDocumentStateLabel(centreStateCode)
        : centreStateFromProfile.trim() || "";
    const listBase = isAdmin ? "/documents/admin/parent-documents/" : "/documents/franchise/parent-documents/";
    const detailBase = listBase;

    const [rows, setRows] = useState<HolidayDocRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [trackDate, setTrackDate] = useState(todayLocal);
    const [filterState, setFilterState] = useState("AP");
    const [state, setState] = useState("AP");
    const [pdf, setPdf] = useState<File | null>(null);
    const [pdfLabel, setPdfLabel] = useState("");
    const [entries, setEntries] = useState<HolidayEntry[]>([emptyHolidayEntry(centreCity)]);
    const [publishTarget, setPublishTarget] = useState<CmsPublishTargetForm>(emptyCmsPublishTarget());
    const [editModal, setEditModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [editState, setEditState] = useState("AP");
    const [editPdf, setEditPdf] = useState<File | null>(null);
    const [editPdfLabel, setEditPdfLabel] = useState("");
    const [editEntries, setEditEntries] = useState<HolidayEntry[]>([emptyHolidayEntry(centreCity)]);
    const [editTarget, setEditTarget] = useState<CmsPublishTargetForm>(emptyCmsPublishTarget());
    const [editSaving, setEditSaving] = useState(false);
    const [fetchedLocationRows, setFetchedLocationRows] = useState<
        { city_name?: unknown; city?: unknown }[]
    >([]);
    const [viewModal, setViewModal] = useState<{ isOpen: boolean; row: HolidayDocRow | null }>({
        isOpen: false,
        row: null,
    });

    const classOptions = useMemo(
        () => CENTRE_PROGRAM_LABELS.map((p) => ({ value: p.label, label: p.label })),
        [],
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ manage: "holidays" });
            const stateFilter = isAdmin ? filterState : centreStateCode;
            if (stateFilter) params.set("state", stateFilter);
            if (isAdmin) params.set("date", trackDate);
            const data = await authFetch<unknown>(`${listBase}?${params.toString()}`);
            setRows(normalizeList<HolidayDocRow>(data));
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [authFetch, listBase, filterState, isAdmin, centreStateCode, trackDate]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (!isAdmin) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<
                    | { city_name?: string; city?: string }[]
                    | { results?: { city_name?: string; city?: string }[] }
                >("/franchises/public/locations/");
                const items = Array.isArray(data) ? data : data?.results ?? [];
                if (!cancelled) setFetchedLocationRows(items);
            } catch {
                if (!cancelled) setFetchedLocationRows([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAdmin, authFetch]);

    const stateLabel = (code: string) => PARENT_DOCUMENT_STATES.find((s) => s.value === code)?.label || code;

    const effectiveHolidayState = isAdmin ? state : centreStateCode || "";

    const holidayCityOptions = useMemo(() => {
        if (!isAdmin) return [];
        if (holidayCityOptionsProp.length > 0) return holidayCityOptionsProp;
        return holidayCityDropdownOptions(franchises, fetchedLocationRows);
    }, [isAdmin, holidayCityOptionsProp, franchises, fetchedLocationRows]);

    const holidayEditorProps = isAdmin
        ? { cityOptions: holidayCityOptions }
        : { defaultCity: centreCity, lockCity: Boolean(centreCity) };

    const editHolidayEditorProps = isAdmin
        ? { cityOptions: holidayCityOptions }
        : { defaultCity: centreCity, lockCity: Boolean(centreCity) };

    const withCentreCity = (rows: HolidayEntry[]): HolidayEntry[] => {
        if (!centreCity) return rows;
        return rows.map((row) => ({ ...row, city: row.city.trim() || centreCity }));
    };

    const sentRows: ParentDocumentSentRow[] = useMemo(
        () =>
            rows.map((row) => {
                const manualCount = parseHolidayEntries(row.holiday_entries).length;
                const hasPdf = Boolean((row.file || "").trim());
                const source =
                    row.franchise == null
                        ? isAdmin
                            ? publishTargetSummary(publishTargetFromDoc(row), franchises)
                            : "Head office"
                        : isAdmin
                          ? row.franchise_name || "One centre"
                          : "Your centre";
                const parts = [row.academic_year || DEFAULT_HOLIDAY_ACADEMIC_YEAR, source];
                if (hasPdf) parts.push("PDF");
                if (manualCount > 0) parts.push(`${manualCount} date(s)`);
                return {
                    id: row.id,
                    title: row.title || `${stateLabel(row.state || filterState)} Holiday List`,
                    badge: row.state_display || stateLabel(row.state || filterState),
                    meta: parts.join(" · "),
                    published_at: row.updated_at || row.created_at,
                };
            }),
        [rows, isAdmin, franchises, filterState, centreStateCode],
    );

    const headOfficeRows = useMemo(
        () => sentRows.filter((row) => rows.find((r) => r.id === row.id)?.franchise == null),
        [rows, sentRows],
    );

    const centreRows = useMemo(() => {
        const base = sentRows.filter((row) => rows.find((r) => r.id === row.id)?.franchise != null);
        return base.filter((row) => (row.published_at || "").slice(0, 10) === trackDate);
    }, [rows, sentRows, trackDate]);

    const validateHolidayForm = (
        holidayState: string,
        pdfFile: File | null,
        holidayEntries: HolidayEntry[],
        editing: HolidayDocRow | null,
        target: CmsPublishTargetForm,
        label = "",
    ): string | null => {
        const serialized = serializeHolidayEntries(holidayEntries);
        const hasExistingPdf = Boolean(editing?.file);
        if (!pdfFile && !hasExistingPdf && serialized.length === 0) {
            return "Upload a PDF or add at least one holiday date.";
        }
        if (!isAdmin && (pdfFile || hasExistingPdf) && !label.trim()) {
            return "Enter a label for the PDF so parents know what it is.";
        }
        if (pdfFile && serialized.length > 0) {
            const holidayErr = validateHolidayEntries(holidayEntries);
            if (holidayErr) return holidayErr;
        }
        if (!pdfFile && !hasExistingPdf) {
            const holidayErr = requireHolidayEntries(holidayEntries);
            if (holidayErr) return holidayErr;
        }
        if (!holidayState) {
            return isAdmin ? "Select a state." : "Your centre profile does not have a state set. Update centre profile first.";
        }
        if (isAdmin) {
            const targetErr = validateCmsPublishTarget(target);
            if (targetErr) return targetErr;
        }
        return null;
    };

    const centreHolidayTitle = (holidayState: string, label: string) => {
        const trimmed = label.trim();
        if (trimmed) return trimmed;
        const stateName = stateLabel(holidayState);
        return `${stateName} Holiday List (Centre)`;
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const err = validateHolidayForm(
            effectiveHolidayState,
            pdf,
            entries,
            null,
            publishTarget,
            pdfLabel,
        );
        if (err) {
            showToast(err, "error");
            return;
        }
        setSubmitting(true);
        try {
            const serialized = serializeHolidayEntries(entries);
            const title = isAdmin
                ? `${stateLabel(effectiveHolidayState)} Holiday List`
                : centreHolidayTitle(effectiveHolidayState, pdfLabel);
            const targetPayload = isAdmin ? parentDocumentTargetPayload(publishTarget) : null;
            const franchise = isAdmin ? targetPayload?.franchise ?? null : undefined;

            if (pdf) {
                const fd = new FormData();
                fd.append("category", "HOLIDAY_LISTS");
                fd.append("title", title);
                fd.append("state", effectiveHolidayState);
                fd.append("academic_year", DEFAULT_HOLIDAY_ACADEMIC_YEAR);
                fd.append("description", "");
                fd.append("order", "0");
                fd.append("is_active", "true");
                if (isAdmin && targetPayload) {
                    fd.append("publish_scope", targetPayload.publish_scope);
                    fd.append("target_states", JSON.stringify(targetPayload.target_states));
                    fd.append("target_cities", JSON.stringify(targetPayload.target_cities));
                    fd.append("target_franchise_ids", JSON.stringify(targetPayload.target_franchise_ids));
                    fd.append("target_class_names", JSON.stringify(targetPayload.target_class_names));
                    if (franchise != null) fd.append("franchise", String(franchise));
                }
                fd.append("file", pdf);
                if (serialized.length > 0) fd.append("holiday_entries", JSON.stringify(serialized));
                await authFetch(listBase, { method: "POST", body: fd });
            } else {
                await authFetch(listBase, {
                    method: "POST",
                    headers: jsonHeaders(),
                    body: JSON.stringify({
                        category: "HOLIDAY_LISTS",
                        title,
                        state: effectiveHolidayState,
                        academic_year: DEFAULT_HOLIDAY_ACADEMIC_YEAR,
                        holiday_entries: serialized,
                        ...(targetPayload || {}),
                    }),
                });
            }
            setEntries([emptyHolidayEntry(centreCity)]);
            setPdf(null);
            setPdfLabel("");
            setPublishTarget(emptyCmsPublishTarget());
            setTrackDate(todayLocal());
            showToast("Holiday list saved for parents.", "success");
            await load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Save failed.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const openView = (row: ParentDocumentSentRow) => {
        const full = rows.find((r) => r.id === row.id);
        if (!full) return;
        setViewModal({ isOpen: true, row: full });
    };

    const closeView = () => setViewModal({ isOpen: false, row: null });

    const openEdit = (row: ParentDocumentSentRow) => {
        const full = rows.find((r) => r.id === row.id);
        if (!full) return;
        if (!isAdmin && full.franchise == null) {
            showToast("Head-office holiday lists cannot be edited here.", "info");
            return;
        }
        const parsed = parseHolidayEntries(full.holiday_entries);
        setEditState(full.state || effectiveHolidayState || filterState);
        setEditPdf(null);
        setEditPdfLabel(full.title || "");
        setEditEntries(withCentreCity(parsed.length > 0 ? parsed : [emptyHolidayEntry(centreCity)]));
        setEditTarget(isAdmin ? publishTargetFromDoc(full) : emptyCmsPublishTarget());
        setEditModal({ isOpen: true, id: full.id });
    };

    const closeEdit = () => {
        setEditModal({ isOpen: false, id: null });
        setEditPdf(null);
        setEditPdfLabel("");
        setEditEntries([emptyHolidayEntry(centreCity)]);
    };

    const saveEdit = async (e: FormEvent) => {
        e.preventDefault();
        if (!editModal.id) return;
        const existing = rows.find((r) => r.id === editModal.id);
        const err = validateHolidayForm(
            isAdmin ? editState : centreStateCode || editState,
            editPdf,
            editEntries,
            existing || null,
            editTarget,
            editPdfLabel,
        );
        if (err) {
            showToast(err, "error");
            return;
        }
        setEditSaving(true);
        try {
            const serialized = serializeHolidayEntries(editEntries);
            const holidayState = isAdmin ? editState : centreStateCode || editState;
            const title = isAdmin
                ? `${stateLabel(editState)} Holiday List`
                : centreHolidayTitle(holidayState, editPdfLabel);
            const targetPayload = isAdmin ? parentDocumentTargetPayload(editTarget) : null;
            await authFetch(`${detailBase}${editModal.id}/`, {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    title,
                    state: editState,
                    academic_year: DEFAULT_HOLIDAY_ACADEMIC_YEAR,
                    holiday_entries: serialized,
                    ...(targetPayload || {}),
                }),
            });
            if (editPdf) {
                const fd = new FormData();
                fd.append("file", editPdf);
                await authFetch(`${detailBase}${editModal.id}/`, { method: "PATCH", body: fd });
            }
            closeEdit();
            setTrackDate(todayLocal());
            showToast("Holiday list updated.", "success");
            await load();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Update failed.", "error");
        } finally {
            setEditSaving(false);
        }
    };

    const remove = async (row: ParentDocumentSentRow) => {
        const full = rows.find((r) => r.id === row.id);
        if (!full) return;
        if (!isAdmin && full.franchise == null) {
            showToast("Head-office holiday lists cannot be deleted here.", "error");
            return;
        }
        if (!window.confirm("Delete this holiday list?")) return;
        try {
            await authFetch(`${detailBase}${full.id}/`, { method: "DELETE" });
            if (editModal.id === full.id) closeEdit();
            showToast("Deleted.", "success");
            await load();
        } catch {
            showToast("Delete failed.", "error");
        }
    };

    const franchiseUploadFields = (
        <>
            {centreStateCode ? (
                <p className="text-xs text-[#4B5563] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                    <span className="font-semibold text-[#111827]">Your centre state:</span> {centreStateLabel}
                    {centreCity ? (
                        <>
                            {" "}
                            · <span className="font-semibold text-[#111827]">City:</span> {centreCity}
                        </>
                    ) : null}
                </p>
            ) : (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    Your centre profile does not have a state set. Update it under centre profile before adding
                    holidays.
                </p>
            )}
            {!centreCity ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    Your centre profile does not have a city set. Update it under centre profile so holiday rows
                    prefill the city automatically.
                </p>
            ) : null}
            <label className="block text-xs font-semibold text-[#4B5563]">
                PDF label
                <input
                    type="text"
                    value={pdfLabel}
                    onChange={(e) => setPdfLabel(e.target.value)}
                    placeholder="e.g. Centre summer break 2026"
                    maxLength={255}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                />
                <span className="mt-1 block font-normal text-[#6B7280]">
                    Required when you upload a PDF — parents see this name when downloading it.
                </span>
            </label>
            <ChecklistFileUploadField
                id="holiday-pdf-upload"
                accept=".pdf,application/pdf"
                hint="Optional centre PDF — add extra dates below"
                required={false}
                currentName={pdf?.name ?? null}
                onChange={setPdf}
            />
            <div className="space-y-2">
                <p className="text-xs font-semibold text-[#4B5563]">
                    Add centre-only holidays (merged with head-office list for parents)
                </p>
                <HolidayEntriesEditor rows={entries} onChange={setEntries} {...holidayEditorProps} />
            </div>
        </>
    );

    const adminUploadFields = (
        <>
            <CmsPublishTargetFields
                franchises={franchises}
                value={publishTarget}
                onChange={setPublishTarget}
                showClassTarget
                classOptions={classOptions}
            />
            <label className="block text-xs font-semibold text-[#4B5563]">
                State
                <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                >
                    {PARENT_DOCUMENT_STATES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </label>
            <ChecklistFileUploadField
                id="holiday-pdf-upload"
                accept=".pdf,application/pdf"
                hint="Holiday PDF — add dates below if you skip the file"
                required={false}
                currentName={pdf?.name ?? null}
                onChange={setPdf}
            />
            <div className="space-y-2">
                <p className="text-xs font-semibold text-[#4B5563]">
                    Add holidays manually (parents see PDF and/or this table)
                </p>
                <HolidayEntriesEditor rows={entries} onChange={setEntries} {...holidayEditorProps} />
            </div>
        </>
    );

    if (!isAdmin) {
        return (
            <>
                <div className="grid gap-4 lg:grid-cols-2 lg:items-start max-w-5xl">
                    <form onSubmit={submit} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-[#111827]">Add centre holiday list</h3>
                            <p className="text-xs text-[#6B7280]">
                                Head-office holidays are managed by admin CMS. Add your centre&apos;s own PDF and/or
                                extra dates here — parents see both merged together.
                            </p>
                        </div>
                        {franchiseUploadFields}
                        <Button
                            type="submit"
                            disabled={submitting || !centreStateCode}
                            className="bg-[#FF922B] text-white w-full sm:w-auto"
                        >
                            {submitting ? "Saving…" : "Save centre holiday list"}
                        </Button>
                    </form>

                    <div className="space-y-4 lg:sticky lg:top-4">
                        <ParentDocumentCmsLayout
                            listOnly
                            sentTitle="Head office holiday list"
                            sentIntro={
                                centreStateLabel
                                    ? `Published by admin for ${centreStateLabel} — view only.`
                                    : "Published by admin for your centre — view only."
                            }
                            loading={loading}
                            rows={headOfficeRows}
                            emptySentMessage={
                                centreStateLabel
                                    ? `No head-office holiday list for ${centreStateLabel} yet.`
                                    : "No head-office holiday list yet."
                            }
                            onView={openView}
                            canViewRow={() => true}
                        />

                        <ParentDocumentCmsLayout
                            listOnly
                            sentTitle="Your centre holiday lists"
                            sentIntro="PDF and/or dates uploaded by your centre — filter by upload date, then edit or delete."
                            trackDate={trackDate}
                            onTrackDateChange={setTrackDate}
                            loading={loading}
                            rows={centreRows}
                            emptySentMessage={`No centre holiday list uploaded on ${trackDate}. Change the track date or save one.`}
                            onEdit={openEdit}
                            onDelete={remove}
                            canEditRow={() => true}
                            canDeleteRow={() => true}
                        />
                    </div>
                </div>

                <Modal isOpen={viewModal.isOpen} onClose={closeView} title="Head office holiday list" size="md" placement="center">
                    {viewModal.row ? (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                            <p className="text-sm text-[#374151]">
                                {viewModal.row.title || `${centreStateLabel} Holiday List`}
                            </p>
                            {(viewModal.row.file || "").trim() ? (
                                <p className="text-xs text-[#6B7280]">PDF uploaded by head office.</p>
                            ) : null}
                            <HolidayEntriesReadOnly
                                rows={parseHolidayEntries(viewModal.row.holiday_entries)}
                                title="Holiday dates from head office"
                                emptyMessage="No manual dates — PDF only, or not added yet."
                            />
                            <Button type="button" variant="outline" onClick={closeView}>
                                Close
                            </Button>
                        </div>
                    ) : null}
                </Modal>

                <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit centre holiday list" size="md" placement="center">
                    <form onSubmit={saveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        {centreStateLabel ? (
                            <p className="text-xs text-[#4B5563] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
                                <span className="font-semibold text-[#111827]">State:</span> {centreStateLabel}
                            </p>
                        ) : null}
                        <label className="block text-xs font-semibold text-[#4B5563]">
                            PDF label
                            <input
                                type="text"
                                value={editPdfLabel}
                                onChange={(e) => setEditPdfLabel(e.target.value)}
                                placeholder="e.g. Centre summer break 2026"
                                maxLength={255}
                                className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                            />
                            <span className="mt-1 block font-normal text-[#6B7280]">
                                Required when a PDF is attached — parents see this name when downloading it.
                            </span>
                        </label>
                        <ChecklistFileUploadField
                            id="holiday-pdf-edit"
                            accept=".pdf,application/pdf"
                            hint="Replace PDF"
                            required={false}
                            currentName={
                                editPdf?.name ??
                                (rows.find((r) => r.id === editModal.id)?.file ? "Current PDF on server" : null)
                            }
                            onChange={setEditPdf}
                        />
                        <HolidayEntriesEditor rows={editEntries} onChange={setEditEntries} {...editHolidayEditorProps} />
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                                {editSaving ? "Saving…" : "Save changes"}
                            </Button>
                            <Button type="button" variant="outline" onClick={closeEdit}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Modal>
            </>
        );
    }

    return (
        <>
            <ParentDocumentCmsLayout
                onSubmit={submit}
                uploadTitle={isAdmin ? "Upload holiday list" : "Centre holiday list"}
                uploadIntro={
                    isAdmin
                        ? "State PDF and/or manual holiday dates — saved rows appear in the real parent login app (web + mobile). Choose publish scope like notifications."
                        : "Saved rows appear in the real parent login app for your centre. Overrides head-office PDF for your centre when uploaded. You can also add manual holiday dates."
                }
                uploadFields={adminUploadFields}
                submitButton={
                    <Button type="submit" disabled={submitting} className="bg-[#FF922B] text-white w-full sm:w-auto">
                        {submitting ? "Saving…" : isAdmin ? "Save holiday list" : "Save centre holiday list"}
                    </Button>
                }
                sentTitle="Saved holiday lists"
                sentIntro="Holiday lists for the selected state — filter by upload/update date."
                sentFilters={
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        Filter by state
                        <select
                            value={filterState}
                            onChange={(e) => setFilterState(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        >
                            {PARENT_DOCUMENT_STATES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </label>
                }
                trackDate={trackDate}
                onTrackDateChange={setTrackDate}
                loading={loading}
                rows={sentRows}
                emptySentMessage={`No holiday list for ${stateLabel(filterState)} on ${trackDate}. Change the track date or save one.`}
                onEdit={openEdit}
                onDelete={remove}
                canEditRow={(row) => {
                    const full = rows.find((r) => r.id === row.id);
                    return isAdmin || (full?.franchise != null);
                }}
                canDeleteRow={(row) => {
                    const full = rows.find((r) => r.id === row.id);
                    return isAdmin || (full?.franchise != null);
                }}
            />

            <Modal isOpen={editModal.isOpen} onClose={closeEdit} title="Edit holiday list" size="md" placement="center">
                <form onSubmit={saveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {isAdmin ? (
                        <CmsPublishTargetFields
                            franchises={franchises}
                            value={editTarget}
                            onChange={setEditTarget}
                            showClassTarget
                            classOptions={classOptions}
                        />
                    ) : null}
                    <label className="block text-xs font-semibold text-[#4B5563]">
                        State
                        <select
                            value={editState}
                            onChange={(e) => setEditState(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm"
                        >
                            {PARENT_DOCUMENT_STATES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <ChecklistFileUploadField
                        id="holiday-pdf-edit"
                        accept=".pdf,application/pdf"
                        hint="Replace PDF"
                        required={false}
                        currentName={editPdf?.name ?? (rows.find((r) => r.id === editModal.id)?.file ? "Current PDF on server" : null)}
                        onChange={setEditPdf}
                    />
                    <HolidayEntriesEditor rows={editEntries} onChange={setEditEntries} {...editHolidayEditorProps} />
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Button type="submit" disabled={editSaving} className="bg-[#FF922B] text-white">
                            {editSaving ? "Saving…" : "Save changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={closeEdit}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

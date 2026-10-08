"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GraduationCap, School, Search, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

type TeacherInfo = {
    id: number;
    user: { id: number; email: string; username?: string | null; full_name: string };
    franchise_name?: string;
    class_name: string;
    is_active: boolean;
};

type ClassStudent = {
    id: number;
    full_name: string;
    class_name: string;
    section: string;
    roll_number: string;
    gender: string;
};

type MyClassResponse = {
    teacher: TeacherInfo;
    students: ClassStudent[];
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function pageNumbers(page: number, totalPages: number): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
    if (page >= totalPages - 3) {
        return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

export default function TeacherDashboardPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<MyClassResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await authFetch<MyClassResponse>("/students/teacher/my-class/"));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Could not load your class");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const students = useMemo(() => {
        const list = data?.students ?? [];
        const q = query.trim().toLowerCase();
        if (!q) return list;
        return list.filter(
            (s) =>
                s.full_name.toLowerCase().includes(q) || s.roll_number.toLowerCase().includes(q),
        );
    }, [data, query]);

    useEffect(() => {
        setPage(1);
    }, [query, pageSize]);

    const totalPages = Math.max(1, Math.ceil(students.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize;
    const pageStudents = students.slice(pageStart, pageStart + pageSize);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="font-semibold text-red-800">{error || "Could not load your class"}</p>
                <button type="button" onClick={() => void load()} className="mt-3 text-sm text-red-700 underline">
                    Try again
                </button>
            </div>
        );
    }

    const { teacher } = data;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-[#111827]">
                    Welcome, {teacher.user?.full_name || "Teacher"}
                </h1>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        <GraduationCap className="h-4 w-4" />
                        {teacher.class_name}
                    </span>
                    {teacher.franchise_name ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">
                            <School className="h-4 w-4" />
                            {teacher.franchise_name}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-700">
                        <Users className="h-4 w-4" />
                        {data.students.length} students
                    </span>
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#111827]">My Class Students</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, roll no"
                            className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white py-12 text-center text-[#6B7280]">
                        {data.students.length === 0
                            ? "No active students found in your class yet."
                            : "No students match your search."}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#F9FAFB] text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Roll / ID</th>
                                    <th className="px-4 py-3">Section</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F3F4F6]">
                                {pageStudents.map((s, i) => (
                                    <tr key={s.id} className="hover:bg-[#F9FAFB]">
                                        <td className="px-4 py-3 text-[#9CA3AF]">{pageStart + i + 1}</td>
                                        <td className="px-4 py-3 font-medium text-[#111827]">{s.full_name}</td>
                                        <td className="px-4 py-3 text-[#4B5563]">{s.roll_number || "—"}</td>
                                        <td className="px-4 py-3 text-[#4B5563]">{s.section || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#4B5563] sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span>
                                    Showing {pageStart + 1} to {pageStart + pageStudents.length} of {students.length}{" "}
                                    students
                                </span>
                                <label className="flex items-center gap-1.5">
                                    <span className="text-xs text-[#6B7280]">Show:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(Number(e.target.value))}
                                        className="rounded border border-[#E5E7EB] bg-white px-2 py-1 text-xs font-semibold text-[#374151] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        {PAGE_SIZE_OPTIONS.map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-[#F3F4F6] disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                {pageNumbers(currentPage, totalPages).map((item, idx) =>
                                    item === "..." ? (
                                        <span key={`dots-${idx}`} className="px-2 py-1 text-[#9CA3AF]">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={`page-${item}`}
                                            type="button"
                                            onClick={() => setPage(item)}
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                                currentPage === item
                                                    ? "border-blue-600 bg-blue-600 font-bold text-white"
                                                    : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
                                            }`}
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-[#F3F4F6] disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}

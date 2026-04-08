"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Eye, Pencil, Plus, Search, Sparkles, Trash2, GraduationCap, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useSchoolData, SchoolStudent } from "@/components/dashboard/shared/SchoolDataProvider";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";

const shells = {
    card: "bg-white/90 backdrop-blur border border-white/60 shadow-[0_12px_40px_-20px_rgba(255,146,43,0.45)]",
    badge: "bg-[#E7F5FF] text-[#0066CC]",
};

export default function FranchiseStudentsPage() {
    const { students, addOrUpdateStudent } = useSchoolData();
    const { parents } = useFranchiseData();

    const [query, setQuery] = useState("");
    const [form, setForm] = useState({ name: "", rollNumber: "", grade: "", section: "", parentId: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewId, setViewId] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const filtered = useMemo(() => {
        const term = query.toLowerCase();
        return students.filter((s) => 
            [s.name, s.rollNumber, s.grade].some((field) => (field || "").toLowerCase().includes(term))
        );
    }, [students, query]);

    const resetForm = () => {
        setForm({ name: "", rollNumber: "", grade: "", section: "", parentId: "" });
        setEditingId(null);
    };

    const openCreate = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEdit = (sid: string) => {
        const found = students.find((s) => s.id === sid);
        if (!found) return;
        setEditingId(sid);
        setForm({
            name: found.name || "",
            rollNumber: found.rollNumber || "",
            grade: found.grade || "",
            section: found.section || "",
            parentId: found.parentId || "",
        });
        setShowFormModal(true);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.parentId) {
            setError("Please select a parent");
            return;
        }
        setSubmitting(true);
        try {
            await addOrUpdateStudent({
                ...form,
                id: editingId || undefined
            });
            resetForm();
            setShowFormModal(false);
        } catch (err: any) {
            setError(err?.message || "Unable to save student");
        } finally {
            setSubmitting(false);
        }
    };

    const viewingStudent = students.find((s) => s.id === viewId) || null;

    return (
        <div className="space-y-8 relative">
            <style jsx global>{`
                @keyframes float-soft { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-soft { animation: float-soft 7s ease-in-out infinite; }
                .blob-card { border-radius: 28px; }
            `}</style>

            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4CC] px-3 py-1 text-xs font-semibold text-[#1F2937] shadow-sm">
                        <Sparkles className="w-4 h-4" /> Student Management
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F2937] leading-tight">Students at your centre</h1>
                    <p className="text-sm text-[#4B5563]">Manage student profiles, classes, and roll numbers linked to families.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 text-[#FF922B] absolute left-3 top-3" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, roll no, or class"
                            className="w-full rounded-full border border-white/70 bg-white/80 backdrop-blur py-2.5 pl-10 pr-4 text-sm text-[#1F2937] shadow-sm focus:border-[#FF922B] focus:outline-none"
                        />
                    </div>
                    <Button onClick={openCreate} className="rounded-full bg-[#FF922B] hover:brightness-105 shadow-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Student
                    </Button>
                </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((student, idx) => (
                    <article
                        key={student.id}
                        className={`${shells.card} blob-card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(17,24,39,0.25)] animate-soft`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#FFEBD6] text-[#FF922B] flex items-center justify-center text-base font-bold shadow-inner">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-[#1F2937] text-sm">{student.name}</p>
                                    <p className="text-xs text-[#4B5563]">{student.grade} {student.section && `- ${student.section}`}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-[11px] rounded-full ${shells.badge} shadow-sm flex items-center gap-1`}>
                                <CheckCircle2 className="w-3 h-3" /> RN: {student.rollNumber}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/40">
                            <IconButton onClick={() => setViewId(student.id)} label="View" icon={<Eye className="w-3.5 h-3.5" />} />
                            <IconButton onClick={() => openEdit(student.id)} label="Edit" icon={<Pencil className="w-3.5 h-3.5" />} />
                        </div>
                    </article>
                ))}
                {filtered.length === 0 && <p className="text-sm text-[#4B5563]">No students found.</p>}
            </section>

            {viewingStudent && (
                <Modal isOpen onClose={() => setViewId(null)} title="Student details">
                    <div className="space-y-4 text-sm text-[#1F2937]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#FFE066] flex items-center justify-center text-[#1F2937] font-semibold">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-base">{viewingStudent.name}</p>
                                <p className="text-xs text-[#4B5563]">Roll Number: {viewingStudent.rollNumber}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-3 rounded-xl">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Class</p>
                                <p className="font-medium">{viewingStudent.grade}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Section</p>
                                <p className="font-medium">{viewingStudent.section || "-"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Parent/Family</p>
                                <p className="font-medium flex items-center gap-2"><User className="w-3.5 h-3.5" /> {parents.find(p => p.id === viewingStudent.parentId)?.name || "Unknown"}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => setViewId(null)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {showFormModal && (
                <Modal isOpen onClose={() => { setShowFormModal(false); resetForm(); }} title={editingId ? "Edit student" : "Add student"}>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && <p className="px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</p>}
                        
                        <div className="grid md:grid-cols-2 gap-3">
                            <Input label="Student Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <Input label="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
                            <Input label="Class" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} required placeholder="e.g. Nursery, KG-1" />
                            <Input label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} placeholder="e.g. A, B" />
                            
                            <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5563] md:col-span-2">
                                Select Parent
                                <select 
                                    value={form.parentId} 
                                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                                    required
                                    className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#FF922B] focus:outline-none shadow-inner"
                                >
                                    <option value="">— Select family/parent —</option>
                                    {parents.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.student || "New Family"})</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" size="sm" disabled={submitting}>
                                {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Student"}
                            </Button>
                            <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={() => { setShowFormModal(false); resetForm(); }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function IconButton({ onClick, icon, label, variant = "default" }: { onClick: () => void; icon: ReactNode; label: string; variant?: "default" | "danger" }) {
    const isDanger = variant === "danger";
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 shadow-sm ${
                isDanger
                    ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                    : "bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#FFF4CC]"
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5563]">
            {label}
            <input
                {...props}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#FF922B] focus:outline-none shadow-inner w-full"
            />
        </label>
    );
}

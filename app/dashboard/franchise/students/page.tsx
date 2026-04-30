"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Eye, GraduationCap, Pencil, Plus, Search, Sparkles, Trash2, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";

const shells = {
    card: "bg-white/90 backdrop-blur border border-white/60 shadow-[0_12px_40px_-20px_rgba(255,146,43,0.45)]",
    badge: "bg-[#E7F5FF] text-[#0066CC]",
};

type StudentForm = {
    name: string;
    rollNumber: string;
    grade: string;
    section: string;
    parentId: string;
};

const emptyForm = (): StudentForm => ({ 
    name: "", 
    rollNumber: "", 
    grade: "", 
    section: "",
    parentId: ""
});

export default function FranchiseStudentsPage() {
    const { students, addOrUpdateStudent, franchiseDeleteStudent } = useSchoolData();
    const { parents } = useFranchiseData();

    const [query, setQuery] = useState("");
    const [form, setForm] = useState<StudentForm>(emptyForm());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewId, setViewId] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const filtered = useMemo(() => {
        const term = query.toLowerCase();
        return students.filter((s) =>
            [s.name, s.rollNumber, s.grade, s.section].some((f) => (f || "").toLowerCase().includes(term))
        );
    }, [students, query]);

    const resetForm = () => {
        setForm(emptyForm());
        setEditingId(null);
        setError(null);
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
        setError(null);
        setShowFormModal(true);
    };

    const validate = () => {
        if (!form.name.trim()) return "Student name is required.";
        if (!/^[A-Za-z\s'.,-]+$/.test(form.name)) return "Student name must contain letters only.";
        if (!form.grade.trim()) return "Class is required.";
        if (!editingId && !form.parentId) return "Please select a parent/family.";
        return null;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const validationError = validate();
        if (validationError) { setError(validationError); return; }
        setSubmitting(true);
        try {
            await addOrUpdateStudent({ ...form, id: editingId || undefined });
            resetForm();
            setShowFormModal(false);
        } catch (err: any) {
            setError(err?.message || "Unable to save student. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (sid: string) => {
        try {
            await franchiseDeleteStudent(sid);
        } catch {
            // ignore
        } finally {
            setShowDeleteId(null);
        }
    };

    const viewingStudent = students.find((s) => s.id === viewId) || null;
    const deletingStudent = students.find((s) => s.id === showDeleteId) || null;

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
                    <p className="text-sm text-[#4B5563]">Manage student profiles, classes, sections, and roll numbers linked to families.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 text-[#FF922B] absolute left-3 top-3" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, class, or section"
                            className="w-full rounded-full border border-white/70 bg-white/80 backdrop-blur py-2.5 pl-10 pr-4 text-sm text-[#1F2937] shadow-sm focus:border-[#FF922B] focus:outline-none"
                        />
                    </div>
                    <Button onClick={openCreate} className="rounded-full bg-[#FF922B] hover:brightness-105 shadow-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Student
                    </Button>
                </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                                    <p className="text-xs text-[#4B5563]">
                                        {student.grade} {student.section ? `· Section ${student.section}` : ""}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-[11px] rounded-full ${shells.badge} shadow-sm flex items-center gap-1`}>
                                <CheckCircle2 className="w-3 h-3" /> RN: {student.rollNumber || "—"}
                            </span>
                        </div>

                        <div className="text-xs text-[#6B7280] mb-3 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {parents.find((p) => p.id === student.parentId)?.name || "No parent linked"}
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-white/40">
                            <IconButton onClick={() => setViewId(student.id)} label="View" icon={<Eye className="w-3.5 h-3.5" />} />
                            <IconButton onClick={() => openEdit(student.id)} label="Edit" icon={<Pencil className="w-3.5 h-3.5" />} />
                            <IconButton
                                variant="danger"
                                onClick={() => setShowDeleteId(student.id)}
                                label="Delete"
                                icon={<Trash2 className="w-3.5 h-3.5" />}
                            />
                        </div>
                    </article>
                ))}
                {filtered.length === 0 && (
                    <p className="text-sm text-[#4B5563] col-span-full text-center py-10">
                        {query ? "No students match your search." : "No students added yet."}
                    </p>
                )}
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
                                <p className="text-xs text-[#4B5563]">Roll Number: {viewingStudent.rollNumber || "—"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-3 rounded-xl">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Class</p>
                                <p className="font-medium">{viewingStudent.grade || "—"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Section</p>
                                <p className="font-medium">{viewingStudent.section || "—"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Parent / Family</p>
                                <p className="font-medium flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" />
                                    {parents.find((p) => p.id === viewingStudent.parentId)?.name || "Not linked"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => { setViewId(null); openEdit(viewingStudent.id); }}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => setViewId(null)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {showFormModal && (
                <Modal isOpen onClose={() => { setShowFormModal(false); resetForm(); }} title={editingId ? "Edit student" : "Add student"}>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <p className="px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">{error}</p>
                        )}

                        <div className="grid md:grid-cols-2 gap-3">
                            <Input
                                label="Student Name *"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value.replace(/[^A-Za-z\s'.,-]/g, "") })}
                                placeholder="e.g. Priya Sharma"
                                required
                            />
                            <Input
                                label="Roll Number"
                                value={form.rollNumber}
                                onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                                placeholder="e.g. 42"
                            />
                            <Input
                                label="Class *"
                                value={form.grade}
                                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                                placeholder="e.g. KG-1, Grade 3"
                                required
                            />
                            <Input
                                label="Section"
                                value={form.section}
                                onChange={(e) => setForm({ ...form, section: e.target.value })}
                                placeholder="e.g. Section A"
                            />
                            
                            <label className="flex flex-col gap-1 text-xs font-semibold text-[#4B5563] md:col-span-2">
                                Parent / Family {!editingId && "*"}
                                <select
                                    value={form.parentId}
                                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                                    required={!editingId}
                                    className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#FF922B] focus:outline-none shadow-inner"
                                >
                                    <option value="">— {editingId ? "Keep existing parent" : "Select family/parent"} —</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.student ? `(${p.student})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" size="sm" disabled={submitting}>
                                {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Student"}
                            </Button>
                            <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={() => { setShowFormModal(false); resetForm(); }}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {deletingStudent && (
                <Modal isOpen onClose={() => setShowDeleteId(null)} title="Delete student?" size="sm">
                    <div className="space-y-3 text-sm text-[#1F2937]">
                        <p>
                            Are you sure you want to remove <strong>{deletingStudent.name}</strong> from your centre?
                            This will also delete their grades and attendance records. This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                            <Button
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleDelete(deletingStudent.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
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

function Input({ label, wrapperClassName = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; wrapperClassName?: string }) {
    return (
        <label className={`flex flex-col gap-1 text-xs font-semibold text-[#4B5563] ${wrapperClassName}`}>
            {label}
            <input
                {...props}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#FF922B] focus:outline-none shadow-inner w-full"
            />
        </label>
    );
}

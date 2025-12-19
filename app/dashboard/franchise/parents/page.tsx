"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Eye, Mail, Pencil, Phone, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";

const shells = {
    card: "bg-white/90 backdrop-blur border border-white/60 shadow-[0_12px_40px_-20px_rgba(255,146,43,0.45)]",
    badge: "bg-[#FFF4CC] text-[#1F2937]",
};

export default function FranchiseParentsPage() {
    const { parents, addParent, updateParent, deleteParent } = useFranchiseData();

    const [query, setQuery] = useState("");
    const [form, setForm] = useState({ name: "", student: "", email: "", phone: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewId, setViewId] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const filtered = useMemo(() => {
        const term = query.toLowerCase();
        return parents.filter((p) => [p.name, p.phone, p.email].some((field) => (field || "").toLowerCase().includes(term)));
    }, [parents, query]);

    const resetForm = () => {
        setForm({ name: "", student: "", email: "", phone: "" });
        setEditingId(null);
    };

    const openCreate = () => {
        resetForm();
        setShowFormModal(true);
    };

    const openEdit = (parentId: string) => {
        const found = parents.find((p) => p.id === parentId);
        if (!found) return;
        setEditingId(parentId);
        const { id, ...rest } = found;
        setForm({
            name: rest.name || "",
            student: rest.student || "",
            email: rest.email || "",
            phone: rest.phone || "",
        });
        setShowFormModal(true);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await updateParent(editingId, form);
            } else {
                await addParent(form);
            }
            resetForm();
            setShowFormModal(false);
        } catch (err: any) {
            setError(err?.message || "Unable to save parent");
        } finally {
            setSubmitting(false);
        }
    };

    const viewingParent = parents.find((p) => p.id === viewId) || null;
    const deletingParent = parents.find((p) => p.id === showDeleteId) || null;

    return (
        <div className="space-y-8 relative">
            <style jsx global>{`
                @keyframes float-soft { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-soft { animation: float-soft 7s ease-in-out infinite; }
                .blob-card { border-radius: 28px; }
            `}</style>

            <div className="absolute -top-10 -left-6 w-32 h-32 bg-[#FFE066]/40 blur-3xl rounded-full animate-soft" aria-hidden />
            <div className="absolute -bottom-12 right-4 w-36 h-36 bg-[#A5D8FF]/50 blur-3xl rounded-full animate-soft" aria-hidden />
            <div className="absolute top-24 right-16 text-4xl opacity-50 animate-soft" aria-hidden></div>
            <div className="absolute bottom-24 left-10 text-4xl opacity-50 animate-soft" aria-hidden></div>

            <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF4CC] px-3 py-1 text-xs font-semibold text-[#1F2937] shadow-sm">
                        <Sparkles className="w-4 h-4" /> Franchise Parents Hub
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F2937] leading-tight">Families at your centre</h1>
                    <p className="text-sm text-[#4B5563]">All parents are live from the backend. Search, view, edit, or add in one place.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="w-4 h-4 text-[#FF922B] absolute left-3 top-3" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, phone, or email"
                            className="w-full rounded-full border border-white/70 bg-white/80 backdrop-blur py-2.5 pl-10 pr-4 text-sm text-[#1F2937] shadow-sm focus:border-[#FF922B] focus:outline-none"
                        />
                    </div>
                    <Button onClick={openCreate} className="rounded-full bg-[#FF922B] hover:brightness-105 shadow-sm flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Parent
                    </Button>
                </div>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((parent, idx) => (
                    <article
                        key={parent.id}
                        className={`${shells.card} blob-card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(17,24,39,0.25)] animate-soft`}
                        style={{ animationDelay: `${idx * 60}ms` }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-[#E7F5FF] text-[#1F2937] flex items-center justify-center text-base font-bold shadow-inner">
                                    {parent.name?.slice(0, 1).toUpperCase() || "P"}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-semibold text-[#1F2937] text-sm">{parent.name || "Parent"}</p>
                                    <p className="text-xs text-[#4B5563]">Student: {parent.student || "-"}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-[11px] rounded-full ${shells.badge} shadow-sm flex items-center gap-1`}>
                                <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                        </div>

                        <div className="space-y-1.5 text-sm text-[#374151]">
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF922B]" /> {parent.email || "-"}</p>
                            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#FF922B]" /> {parent.phone || "-"}</p>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <IconButton onClick={() => setViewId(parent.id)} label="View" icon={<Eye className="w-4 h-4" />} />
                            <IconButton onClick={() => openEdit(parent.id)} label="Edit" icon={<Pencil className="w-4 h-4" />} />
                            <IconButton
                                variant="danger"
                                onClick={() => setShowDeleteId(parent.id)}
                                label="Delete"
                                icon={<Trash2 className="w-4 h-4" />}
                            />
                        </div>
                    </article>
                ))}
                {filtered.length === 0 && <p className="text-sm text-[#4B5563]">No parents match your search.</p>}
            </section>

            {viewingParent && (
                <Modal isOpen onClose={() => setViewId(null)} title="Parent details">
                    <div className="space-y-3 text-sm text-[#1F2937]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#FFE066] flex items-center justify-center text-[#1F2937] font-semibold">{viewingParent.name?.slice(0, 1).toUpperCase() || "P"}</div>
                            <div>
                                <p className="font-semibold text-base">{viewingParent.name}</p>
                                <p className="text-xs text-[#4B5563]">Student: {viewingParent.student || "-"}</p>
                            </div>
                        </div>
                        <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF922B]" /> {viewingParent.email || "-"}</p>
                        <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#FF922B]" /> {viewingParent.phone || "-"}</p>
                        <div className="flex gap-2 pt-3">
                            <Button size="sm" onClick={() => setViewId(null)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {showFormModal && (
                <Modal isOpen onClose={() => { setShowFormModal(false); resetForm(); }} title={editingId ? "Edit parent" : "Add parent"}>
                    <form className="space-y-3" onSubmit={handleSubmit}>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="grid md:grid-cols-2 gap-3">
                            <Input label="Parent Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            <Input label="Student Name" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} />
                            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={submitting}>
                                {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Parent"}
                            </Button>
                            <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={resetForm}>
                                Reset
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {deletingParent && (
                <Modal isOpen onClose={() => setShowDeleteId(null)} title="Delete parent?" size="sm">
                    <div className="space-y-3 text-sm text-[#1F2937]">
                        <p>Are you sure you want to remove {deletingParent.name || "this parent"}? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDeleteId(null)}>Cancel</Button>
                            <Button
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={async () => {
                                    await deleteParent(deletingParent.id);
                                    setShowDeleteId(null);
                                }}
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
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-150 shadow-sm ${
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
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1F2937] focus:border-[#FF922B] focus:outline-none shadow-inner"
            />
        </label>
    );
}

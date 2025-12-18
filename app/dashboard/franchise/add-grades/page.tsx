"use client";

import { useState } from "react";
import { ClipboardList, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSchoolData, BulkGradeRow } from "@/components/dashboard/shared/SchoolDataProvider";

export default function AddGradesPage() {
    const { addGradesBulk, grades } = useSchoolData();
    const [form, setForm] = useState({ rollNumber: "", studentName: "", gradeLevel: "", section: "", subject: "", term: "Term 1", grade: "", score: "" });
    const [bulkText, setBulkText] = useState("");
    const [bulkResult, setBulkResult] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.rollNumber.trim() || !form.subject.trim()) return;
        addGradesBulk([
            {
                rollNumber: form.rollNumber,
                studentName: form.studentName,
                gradeLevel: form.gradeLevel,
                section: form.section,
                subject: form.subject,
                term: form.term,
                grade: form.grade,
                score: form.score ? Number(form.score) : undefined,
            },
        ]);
    };

    const parsedRows: BulkGradeRow[] = bulkText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [rollNumber, subject, term, grade, score, gradeLevel, section] = line.split(",").map((s) => s?.trim() || "");
            return { rollNumber, subject, term: term || "Term 1", grade, score: score ? Number(score) : undefined, gradeLevel, section };
        });

    const submitBulk = () => {
        const result = addGradesBulk(parsedRows);
        setBulkResult(`Inserted ${result.inserted}, skipped ${result.skipped}`);
    };

    const recentGrades = grades.slice(-6).reverse();

    return (
        <div className="space-y-6">
            <Section
                id="add-grades"
                title="Add Marks / Grades"
                description="Add individual subject scores for a student (by roll number)."
                icon={<ClipboardList className="w-5 h-5 text-orange-500" />}
            >
                <form className="grid md:grid-cols-3 gap-3" onSubmit={handleSubmit}>
                    <Input label="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} required />
                    <Input label="Student Name (optional)" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
                    <Input label="Grade / Class" value={form.gradeLevel} onChange={(e) => setForm({ ...form, gradeLevel: e.target.value })} />
                    <Input label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
                    <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                    <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                        Term
                        <select className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
                            <option>Term 1</option>
                            <option>Term 2</option>
                            <option>Term 3</option>
                        </select>
                    </label>
                    <Input label="Grade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
                    <Input label="Score" type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
                    <div className="flex items-end gap-2">
                        <Button type="submit" size="sm">Add Grade</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setForm({ rollNumber: "", studentName: "", gradeLevel: "", section: "", subject: "", term: "Term 1", grade: "", score: "" })}>Reset</Button>
                    </div>
                </form>
                <p className="text-xs text-orange-700 mt-2">Use roll number to target the student. If the student does not exist, they will be created and linked.</p>
            </Section>

            <Section
                id="bulk-upload"
                title="Bulk Upload (CSV rows)"
                description="Paste rows: roll, subject, term, grade, score, gradeLevel, section"
                icon={<Upload className="w-5 h-5 text-orange-500" />}
            >
                <textarea
                    className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none min-h-[120px]"
                    placeholder="A101,Math,Term 1,A,92,KG-2,A\nA102,English,Term 1,B+,88,KG-1,B"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                    <Button type="button" size="sm" onClick={submitBulk}>Upload</Button>
                    {bulkResult && <span className="text-xs text-orange-700">{bulkResult}</span>}
                </div>
            </Section>

            <Section
                id="recent"
                title="Recent Grades"
                description="Latest records saved."
                icon={<ClipboardList className="w-5 h-5 text-orange-500" />}
            >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentGrades.map((g) => (
                        <div key={g.id} className="border border-orange-100 rounded-xl p-3 bg-white shadow-sm">
                            <p className="font-semibold text-orange-900 text-sm">{g.subject}</p>
                            <p className="text-xs text-orange-700">{g.term}</p>
                            <p className="text-xs text-orange-700">Grade: {g.grade || "Pending"} {g.score !== undefined ? `(Score: ${g.score})` : ""}</p>
                            <p className="text-xs text-orange-700">Student: {g.studentId}</p>
                        </div>
                    ))}
                    {recentGrades.length === 0 && <p className="text-sm text-orange-700">No grades yet.</p>}
                </div>
            </Section>
        </div>
    );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
            {label}
            <input {...props} className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
        </label>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div className="space-y-3">{children}</div>}
        </section>
    );
}

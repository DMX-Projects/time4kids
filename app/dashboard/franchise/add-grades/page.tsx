"use client";

import { useState, useRef } from "react";
import { ClipboardList, Upload, Download, FileSpreadsheet } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSchoolData, BulkGradeRow } from "@/components/dashboard/shared/SchoolDataProvider";

const CSV_HEADERS = "roll_number,subject,term,grade,score,grade_level,section";
const CSV_SAMPLE = `A101,Math,Term 1,A,92,KG-2,A
A102,English,Term 1,B+,88,KG-1,B
A103,Science,Term 2,A+,97,KG-2,A`;

export default function AddGradesPage() {
    const { addGradesBulk, grades } = useSchoolData();
    const [form, setForm] = useState({ rollNumber: "", studentName: "", gradeLevel: "", section: "", subject: "", term: "Term 1", grade: "", score: "" });
    const [bulkText, setBulkText] = useState("");
    const [bulkResult, setBulkResult] = useState<{ type: "success" | "error" | "loading"; msg: string } | null>(null);
    const [singleResult, setSingleResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showBulkResult = (type: "success" | "error", msg: string) => {
        setBulkResult({ type, msg });
        setTimeout(() => setBulkResult(null), 5000);
    };

    const showSingleResult = (type: "success" | "error", msg: string) => {
        setSingleResult({ type, msg });
        setTimeout(() => setSingleResult(null), 4000);
    };

    const downloadTemplate = () => {
        const content = CSV_HEADERS + "\n" + CSV_SAMPLE;
        const blob = new Blob([content], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "grades_template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            // Strip header row if it matches our template header
            const lines = text.split(/\r?\n/).filter(Boolean);
            const firstLine = lines[0]?.toLowerCase().replace(/\s/g, "");
            const isHeader = firstLine.startsWith("roll") || firstLine.startsWith("rollnumber");
            const dataLines = isHeader ? lines.slice(1) : lines;
            setBulkText(dataLines.join("\n"));
            setBulkResult(null);
        };
        reader.readAsText(file);
        // Reset input so same file can be re-uploaded
        e.target.value = "";
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.rollNumber.trim() || !form.subject.trim()) return;
        await addGradesBulk([
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
        setForm({ rollNumber: "", studentName: "", gradeLevel: "", section: "", subject: "", term: "Term 1", grade: "", score: "" });
        showSingleResult("success", `Grade added successfully for Roll No. ${form.rollNumber}`);
    };

    const parsedRows: BulkGradeRow[] = bulkText
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [rollNumber, subject, term, grade, score, gradeLevel, section] = line.split(",").map((s) => s?.trim() || "");
            return { rollNumber, subject, term: term || "Term 1", grade, score: score ? Number(score) : undefined, gradeLevel, section };
        });

    const submitBulk = async () => {
        setBulkResult({ type: "loading", msg: "Uploading grades, please wait..." });
        try {
            const result = await addGradesBulk(parsedRows);
            if (result.inserted > 0) {
                showBulkResult("success", `✅ Successfully inserted ${result.inserted} grade${result.inserted !== 1 ? "s" : ""}${result.skipped > 0 ? `. ${result.skipped} row(s) skipped (duplicates or invalid).` : "!"}`);
                setBulkText("");
            } else {
                showBulkResult("error", `⚠️ No grades inserted. ${result.skipped} row(s) were skipped (check for duplicates or missing roll numbers).`);
            }
        } catch {
            showBulkResult("error", "❌ Upload failed. Please check your CSV format and try again.");
        }
    };

    const recentGrades = grades.slice(-6).reverse();

    return (
        <div className="space-y-6">
            {/* Single grade success banner */}
            {singleResult && (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
                    singleResult.type === "success"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-red-50 border-red-200 text-red-800"
                }`}>
                    <span>{singleResult.msg}</span>
                    <button onClick={() => setSingleResult(null)} className="ml-auto text-lg leading-none opacity-60 hover:opacity-100">&times;</button>
                </div>
            )}
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
                title="Bulk Upload (CSV)"
                description="Download the template, fill it in, then upload the CSV file — or paste rows directly."
                icon={<Upload className="w-5 h-5 text-orange-500" />}
            >
                {/* Action buttons row */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={downloadTemplate}
                        className="flex items-center gap-1.5"
                    >
                        <Download className="w-4 h-4" />
                        Download CSV Template
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Upload CSV File
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={handleCSVFile}
                    />
                </div>

                <p className="text-xs text-orange-600 mb-2">
                    CSV columns: <code className="bg-orange-50 px-1 rounded">roll_number, subject, term, grade, score, grade_level, section</code>
                </p>

                <textarea
                    className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none min-h-[140px] font-mono"
                    placeholder={`A101,Math,Term 1,A,92,KG-2,A\nA102,English,Term 1,B+,88,KG-1,B`}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                />
                <div className="flex items-center gap-3 mt-2">
                    <Button type="button" size="sm" onClick={submitBulk} disabled={!bulkText.trim() || bulkResult?.type === "loading"}>
                        {bulkResult?.type === "loading" ? "Uploading..." : "Submit Bulk Upload"}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => { setBulkText(""); setBulkResult(null); }}>
                        Clear
                    </Button>
                </div>

                {/* Bulk upload result banner */}
                {bulkResult && (
                    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium border mt-3 ${
                        bulkResult.type === "success"
                            ? "bg-green-50 border-green-200 text-green-800"
                            : bulkResult.type === "error"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-orange-50 border-orange-200 text-orange-800"
                    }`}>
                        <span className="flex-1">{bulkResult.msg}</span>
                        {bulkResult.type !== "loading" && (
                            <button onClick={() => setBulkResult(null)} className="text-lg leading-none opacity-60 hover:opacity-100">&times;</button>
                        )}
                    </div>
                )}
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

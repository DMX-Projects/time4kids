import fs from "fs";

const p = "app/dashboard/admin/home-content/page.tsx";
let s = fs.readFileSync(p, "utf8");

const fn = "export default function AdminHomeContentPage";
const fnIdx = s.indexOf(fn);
if (fnIdx < 0) throw new Error("page fn not found");

const retIdx = s.indexOf("    return (", fnIdx);
const closeIdx = s.lastIndexOf("\r\n}", s.length);
const fnEnd = s.indexOf("\r\n}", retIdx);

// Find closing of component: last `    );\r\n}` before EOF from retIdx
let depth = 0;
let i = retIdx;
let componentEnd = -1;
while (i < s.length) {
    if (s.startsWith("    return (", i)) {
        componentEnd = s.indexOf("    );\r\n}", i);
        if (componentEnd > 0) {
            componentEnd += "    );\r\n}".length - 1; // keep `}`
            break;
        }
    }
    i++;
}
// Simpler: from retIdx find `\r\n    );\r\n}\r\n` that ends the function
const endMarker = "\r\n    );\r\n}";
componentEnd = s.indexOf(endMarker, retIdx) + endMarker.length - 1;

const oldReturn = s.slice(retIdx, componentEnd);
console.log("old return length", oldReturn.length);

const newReturn = `    return (
        <HomepageEditorLayout
            active={activeSection}
            onSelect={setActiveSection}
            dirty={dirty}
            saving={saving}
            loading={loading}
            error={error}
            message={message}
            onSave={save}
            onReload={load}
            onReset={reset}
        >
            {activeSection === "hero" && <ExternalSectionPanel sectionId="hero" />}
            {activeSection === "testimonials" && <ExternalSectionPanel sectionId="testimonials" />}
            {activeSection === "locations" && <ExternalSectionPanel sectionId="locations" />}

            {activeSection === "quick-links" && (
                    PLACEHOLDER_QUICK_LINKS
            )}

            {activeSection === "franchise" && (
                    PLACEHOLDER_FRANCHISE
            )}

            {activeSection === "programs" && (
                    PLACEHOLDER_PROGRAMS
            )}

            {activeSection === "why-choose" && (
                    PLACEHOLDER_WHY
            )}
        </HomepageEditorLayout>
    );`;

// Extract sections from old return by title markers
function extractBetween(startMarker, endMarker) {
    const a = oldReturn.indexOf(startMarker);
    if (a < 0) return "";
    const b = endMarker ? oldReturn.indexOf(endMarker, a) : oldReturn.length;
    return oldReturn.slice(a, b);
}

const quick = extractBetween(
    '<Section title="1. Key navigation',
    '<div id="benefits"',
).replace(
    '<Section title="1. Key navigation (icons under the hero)">',
    '<Section title="Quick links (under the hero)">',
);

let franchise = extractBetween('<motion-safe-thumb id="benefits"', '<div id="intro"');
if (!franchise) franchise = extractBetween('<motion-safe-thumb id="benefits"', '<motion-safe-thumb id="intro"');
if (!franchise) franchise = extractBetween('<div id="benefits"', '<motion-safe-thumb id="intro"');
if (!franchise) franchise = extractBetween('<div id="benefits"', '<div id="intro"');

// Add updates empty message field if missing
if (franchise && !franchise.includes("updates_empty_message")) {
    const insert =
        '\r\n                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2">\r\n                            <label className={labelClass}>News ticker — message when no updates</label>\r\n                            <input\r\n                                className={inputClass}\r\n                                value={data.updates_empty_message ?? ""}\r\n                                onChange={(e) => setData({ ...data, updates_empty_message: e.target.value })}\r\n                            />\r\n                            <p className="text-xs text-slate-500">\r\n                                Shown in the news box when there are no items. Add real news under{" "}\r\n                                <Link href="/dashboard/admin/updates" className="text-orange-600 underline">\r\n                                    Admin → Updates\r\n                                </Link>\r\n                                .\r\n                            </p>\r\n                        </div>\r\n';
    const anchor = franchise.indexOf("2c. Franchise advantage photos");
    if (anchor > 0) {
        const sectionEnd = franchise.indexOf("</Section>", anchor);
        if (sectionEnd > 0) {
            franchise =
                franchise.slice(0, sectionEnd + "</Section>".length) + insert + franchise.slice(sectionEnd + "</Section>".length);
        }
    }
}

franchise = franchise.replace(
    "Franchise benefits (list on the home page)",
    "Franchise benefit cards (left column — Why Partner section)",
);
franchise = franchise.replace(
    "“Benefits of Becoming a T.I.M.E. Kids Franchise”",
    "the four numbered cards on the left of “Why Partner with T.I.M.E. Kids”",
);

const programs = extractBetween('<div id="programs"', '<div id="methodology"').replace(
    '<Section title="6. Programs preview',
    '<Section title="Programs preview',
);

const why = extractBetween('<div id="why"', '<motion-safe-thumb id="programs"');
const why2 = why || extractBetween('<div id="why"', '<div id="programs"');
const whyFinal = (why2 || extractBetween('<Section title=\'5. Why Choose Us', '<div id="programs"')).replace(
    "'5. Why Choose Us (cards with photos)'",
    "'Why Choose Us (cards with photos)'",
);

let built = newReturn
    .replace("PLACEHOLDER_QUICK_LINKS", quick.trim())
    .replace("PLACEHOLDER_FRANCHISE", franchise.trim() + "\r\n                </>")
    .replace("PLACEHOLDER_PROGRAMS", programs.trim())
    .replace("PLACEHOLDER_WHY", (whyFinal || "").trim());

// Fix franchise wrapper - should end with </>
built = built.replace("PLACEHOLDER_FRANCHISE", franchise.trim());

// Re-do built properly
built = `    return (
        <HomepageEditorLayout
            active={activeSection}
            onSelect={setActiveSection}
            dirty={dirty}
            saving={saving}
            loading={loading}
            error={error}
            message={message}
            onSave={save}
            onReload={load}
            onReset={reset}
        >
            {activeSection === "hero" && <ExternalSectionPanel sectionId="hero" />}
            {activeSection === "testimonials" && <ExternalSectionPanel sectionId="testimonials" />}
            {activeSection === "locations" && <ExternalSectionPanel sectionId="locations" />}

            {activeSection === "quick-links" && (
                    ${quick.trim()}
            )}

            {activeSection === "franchise" && (
                <>
                    ${franchise.trim()}
                </>
            )}

            {activeSection === "programs" && (
                    ${programs.trim()}
            )}

            {activeSection === "why-choose" && (
                    ${(whyFinal || "").trim()}
            )}
        </HomepageEditorLayout>
    );`;

const out = s.slice(0, retIdx) + built + s.slice(componentEnd);
fs.writeFileSync(p, out);
console.log("done", out.length);

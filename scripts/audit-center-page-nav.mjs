import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const navPath = path.join(__dirname, "../config/franchise-center-page-nav.ts");
const text = fs.readFileSync(navPath, "utf8");

// Dynamic import won't work for TS; parse structurally instead
const blocks = ["FRANCHISE_CENTER_PAGE_BLOCK_A", "FRANCHISE_CENTER_PAGE_BLOCK_B"];
const missingAdmin = [];
const missingRowKey = [];
const hasAdminNoRowKey = [];

let currentTop = "";
let currentGroup = "";
let currentNested = "";

const topRe = /^\s+id:\s*"([^"]+)"/;
const titleRe = /^\s+title:\s*"([^"]+)"/;

const lines = text.split("\n");
let i = 0;
while (i < lines.length) {
    const line = lines[i];
    if (line.includes("export const FRANCHISE_CENTER_PAGE_BLOCK")) {
        i++;
        continue;
    }
    const topId = line.match(topRe);
    if (topId && lines[i + 1]?.includes("title:")) {
        currentTop = lines[i + 1].match(titleRe)?.[1] ?? topId[1];
        currentGroup = "";
        currentNested = "";
        i += 2;
        continue;
    }
    const groupTitle = line.match(/^\s{12}title:\s*"([^"]+)"/);
    if (groupTitle && !line.includes("nested")) {
        currentGroup = groupTitle[1];
        currentNested = "";
    }
    const nestedTitle = line.match(/^\s{16,20}title:\s*"([^"]+)"/);
    if (nestedTitle) {
        currentNested = nestedTitle[1];
    }
    if (line.match(/^\s+\{\s*$/) && lines[i + 1]?.includes("label:")) {
        const linkLines = [line];
        i++;
        while (i < lines.length) {
            linkLines.push(lines[i]);
            if (lines[i].match(/^\s+\},?\s*$/)) break;
            i++;
        }
        const block = linkLines.join("\n");
        const label = block.match(/label:\s*"([^"]+)"/)?.[1];
        if (!label || !block.includes("href:")) {
            i++;
            continue;
        }
        const hasAdmin = /adminCategory:/.test(block);
        const hasRowKey = /rowKey:/.test(block);
        const entry = {
            section: currentTop,
            group: currentGroup || undefined,
            nested: currentNested || undefined,
            label,
        };
        if (!hasAdmin) missingAdmin.push(entry);
        if (!hasRowKey) missingRowKey.push(entry);
        if (hasAdmin && !hasRowKey) hasAdminNoRowKey.push(entry);
    }
    i++;
}

console.log("=== Links WITHOUT adminCategory (no upload UI) ===");
console.log(`Count: ${missingAdmin.length}`);
for (const e of missingAdmin) {
    const path = [e.section, e.group, e.nested, e.label].filter(Boolean).join(" › ");
    console.log(`  - ${path}`);
}

console.log("\n=== Links WITH adminCategory but WITHOUT rowKey ===");
console.log(`Count: ${hasAdminNoRowKey.length}`);
for (const e of hasAdminNoRowKey) {
    const path = [e.section, e.group, e.nested, e.label].filter(Boolean).join(" › ");
    console.log(`  - ${path}`);
}

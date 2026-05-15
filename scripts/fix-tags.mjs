import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const file = process.argv[2];
if (!file) throw new Error('pass file path');
let s = fs.readFileSync(file, 'utf8');
const before = (s.match(/motion-safe-thumb/g) || []).length;
s = s.replaceAll('motion-safe-thumb', 'div');
fs.writeFileSync(file, s);
console.log(file, 'fixed', before, 'tags');

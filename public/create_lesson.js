import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (!args[0] || !args[1]) {
  console.log('Usage: node create_lesson.js "Lesson Title" lesson-slug');
  process.exit(1);
}
const title = args[0];
const slug = args[1];
const lessonsDir = path.join(process.cwd(), 'lessons');
if (!fs.existsSync(lessonsDir)) {
  fs.mkdirSync(lessonsDir);
}
const templatePath = path.join(process.cwd(), 'lesson-template.html');
if (!fs.existsSync(templatePath)) {
  console.log('Missing lesson-template.html in current folder.');
  process.exit(1);
}
let tpl = fs.readFileSync(templatePath, 'utf8');
tpl = tpl.replace(/TITLE_HERE/g, title);
tpl = tpl.replace(/EST_TIME/g, '15 minutes');
tpl = tpl.replace(/GRADE/g, 'K-2');
const outPath = path.join(lessonsDir, `${slug}.html`);
fs.writeFileSync(outPath, tpl, 'utf8');
console.log('Lesson created at', outPath);

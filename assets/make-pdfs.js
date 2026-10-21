// make-pdfs.js — render guides/<slug>.html to guides/<slug>.pdf using headless Edge/Chrome.
// Usage: node make-pdfs.js [slug ...]   (no args = every guide missing a PDF; --force = rebuild all)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const GUIDES = path.join(ROOT, 'guides');
const TOPICS = JSON.parse(fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf8')).topics;

const CANDIDATES = [
  process.env.CHROME_BIN,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);
const BROWSER = CANDIDATES.find(p => { try { return fs.existsSync(p); } catch { return false; } });
if (!BROWSER) { console.error('No Edge/Chrome found. Set CHROME_BIN.'); process.exit(1); }

const args = process.argv.slice(2);
const force = args.includes('--force');
let slugs = args.filter(a => a !== '--force');
if (!slugs.length) slugs = TOPICS.map(t => t.slug);

let done = 0, skipped = 0, failed = [];
for (const slug of slugs) {
  const html = path.join(GUIDES, slug + '.html');
  const pdf = path.join(GUIDES, slug + '.pdf');
  if (!fs.existsSync(html)) continue;
  if (!force && fs.existsSync(pdf)) { skipped++; continue; }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'studypdf-'));
  try {
    execFileSync(BROWSER, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
      `--user-data-dir=${profile}`,
      '--no-pdf-header-footer',
      '--virtual-time-budget=10000',
      `--print-to-pdf=${pdf}`,
      'file:///' + html.replace(/\\/g, '/')
    ], { stdio: 'ignore', timeout: 180000 });
    if (fs.existsSync(pdf)) { done++; console.log('pdf', slug); }
    else failed.push(slug);
  } catch (e) {
    failed.push(slug);
  } finally {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}
console.log(`${done} PDF(s) written, ${skipped} skipped (already present).`);
if (failed.length) console.log('failed:', failed.join(', '));

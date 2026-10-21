// build.js — assemble self-contained study guides.
// Reads: assets/topics.json (slug->{title,category}),
//        _content/<slug>.body.html (raw inner HTML from author agents),
//        _content/<slug>.meta.json ({subtitle, tags}).
// Writes: guides/<slug>.html   (self-contained, CSS inlined, code highlighted)
// Usage: node build.js [slug ...]
const fs = require('fs');
const path = require('path');
const hljs = require('highlight.js');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, '_content');
const OUT = path.join(ROOT, 'guides');
const CSS = fs.readFileSync(path.join(__dirname, 'study.css'), 'utf8');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf8')).topics;
const META = Object.fromEntries(MANIFEST.map(t => [t.slug, t]));

fs.mkdirSync(OUT, { recursive: true });

const decode = s => s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const slugify = s => s.toLowerCase().replace(/<[^>]+>/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

function highlightCode(html) {
  return html.replace(/<pre>\s*<code(?:\s+class="language-([a-z0-9+#.-]+)")?\s*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (m, lang, body) => {
      const raw = decode(body).replace(/^\n/, '').replace(/\s+$/, '');
      let out, label = (lang || 'text').toUpperCase();
      try {
        if (lang && hljs.getLanguage(lang)) out = hljs.highlight(raw, { language: lang }).value;
        else { const r = hljs.highlightAuto(raw); out = r.value; label = (lang || r.language || 'code').toUpperCase(); }
      } catch { out = esc(raw); }
      return `<div class="code-label">${label}</div><pre><code class="hljs">${out}</code></pre>`;
    });
}

function buildToc(html) {
  const items = [];
  html = html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (m, t) => {
    const id = slugify(t); items.push({ id, t: t.replace(/<[^>]+>/g, '') });
    return `<h2 id="${id}">${t}</h2>`;
  });
  if (items.length < 3) return { html, toc: '' };
  const toc = `<nav class="toc"><h4>Contents</h4><ol>${items.map(i => `<li><a href="#${i.id}">${i.t}</a></li>`).join('')}</ol></nav>`;
  return { html, toc };
}

function shell(m, subtitle, tags, body) {
  body = highlightCode(body);
  const r = buildToc(body);
  const tagHtml = (tags || []).map(t => `<span>${t}</span>`).join('');
  const words = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 220));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.title} — Study Guide</title>
<style>${CSS}</style></head><body>
<nav class="topbar no-print"><a href="../index.html">&larr; All guides</a>
<span class="sp"></span><button onclick="window.print()">Print / Save PDF</button></nav>
<header class="cover">
  <div class="kicker">${m.category}</div>
  <h1>${m.title}</h1>
  <div class="subtitle">${subtitle || ''}</div>
  <div class="tags">${tagHtml}</div>
  <div class="meta">Study Pack &middot; Comprehensive reference &amp; interview prep &middot; ~${mins} min read &middot; ${words.toLocaleString('en-US')} words</div>
</header>
<main class="wrap">
${r.toc}
${r.html}
<hr><p style="color:var(--muted);font-size:13px;text-align:center" class="no-print"><a href="../index.html">&larr; Back to the Study Pack index</a></p>
</main>
<a href="#" class="totop no-print" aria-label="Back to top">&uarr;</a>
</body></html>`;
}

// Stitch part files: dsa.part1.html + dsa.part2.html + ... -> dsa.body.html
function stitchParts(slug) {
  const bodyPath = path.join(CONTENT, slug + '.body.html');
  if (fs.existsSync(bodyPath)) return; // already stitched
  const parts = [];
  for (let i = 1; i <= 9; i++) {
    const p = path.join(CONTENT, `${slug}.part${i}.html`);
    if (fs.existsSync(p)) parts.push(fs.readFileSync(p, 'utf8'));
    else break;
  }
  if (parts.length > 0) {
    fs.writeFileSync(bodyPath, parts.join('\n'));
    console.log(`stitched ${parts.length} parts -> ${slug}.body.html`);
  }
}

let slugs = process.argv.slice(2);
if (!slugs.length) {
  if (!fs.existsSync(CONTENT)) { console.log('no _content dir'); process.exit(0); }
  // discover: all .body.html + any .part1.html (stitch on demand)
  const bySlug = new Set();
  for (const f of fs.readdirSync(CONTENT)) {
    const m = f.match(/^(.+)\.(body\.html|part\d+\.html)$/);
    if (m) bySlug.add(m[1]);
  }
  slugs = [...bySlug];
}

// stitch any that need it before building
for (const slug of slugs) stitchParts(slug);

let n = 0, missing = [];
for (const slug of slugs) {
  const bodyPath = path.join(CONTENT, slug + '.body.html');
  const m = META[slug];
  if (!m) { console.error('no manifest entry:', slug); continue; }
  if (!fs.existsSync(bodyPath)) { missing.push(slug); continue; }
  const body = fs.readFileSync(bodyPath, 'utf8');
  let meta = { subtitle: '', tags: [] };
  const metaPath = path.join(CONTENT, slug + '.meta.json');
  if (fs.existsSync(metaPath)) { try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) { console.error('bad meta', slug, e.message); } }
  fs.writeFileSync(path.join(OUT, slug + '.html'), shell(m, meta.subtitle, meta.tags, body));
  n++; console.log('built', slug + '.html');
}
if (missing.length) console.log('\nmissing body files:', missing.join(', '));
console.log(`${n} guide(s) built.`);

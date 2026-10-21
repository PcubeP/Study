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
const attr = s => String(s || '').replace(/<[^>]+>/g,'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/\s+/g,' ').trim();
const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%232563eb'/%3E%3Ctext x='32' y='45' font-family='Segoe UI,Arial,sans-serif' font-size='38' font-weight='700' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E";
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
  const desc = attr(subtitle) || `${attr(m.title)} — a comprehensive study guide and interview-prep reference.`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<script>(function(){try{var t=localStorage.getItem('studypack.theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.title} — Study Guide</title>
<meta name="description" content="${desc}">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="article">
<meta property="og:title" content="${attr(m.title)} — Study Guide">
<meta property="og:description" content="${desc}">
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style></head><body data-slug="${m.slug}">
<div class="readbar no-print" id="readbar"></div>
<nav class="topbar no-print"><a href="../index.html">&larr; All guides</a>
<span class="sp"></span>
<button class="done-btn" id="doneBtn" aria-pressed="false">Mark complete</button>
<button class="themer" id="themeBtn" aria-label="Toggle colour theme"><span class="lt">Dark</span><span class="dk">Light</span></button>
<button onclick="window.print()">Print / Save PDF</button></nav>
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
<script>
(function(){
  var KEY='studypack.', root=document.documentElement;
  var tb=document.getElementById('themeBtn');
  if(tb)tb.addEventListener('click',function(){
    var t=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',t);
    try{localStorage.setItem(KEY+'theme',t);}catch(e){}
  });

  var slug=document.body.getAttribute('data-slug'), db=document.getElementById('doneBtn');
  function read(){try{return JSON.parse(localStorage.getItem(KEY+'progress')||'{}');}catch(e){return {};}}
  function paint(d){db.setAttribute('aria-pressed',d?'true':'false');db.textContent=d?'Completed':'Mark complete';}
  if(db&&slug){
    paint(!!read()[slug]);
    db.addEventListener('click',function(){
      var p=read();
      if(p[slug])delete p[slug];else p[slug]=Date.now();
      try{localStorage.setItem(KEY+'progress',JSON.stringify(p));}catch(e){}
      paint(!!p[slug]);
    });
  }

  var rb=document.getElementById('readbar');
  if(rb){
    var tick=function(){
      var max=root.scrollHeight-root.clientHeight;
      rb.style.width=(max>0?(root.scrollTop/max*100):0)+'%';
    };
    addEventListener('scroll',tick,{passive:true});
    addEventListener('resize',tick);
    tick();
  }
})();
</script>
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

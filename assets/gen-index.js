// gen-index.js — build Study/index.html landing page from topics.json + built guides.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const CSS = fs.readFileSync(path.join(__dirname, 'study.css'), 'utf8');
const TOPICS = JSON.parse(fs.readFileSync(path.join(__dirname, 'topics.json'), 'utf8')).topics;
const GUIDES = path.join(ROOT, 'guides');

const cats = [];
const byCat = {};
for (const t of TOPICS) {
  if (!byCat[t.category]) { byCat[t.category] = []; cats.push(t.category); }
  const html = fs.existsSync(path.join(GUIDES, t.slug + '.html'));
  const pdf = fs.existsSync(path.join(GUIDES, t.slug + '.pdf'));
  byCat[t.category].push({ ...t, html, pdf });
}

const icon = { 'Programming Languages':'{ }', 'AI/ML Frameworks':'◈', 'Generative AI & LLMs':'✦',
  'Data Science':'▦', 'Web & App Development':'❐', 'Cloud & Platforms':'☁', 'Tools & Software':'⚙',
  'Career & Role':'◎', 'AI/ML Deep Dive':'∆', 'Professional Skills':'◉', 'Interview Prep':'★',
  'Infrastructure & DevOps':'⬢', 'Business & Entrepreneurship (India)':'₹',
  'Investing & Markets (India)':'▲' };

// Curated learning tracks — ordered reading paths through the pack.
const TRACKS = [
  { name: 'Forward Deployed Engineer', note: 'Build → deploy → explain. The full FDE skill stack in reading order.',
    slugs: ['forward-deployed-engineer','python','linux-shell','rest-apis','rapid-prototyping','docker-kubernetes',
            'networking-security','data-engineering','rag','ai-agents','llm-evaluation','observability',
            'enterprise-integration','cicd-devops','consulting-skills','technical-writing','communication-speaking'] },
  { name: 'AI / ML Engineer', note: 'From the maths to a model running in production.',
    slugs: ['python','numpy','pandas','ml-core-concepts','scikit-learn','deep-learning','pytorch',
            'llms','prompt-engineering','rag','vector-databases','langchain','ai-agents','llm-evaluation','mlops'] },
  { name: 'Founder / Business (India)', note: 'Idea to incorporated, compliant, funded and operating.',
    slugs: ['starting-business-india','india-contracts-ip','india-compliance-tax','india-business-operations',
            'freelancing-consulting-india','india-startup-funding'] },
  { name: 'Investing & Markets (India)', note: 'Zero to a funded, taxed, risk-managed portfolio — read in this order.',
    slugs: ['investing-foundations','indian-stock-market','mutual-funds-sips','stock-analysis',
            'portfolio-construction','investing-tax-india','market-research-sources',
            'derivatives-options','trading-strategy-risk','getting-started-investing'] },
  { name: 'Interview Sprint', note: 'Four weeks of focused preparation for technical + customer-facing loops.',
    slugs: ['dsa','system-design','python','rest-apis','docker-kubernetes','forward-deployed-engineer',
            'consulting-skills','communication-speaking'] }
];

const titleOf = Object.fromEntries(TOPICS.map(t => [t.slug, t.title]));
const sectionOf = Object.fromEntries(TOPICS.map(t => [t.slug, t]));

const sections = cats.map(c => {
  const cards = byCat[c].map(t => {
    const links = [
      t.html ? `<a href="guides/${t.slug}.html">Read (HTML)</a>` : '<span class="pending">pending</span>',
      t.pdf ? `<a href="guides/${t.slug}.pdf">PDF</a>` : ''
    ].filter(Boolean).join('<span class="sep">·</span>');
    const blurb = t.focus.split(':').slice(-1)[0].split('.')[0].trim();
    const hay = `${t.title} ${t.category} ${t.focus}`.toLowerCase().replace(/"/g, '');
    return `<div class="card" data-slug="${t.slug}" data-cat="${t.category}" data-s="${hay}">` +
      `<button class="mark no-print" aria-pressed="false" title="Mark as complete"></button>` +
      `<h4>${t.title}</h4><p class="d">${blurb}.</p><div class="lk">${links}</div></div>`;
  }).join('');
  return `<section data-cat="${c}"><h2><span class="ic">${icon[c]||'●'}</span>${c}` +
    `<span class="catprog no-print" data-cat-prog="${c}"></span></h2><div class="grid c3">${cards}</div></section>`;
}).join('');

const trackHtml = TRACKS.map(tr => {
  const steps = tr.slugs.filter(s => sectionOf[s]).map((s, i) => {
    const built = fs.existsSync(path.join(GUIDES, s + '.html'));
    const label = `<span class="n">${i + 1}</span>${titleOf[s]}`;
    return built ? `<a class="tstep" data-slug="${s}" href="guides/${s}.html">${label}</a>`
                 : `<span class="tstep off">${label}</span>`;
  }).join('');
  return `<details class="track"><summary>${tr.name} <span class="tcount">${tr.slugs.length} guides</span></summary>
<div class="body"><p class="d">${tr.note}</p><div class="tsteps">${steps}</div></div></details>`;
}).join('');

const done = TOPICS.filter(t => fs.existsSync(path.join(GUIDES, t.slug + '.html'))).length;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<script>(function(){try{var t=localStorage.getItem('studypack.theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Study Pack</title>
<meta name="description" content="${done} in-depth study guides and interview prep — programming, AI/ML, infrastructure, system design, the Forward Deployed Engineer path, and starting a business in India.">
<meta name="color-scheme" content="light dark">
<meta property="og:type" content="website">
<meta property="og:title" content="Study Pack">
<meta property="og:description" content="${done} in-depth study guides and interview prep — programming, AI/ML, infrastructure, system design, the Forward Deployed Engineer path, and starting a business in India.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%232563eb'/%3E%3Ctext x='32' y='45' font-family='Segoe UI,Arial,sans-serif' font-size='38' font-weight='700' fill='white' text-anchor='middle'%3ES%3C/text%3E%3C/svg%3E">
<style>${CSS}
.home .card .d{color:var(--muted);font-size:13px;margin:6px 0 12px;min-height:34px}
.home .lk a{font-weight:700;font-size:13px}.home .lk .sep{color:var(--line);margin:0 8px}
.home .pending{color:var(--muted);font-size:13px;font-style:italic}
.home h2 .ic{display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:var(--brand-soft);
  color:var(--brand);border-radius:8px;margin-right:12px;font-size:18px;vertical-align:middle}
.stat{display:flex;gap:28px;margin-top:22px}.stat b{font-size:30px;color:#fff;display:block}.stat span{opacity:.85;font-size:13px}
.search{position:sticky;top:0;z-index:5;background:var(--bg);padding:14px 0 10px;border-bottom:1px solid var(--line);margin-bottom:6px}
.search .srow{display:flex;gap:10px;align-items:stretch}
.search input{flex:1;min-width:0;padding:12px 16px;font:inherit;border:1px solid var(--line);border-radius:10px;background:var(--bg-soft);color:var(--ink)}
.search input:focus{outline:2px solid var(--brand-soft);border-color:var(--brand)}
.search .hint{font-size:12px;color:var(--muted);margin-top:6px}
.track summary .tcount{float:right;font-weight:600;font-size:12px;color:var(--muted)}
.tsteps{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.tstep{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--line);
  border-radius:999px;padding:5px 13px 5px 6px;font-size:13px;font-weight:600;color:var(--ink-soft)}
.tstep .n{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;
  background:var(--brand-soft);color:var(--brand-ink);font-size:11px;font-weight:800}
.tstep.off{opacity:.45}
.home section.hide,.home .card.hide{display:none}
@media (max-width:760px){.grid.c3,.grid.c2{grid-template-columns:1fr}.toc ol{columns:1}.stat{flex-wrap:wrap;gap:18px}}
</style></head><body class="home">
<header class="cover">
  <div class="kicker">Personal Study Pack</div>
  <h1>Study Pack</h1>
  <div class="subtitle">Comprehensive, diagram-rich study guides &amp; interview prep — programming, AI/ML, infrastructure, system design, the Forward Deployed Engineer path, and starting a business in India.</div>
  <div class="stat"><div><b>${done}</b><span>GUIDES</span></div><div><b>${cats.length}</b><span>CATEGORIES</span></div><div><b>${TRACKS.length}</b><span>LEARNING TRACKS</span></div><div><b>HTML + PDF</b><span>FORMATS</span></div></div>
</header>
<main class="wrap">
<div class="search no-print"><div class="srow">
<input id="q" type="search" placeholder="Filter guides — try &quot;kubernetes&quot;, &quot;GST&quot;, &quot;RAG&quot;, &quot;interview&quot;…" autocomplete="off">
<button class="themer" id="themeBtn" aria-label="Toggle colour theme"><span class="lt">Dark</span><span class="dk">Light</span></button>
</div><div class="hint" id="qh">${done} guides available.</div></div>
<div class="progress no-print">
  <div class="row"><b id="pgPct">0%</b><span class="sub" id="pgText">Nothing marked complete yet.</span><button id="pgReset">Reset progress</button></div>
  <div class="bar"><i id="pgBar"></i></div>
</div>
<div class="callout tip"><span class="t">How to use this pack</span>Each guide has an interactive <strong>HTML</strong> version (collapsible sections, colored code) and a printable <strong>PDF</strong>. Skim the Contents, work the code, then drill the Interview Questions at the end of each guide. Follow a <strong>track</strong> below if you want a sequenced path rather than a browse. Tick guides off as you finish them — progress is stored in this browser.</div>
<h2><span class="ic">▶</span>Learning Tracks</h2>
${trackHtml}
${sections}
<hr><p style="color:var(--muted);font-size:13px;text-align:center">Generated study material · rebuild with <code>node assets/build.js &amp;&amp; node assets/gen-index.js</code> · ${done} guides.</p>
</main>
<script>
(function(){
  var KEY='studypack.', root=document.documentElement;
  var tb=document.getElementById('themeBtn');
  if(tb)tb.addEventListener('click',function(){
    var t=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',t);
    try{localStorage.setItem(KEY+'theme',t);}catch(e){}
  });

  var q=document.getElementById('q'),h=document.getElementById('qh');
  var cards=[].slice.call(document.querySelectorAll('section[data-cat] .card'));
  var steps=[].slice.call(document.querySelectorAll('.tstep[data-slug]'));
  var secs=[].slice.call(document.querySelectorAll('section[data-cat]'));
  var catEls=[].slice.call(document.querySelectorAll('[data-cat-prog]'));
  var total=cards.length;

  if(q)q.addEventListener('input',function(){
    var v=q.value.trim().toLowerCase(),n=0;
    cards.forEach(function(c){
      var hit=!v||c.getAttribute('data-s').indexOf(v)>-1;
      c.classList.toggle('hide',!hit); if(hit)n++;
    });
    secs.forEach(function(s){ s.classList.toggle('hide',!s.querySelector('.card:not(.hide)')); });
    h.textContent=v?(n+' guide'+(n===1?'':'s')+' match "'+q.value.trim()+'".'):'${done} guides available.';
  });

  function read(){try{return JSON.parse(localStorage.getItem(KEY+'progress')||'{}');}catch(e){return {};}}
  function write(p){try{localStorage.setItem(KEY+'progress',JSON.stringify(p));}catch(e){}}

  function render(){
    var p=read(), n=0;
    cards.forEach(function(c){
      var d=!!p[c.getAttribute('data-slug')]; if(d)n++;
      c.classList.toggle('is-done',d);
      var m=c.querySelector('.mark');
      if(m){m.setAttribute('aria-pressed',d?'true':'false');m.title=d?'Mark as not done':'Mark as complete';}
    });
    steps.forEach(function(s){ s.classList.toggle('is-done',!!p[s.getAttribute('data-slug')]); });
    catEls.forEach(function(el){
      var cat=el.getAttribute('data-cat-prog');
      var inCat=cards.filter(function(c){return c.getAttribute('data-cat')===cat;});
      var d=inCat.filter(function(c){return !!p[c.getAttribute('data-slug')];}).length;
      el.textContent=d+' / '+inCat.length;
    });
    var pct=total?Math.round(n/total*100):0;
    document.getElementById('pgPct').textContent=pct+'%';
    document.getElementById('pgText').textContent=n?(n+' of '+total+' guides marked complete.'):'Nothing marked complete yet \u2014 tick the box on a card, or use "Mark complete" inside any guide.';
    document.getElementById('pgBar').style.width=pct+'%';
  }

  cards.forEach(function(c){
    var m=c.querySelector('.mark'); if(!m)return;
    m.addEventListener('click',function(){
      var p=read(), s=c.getAttribute('data-slug');
      if(p[s])delete p[s];else p[s]=Date.now();
      write(p); render();
    });
  });

  var rs=document.getElementById('pgReset');
  if(rs)rs.addEventListener('click',function(){
    if(confirm('Clear all completion marks? This cannot be undone.')){write({});render();}
  });

  render();
  addEventListener('storage',render);
  addEventListener('pageshow',render);
  addEventListener('focus',render);
})();
</script>
</body></html>`;
fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('index.html written —', done, 'guides linked.');

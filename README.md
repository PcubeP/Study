# Study Pack

A personal knowledge base — **68 in-depth guides** spanning AI/ML, software engineering, cloud and infrastructure, professional skills, starting a business in India, and investing in Indian markets. Each guide is a self-contained, print-ready HTML file with syntax-highlighted code, inline SVG diagrams, callouts, an auto-generated table of contents, and an interview-question or FAQ section.

**Live site:** https://pcubep.github.io/Study/

## Topics

**AI & ML** — LLMs · RAG · Prompt Engineering · AI Agents & MCP · LLM Evaluation & Guardrails · LangChain · HuggingFace · PyTorch · TensorFlow · Keras · scikit-learn · Deep Learning · ML Core Concepts · MLOps · Vector Databases

**Programming** — Python · JavaScript · TypeScript · Java · C/C++ · HTML & CSS · React · Node.js · Flutter · REST APIs · Rapid Prototyping (FastAPI/Streamlit/Gradio)

**Infrastructure & DevOps** — Linux & the Command Line · Docker & Kubernetes · CI/CD & IaC · Networking, Security & Enterprise Auth · Observability

**Data** — Data Engineering & Pipelines · Pandas · NumPy · Matplotlib & Seaborn · Jupyter & Anaconda · MySQL

**Cloud & Platforms** — Azure · Azure AI Services · SAP BTP · SAP AI Core · Enterprise Integration Patterns

**Career & Skills** — Forward Deployed Engineer Playbook · Consulting & Stakeholder Management · Technical Writing · Communication & Public Speaking

**Interview Prep** — Data Structures & Algorithms · System Design

**Business (India)** — Starting a Business · Compliance & Taxation · Startup Funding & Equity · Finance, Banking & HR Ops · Freelancing & Consulting · Contracts, IP & Legal

**Investing & Markets (India)** — Investing Foundations · How the Indian Stock Market Works · Analysing a Stock · Mutual Funds, SIPs & Index Investing · Futures & Options · Trading Strategy, Risk & Psychology · Portfolio Construction · Taxation & Regulation for Investors · Market Data & Research Sources · Market Snapshot & First Year

## Reading

Open the live site, or `index.html` locally. The landing page has a search filter and five curated **learning tracks** (Forward Deployed Engineer, AI/ML Engineer, Founder/Business India, Investing & Markets India, Interview Sprint) if you want a sequenced path rather than a browse.

Every guide is available as **HTML** (interactive, collapsible sections) and **PDF** (A4, print-optimised).

- **Dark mode** — toggle in the top bar of any page. Follows your OS preference until you choose explicitly; the choice is remembered.
- **Progress tracking** — tick a guide off from its card on the index, or with *Mark complete* inside the guide. The index shows overall and per-category progress, and completed guides are highlighted inside the learning tracks. Progress lives in `localStorage` under `studypack.progress`, so it is per-browser and never leaves your machine.
- **Reading position** — each guide shows a scroll-progress bar under the top bar.

Printing always uses the light theme regardless of what is on screen.

## Repository layout

```
index.html                   generated landing page
guides/<slug>.html           generated, self-contained study guides
guides/<slug>.pdf            print-ready PDFs
_content/<slug>.body.html    source content fragment for each guide
_content/<slug>.meta.json    subtitle + tags
assets/topics.json           master manifest (slug, title, category, focus)
assets/study.css             design system shared by every page (light + dark)
assets/build.js              _content -> guides/*.html
assets/gen-index.js          topics.json + guides -> index.html
assets/make-pdfs.js          guides/*.html -> guides/*.pdf (headless Edge/Chrome)
.github/workflows/pages.yml  rebuilds and deploys to GitHub Pages on every push to main
```

## Rebuilding

```bash
cd assets && npm install && cd ..     # once, installs highlight.js
node assets/build.js                  # all guides (or: node assets/build.js python rag)
node assets/gen-index.js              # landing page
node assets/make-pdfs.js              # PDFs for guides that don't have one
node assets/make-pdfs.js --force rag  # regenerate a specific PDF after editing
```

To add a topic: add an entry to `assets/topics.json`, write `_content/<slug>.body.html` and `_content/<slug>.meta.json`, then run the three commands above.

## Publishing

Deployment is automated by [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Every push to `main` reinstalls the build dependencies, regenerates `guides/*.html` from `_content/`, rebuilds `index.html`, fills in any missing PDFs, verifies that every slug in `topics.json` produced a page, and publishes the result to GitHub Pages.

That means you only have to commit `_content/` changes — the generated HTML is rebuilt server-side. Building locally is still worth it so you can preview before pushing.

**One-time setup:** Settings → Pages → Source → **GitHub Actions**.

`.nojekyll` is present so the files are served as-is — without it Jekyll would skip the `_content/` directory. To regenerate every PDF on the runner (slow), run the workflow manually from the Actions tab with *Rebuild every PDF* ticked.

## Disclaimer

The India business, tax and legal guides are educational material, not professional advice. Rates, thresholds and filing deadlines change with every Union Budget — verify against the official portal before acting, and engage a qualified CA, CS or lawyer for your own facts.

The **Investing & Markets** guides are financial education, **not investment advice**. Nothing in them is a recommendation to buy or sell any security, fund or asset class. Investments in securities markets are subject to market risk; you can lose money, including your entire capital. Past performance does not predict future returns. The market snapshot in *Market Snapshot & Your First Year Investing* is dated **21 October 2026** and will be stale — that guide includes a 30-minute routine for rebuilding it yourself. Consult a SEBI-registered Investment Adviser and a qualified chartered accountant before acting on anything in this section.

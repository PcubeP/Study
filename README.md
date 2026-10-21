# Study Pack

A personal knowledge base — **58 in-depth guides** spanning AI/ML, software engineering, cloud and infrastructure, professional skills, and starting a business in India. Each guide is a self-contained, print-ready HTML file with syntax-highlighted code, inline SVG diagrams, callouts, an auto-generated table of contents, and an interview-question section.

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

## Reading

Open the live site, or `index.html` locally. The landing page has a search filter and four curated **learning tracks** (Forward Deployed Engineer, AI/ML Engineer, Founder/Business India, Interview Sprint) if you want a sequenced path rather than a browse.

Every guide is available as **HTML** (interactive, collapsible sections) and **PDF** (A4, print-optimised).

## Repository layout

```
index.html                   generated landing page
guides/<slug>.html           generated, self-contained study guides
guides/<slug>.pdf            print-ready PDFs
_content/<slug>.body.html    source content fragment for each guide
_content/<slug>.meta.json    subtitle + tags
assets/topics.json           master manifest (slug, title, category, focus)
assets/study.css             design system shared by every page
assets/build.js              _content -> guides/*.html
assets/gen-index.js          topics.json + guides -> index.html
assets/make-pdfs.js          guides/*.html -> guides/*.pdf (headless Edge/Chrome)
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

The site is plain static HTML served straight from the repository root — no build step runs on GitHub. `.nojekyll` is present so GitHub Pages serves the files as-is (without it, Jekyll would skip the `_content/` directory). To publish: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.

## Disclaimer

The India business, tax and legal guides are educational material, not professional advice. Rates, thresholds and filing deadlines change with every Union Budget — verify against the official portal before acting, and engage a qualified CA, CS or lawyer for your own facts.

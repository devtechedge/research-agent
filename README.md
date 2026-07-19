# LymeWatch 🔬

> **Long-Horizon Autonomous Daily Chronic Lyme & PTLDS Research Intelligence Suite**
> *Zero-Cost Autonomous Multi-Agent System ($0.00/month architectural directive)*

---

## 📖 Overview

**LymeWatch** is a full-stack research intelligence application designed to autonomously scour and synthesize the latest medical advancements, clinical trials, and integrative botanical research surrounding chronic Lyme disease and Post-Treatment Lyme Disease Syndrome (PTLDS). 

It leverages **Google Gemini 3.5 Flash with Google Search Grounding** to discover newly published scientific literature, clinical trial registrations, and complementary therapies, storing findings in a structured local entity memory directory.

---

## ✨ Features

- **🌓 Persistent Light/Dark UI Theme**: Fully polished user interface with responsive layout animations and a persistent theme selector (saved via `localStorage`).
- **🔍 Gemini 3.5 Flash Search Grounding**: Direct real-time medical literature querying with dynamic citations and clickable verified source URLs.
- **🛡️ Auto-Adaptive Quota Planning**: A 5-stage research pipeline that probes available Gemini API headroom dynamically to optimize performance without exceeding free tier limitations.
- **📊 Interactive Data Visualizations**: Real-time evidence credibility rankings and knowledge base category distribution charts rendered with `Recharts`.
- **📂 Structured Medical Entity Memory**: Auto-populating file-based JSON database mapping key research developments across **Drugs**, **Botanicals**, **Clinical Trials**, and **Researchers**.
- **✉️ Daily HTML Email Compilation**: Beautiful, mobile-responsive HTML research digests designed to be dispatched to configured clinical/patient recipients at 8:00 PM Daily.
- **🪵 Complete Audit Trail**: Live execution trace logging representing a real-time stream of all autonomous actions.

---

## 🛠️ Architecture & System Design

### 5-Stage Research Loop (`/server/agent.ts`)
1. **Probe**: Checks and parses Gemini API quota headroom to adaptively determine computational budgets (`rich`, `lean`, or `strict`).
2. **Planning**: Formulates specialized medical search targets for current research indexes.
3. **Execution**: Spawns concurrent grounding searches for both conventional medications (antibiotics, persister drugs) and holistic botanicals (Buhner/Cowden programs, *Cryptolepis*, etc.).
4. **Parsing**: Identifies new medical entities mentioned and upserts/merges them into the memory database while accumulating evidence weight.
5. **Synthesis**: Directs Gemini to conduct Yesterday-to-Today Delta analyses, format spotlight watchlists, and compile an inline-styled rich HTML email digest.

---

## 📂 File Structure

```bash
├── server.ts              # Full-stack Express entrypoint & API Router
├── lyme_database.json     # File-based JSON database (Entities, Settings, Digests, Logs)
├── server/
│   ├── agent.ts           # 5-Stage Autonomous Agent & HTML Email Synthesizer
│   └── db.ts              # Local database wrapper and initial seeds
├── src/
│   ├── App.tsx            # Modern React SPA styled with Tailwind CSS
│   ├── types.ts           # Standardized TypeScript type definitions
│   └── index.css          # Global Tailwind and font definitions
├── package.json           # Dependencies and build scripts
└── tsconfig.json          # TypeScript build configuration
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Returns system rate limits, target email, and live audit logs |
| `GET` | `/api/entities` | Fetches parsed medical entity directory |
| `GET` | `/api/digests` | Retrieves chronological history of daily research runs |
| `POST`| `/api/settings` | Updates the research recipient's target email |
| `POST`| `/api/run` | Triggers a manual execution of the research agent |
| `POST`| `/api/custom-search` | Performs direct grounding search in the medical sandbox |
| `POST`| `/api/test-email` | Dispatches an HTML digest test email using OAuth credentials |

---

## 🚀 Running Locally

### 1. Prerequisite Environment Variables
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on port **3000** with hot reloading enabled for both client-side assets and backend API changes.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🛡️ License

SPDX-License-Identifier: **Apache-2.0**

<p align="center">
  <img src="https://img.shields.io/badge/HackHazards-'26-blueviolet?style=for-the-badge" alt="HackHazards '26" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-black?style=for-the-badge" alt="Platforms" />
  <img src="https://img.shields.io/badge/Data-Local--First-informational?style=for-the-badge" alt="Local First" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20on%20Render-009688?style=for-the-badge" alt="Backend" />
</p>

# 💊 CASCADEX

### *"See the chain reaction before it happens."*

**Cascadex** is a clinical-grade graph intelligence platform that detects **multi-hop drug interaction chains** that evade traditional pairwise medical lookups. By modelling the human metabolic system as a live biochemical graph, Cascadex catches the invisible chain reactions responsible for over 125,000 preventable drug-related tragedies every year.

Built for HackHazards '26.

---

## 🧬 The Problem

Every existing medical tool — Drugs.com, Epocrates, Medscape — performs simple one-to-one lookups: *"Does Drug A react with Drug B?"*

But the human body doesn't work in pairs. It operates as a deeply interconnected biochemical network.

**The Deadly Blind Spot — a real example:**

> A patient is prescribed **Fluoxetine** (an antidepressant). It strongly inhibits the `CYP2D6` enzyme in the liver.  
> The same patient is prescribed **Codeine** (a painkiller). Codeine is a prodrug — it *must* be metabolised by `CYP2D6` into morphine to take effect.  
> Because CYP2D6 is blocked by Fluoxetine, Codeine cannot be processed. It accumulates in the bloodstream. The patient goes from feeling no pain relief to experiencing **opioid toxicity** — and no standard drug interaction checker flagged it, because it checked pairs, not chains.

This is a **three-node graph traversal problem**: Fluoxetine → `CYP2D6` → Codeine. No pairwise lookup will ever detect it.

---

## 💡 The Innovation

**Drug interactions are graph traversal problems, not database lookups.**

Cascadex models the human metabolic system as a property graph:
- **Drugs** as nodes
- **CYP450 enzymes** as shared pathway nodes
- **Inhibits**, **Induces**, and **Substrate of** as typed relationships

By running **multi-hop Cypher traversals** across this graph in **Neo4j AuraDB**, Cascadex detects dangerous interaction chains that span 3, 4, or even 5 hops — impossible for any simple A-to-B lookup engine.

**Groq's Llama-3.1-70b** then translates the raw graph results into plain, actionable language — *"Fluoxetine blocks the enzyme your body needs to safely process Codeine. This combination can cause dangerous morphine build-up."*

---

## 🔒 Privacy-First & Local Architecture

Cascadex is **fully local-first** — no accounts, no login, no email, no passwords.

| What | How |
|---|---|
| **Device Identity** | A UUID is generated once on first launch and stored in MMKV (encrypted on-device storage) |
| **Medication Data** | Stored entirely on your device via Zustand + MMKV persistence — survives app restarts |
| **Interaction Queries** | Sent to the backend as anonymous graph queries (no user identity attached) |
| **AI Explanations** | Groq API called server-side; only drug names are sent, never patient data |
| **Reset** | "Reset App Data" on the Profile tab wipes everything and generates a new device ID |

The backend never stores or receives any personal information — it is a **pure drug-graph query engine**.

---

## 🚀 How to Use Cascadex

### For Patients — The Mobile App

The Expo / React Native mobile app puts clinical-grade intelligence directly in your pocket. **No sign-up required.**

1. **Open the app** — you land directly on your personal metabolic graph. No login screen, no friction.
2. **Scan Your Medication** — use the built-in camera scanner to read the NDC barcode on your pill bottle. Cascadex identifies the exact drug via the FDA NDC database in real time.
3. **Visualise Your Graph** — watch the drug integrate into your personal interactive metabolic graph, rendered live using React Native Skia.
4. **Get Alerted** — if a multi-hop interaction chain is detected, a severity-graded alert (Critical / Moderate / Minor) pulses on screen.
5. **Understand the Risk** — tap any alert to read a plain-English AI explanation: exactly which enzymes are involved, why the interaction is dangerous, and what to tell your doctor.
6. **Track Your History** — every medication addition and removal is logged locally with timestamps.
7. **Simulate Before Adding** — the simulate view lets you check what interactions *would* occur if you added a new drug, before actually adding it.

### For Clinicians — The Pharmacist Dashboard

A companion web dashboard for clinical oversight (FastAPI `/admin/*` endpoints, connect via any frontend).

1. **Triage at a Glance** — view all patients ranked by risk score, with critical-alert counts front and centre.
2. **Patient Detail** — drill into a patient's full medication list and interaction graph.
3. **Prescribe-Check** — before writing a new prescription, simulate adding the proposed drug. The system runs a full graph traversal and returns any interaction chains that *would* be created — before the patient takes a single dose.
4. **High-Risk Filter** — instantly surface only patients with severe or complex polypharmacy situations.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                            CASCADEX SYSTEM                              │
│                                                                         │
│  ┌─────────────────────┐    REST/JSON    ┌──────────────────────────┐   │
│  │  Expo Mobile App     │ ─────────────▶ │   FastAPI Backend         │   │
│  │  React Native        │                │   Python 3.12             │   │
│  │  iOS & Android       │                │   Render Cloud (free)     │   │
│  │                      │                │                           │   │
│  │  · No auth / login   │                │  Routes:                  │   │
│  │  · MMKV local store  │                │  /api/drugs       search  │   │
│  │  · Anonymous UUID    │                │  /api/patient     CRUD    │   │
│  │  · Zustand state     │                │  /api/interactions graph  │   │
│  │  · Skia graph viz    │                │  /api/explain     AI      │   │
│  │  · Expo Camera scan  │                │  /api/admin       portal  │   │
│  └─────────────────────┘                └──────────┬───────────────┘   │
│                                                     │                   │
│                              ┌──────────────────────┼──────────────┐    │
│                              ▼                      ▼              ▼    │
│                    ┌─────────────────┐   ┌──────────────┐  ┌──────────┐ │
│                    │  Neo4j AuraDB   │   │  Groq API    │  │ FDA NDC  │ │
│                    │  Graph Database │   │  Llama-3.1   │  │  Search  │ │
│                    │                 │   │  -70b        │  │          │ │
│                    │  Drug nodes     │   │  AI explain  │  │  Drug ID │ │
│                    │  Enzyme nodes   │   │  sub-second  │  │  lookup  │ │
│                    │  Multi-hop      │   └──────────────┘  └──────────┘ │
│                    │  Cypher queries │                                   │
│                    └─────────────────┘                                   │
│                                                                         │
│  Data Pipeline (one-time seed):  DrugBank XML · KEGG · FDA             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Cascadex/
├── apps/
│   ├── mobile/                    # Expo React Native app
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (patient)/     # All patient screens (tabs, add-med, chain detail)
│   │       │   └── index.tsx      # Root redirect → (patient)/(tabs)
│   │       ├── store/
│   │       │   ├── app.store.ts   # Local UUID patientId + display name (MMKV)
│   │       │   └── patient.store.ts # Medications, history, alerts (MMKV persisted)
│   │       ├── api/               # Axios client + typed API modules
│   │       ├── components/        # UI: GlowButton, DrugGraphCanvas, DangerBadge…
│   │       └── services/          # Drug mock data, notification service
│   └── pipeline/                  # Drug data ingestion scripts
├── packages/
│   ├── api/                       # FastAPI backend
│   │   ├── routers/               # drugs, patient, interactions, explain, admin
│   │   ├── services/              # Neo4j, Groq, cache services
│   │   └── models/                # Pydantic request/response models
│   └── graph/                     # Neo4j seed data & Cypher query tests
└── .github/workflows/
    ├── backend-ci.yml             # Ruff lint + pytest (reusable + push trigger)
    ├── backend-deploy.yml         # CI gate → Render deploy hook
    ├── mobile-build.yml           # TypeScript check + EAS build on main
    ├── graph-test.yml             # Cypher query regression tests
    └── pipeline-ci.yml            # Pipeline source validation
```

---

## 🏆 Hackathon Track Coverage

| Track | Integration |
|---|---|
| ✅ **Expo** | Full React Native mobile app — Expo Camera (NDC barcode scan), Expo Router (file-based navigation), React Native Skia (live graph visualization), Expo Haptics, MMKV local storage |
| ✅ **Neo4j AuraDB** | Drug → CYP450 Enzyme → Metabolite property graph. Multi-hop Cypher traversal is the **core innovation** — detects 3+ node interaction chains in milliseconds |
| ✅ **Groq** | Sub-second AI explanation of complex interaction chains. Llama-3.1-70b translates raw graph traversal output into plain English your patient can understand |

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- Python 3.12+
- A Neo4j AuraDB instance (or local Docker: `docker-compose up`)
- Expo Go app on your device, or an iOS/Android simulator

### Backend API
```bash
cd packages/api

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp ../../.env.example ../../.env

# Run the development server
uvicorn main:app --reload --port 8000
```

### Seed the Graph Database
```bash
cd packages/graph
pip install -r requirements.txt
python seed_demo_data.py   # Seeds demo-patient-001 with Fluoxetine + Codeine + others
```

### Mobile App
```bash
cd apps/mobile
npm install
npx expo start
```

> **No environment variables are needed for the mobile app.** By default it connects to the live hosted backend at `https://cascadex-api.onrender.com`. To point at your local backend, update `BASE_URL` in `src/api/client.ts`.

### Run Backend Tests
```bash
cd packages/api
python -m pytest tests/ -v --tb=short
```

---

## ⚠️ Medical Disclaimer

> **IMPORTANT:** Cascadex is a decision-support tool for educational and demonstration purposes only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or licensed pharmacist before making any changes to your medication regimen. Drug interaction data is sourced from open-access datasets and may not reflect all known interactions or the most current clinical evidence.

---

<p align="center">
  <b>Cascadex</b> · HackHazards '26 · Built with Neo4j · Groq · Expo
</p>

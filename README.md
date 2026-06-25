<p align="center">
  <img src="https://img.shields.io/badge/HackHazards-'26-blueviolet?style=for-the-badge" alt="HackHazards '26" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-black?style=for-the-badge" alt="Platforms" />
  <img src="https://img.shields.io/badge/Data-Local--First-informational?style=for-the-badge" alt="Local First" />
</p>

# 💊 CASCADEX

### *"See the chain reaction before it happens."*

**Cascadex** is a clinical-grade graph intelligence platform that detects multi-hop drug interaction chains that evade traditional pairwise medical lookups. By modeling the human metabolic system as a live biochemical graph, Cascadex catches the invisible reactions responsible for over 125,000 preventable tragedies every year.

---

## 🧬 The Problem

Every existing medical tool (Drugs.com, Epocrates, Medscape) performs simple one-to-one lookups: *"Does Drug A react with Drug B?"*

But the human body doesn't work in pairs. It operates as a complex, interconnected network.

**The Deadly Blind Spot:**
1. A patient takes **Fluoxetine**. It inhibits the `CYP2D6` enzyme.
2. The patient takes **Codeine**. Codeine *requires* `CYP2D6` to be metabolized.
3. Because the enzyme is blocked, Codeine accumulates in the bloodstream — rapidly reaching toxic, life-threatening levels.

This is a **chain reaction through the metabolic graph** — and no simple A-to-B lookup will ever catch it.

## 💡 The Innovation

Drug interactions are **graph traversal problems.**  
Cascadex traverses the live biochemical graph using **Neo4j AuraDB** to detect multi-hop interaction chains in milliseconds. **Groq's Llama-3.1-70b** then translates these complex graph results into plain, actionable English.

---

## 🔒 Privacy-First & Local Architecture

Cascadex is **fully local-first** — no accounts, no login, no email.

- A **unique anonymous device ID** (UUID) is generated once on first launch and stored on-device using MMKV.
- All medications, history, and interaction data are **persisted locally** on your phone — nothing is tied to a user identity on any server.
- The backend is used purely for **drug graph queries and AI explanations** — it never receives personal identity data.
- You can wipe everything and generate a fresh device ID at any time from the Profile tab.

---

## 🚀 How to Use Cascadex

### For Patients: The Cascadex Mobile App

The mobile app (Expo / React Native) puts clinical-grade intelligence directly in your pocket — no sign-up required.

1. **Open the app** — you're taken straight to your personal metabolic graph. No login screen.
2. **Scan Your Medication:** Use the built-in camera scanner to read the barcode (NDC) on your pill bottle. Cascadex instantly identifies the drug via the FDA database.
3. **Visualize Your Graph:** Watch your medication integrate into your interactive metabolic graph, rendered in real-time with Skia.
4. **Get Alerted:** If a multi-hop interaction is detected, a critical alert pulses on screen.
5. **Understand the Danger:** Tap an alert to read a plain-English AI explanation — exactly which enzymes are blocked and why it matters.
6. **Your data persists:** Add and remove medications freely. Everything survives app restarts, stored locally on your device.

### For Clinicians: The Pharmacist Portal

A real-time dashboard for clinical oversight.

1. **Triage at a Glance:** View a live Kanban board of patients, instantly highlighting those with severe metabolic clashes.
2. **Deep Dive:** Click a patient profile to view their full Neo4j interaction graph.
3. **Prescribe-Check:** Before writing a new prescription, simulate the addition of a proposed drug. Cascadex runs a graph traversal and warns of chain reactions *before* the script is signed.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                          CASCADEX SYSTEM                            │
│                                                                     │
│  ┌───────────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │   Expo Mobile App  │──▶│  FastAPI Backend  │──▶│ Neo4j AuraDB   │  │
│  │   (iOS / Android)  │   │  (Python 3.12)   │   │ Graph Database │  │
│  │                    │   │  Render Cloud    │   │                │  │
│  │  ● Local-first     │   │  No auth layer   │   └────────────────┘  │
│  │  ● MMKV storage    │   │  Drug graph only │          │            │
│  │  ● Anonymous UUID  │   └──────────────────┘   ┌──────┴──────┐    │
│  └───────────────────┘          │                │  Groq API   │    │
│                                 │                │ (Llama-3.1  │    │
│  ┌───────────────────┐          │                │   -70b)     │    │
│  │  Base44 Pharmacist │◀─────────┘                └─────────────┘    │
│  │  Portal           │  FastAPI /admin/* endpoints                   │
│  └───────────────────┘                                               │
│                                                                     │
│  Data Pipeline: DrugBank XML · KEGG · FDA NDC                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Cascadex/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS & Android)
│   │   └── src/
│   │       ├── app/     # Expo Router screens — (patient) only, no (auth)
│   │       ├── store/   # Zustand stores (app.store, patient.store) + MMKV
│   │       ├── api/     # Axios client + typed API modules
│   │       └── services/# Mock drug data, notification service
│   └── pipeline/        # Drug data ingestion pipeline
├── packages/
│   ├── api/             # FastAPI backend — drug graph, interactions, AI explain
│   └── graph/           # Neo4j seed data & Cypher queries
└── .github/workflows/   # CI/CD — backend-ci, backend-deploy, mobile-build
```

---

## 🏆 Hackathon Track Coverage

| Track | Integration |
|---|---|
| ✅ **Expo** | React Native mobile app with camera barcode scanner, Skia graph visualization, MMKV local storage, and haptics |
| ✅ **Neo4j AuraDB** | Drug → CYP450 Enzyme → Metabolite graph with multi-hop Cypher traversal as the core innovation |
| ✅ **Base44** | Pharmacist portal for patient risk review, prescribe-checking, and high-risk Kanban alerts |
| ✅ **Groq** | Sub-second inference of plain-English interaction explanations via Llama-3.1-70b |

---

## 🛠️ Local Development

### Backend API
```bash
cd packages/api
pip install -r requirements.txt
uvicorn main:app --reload
```

### Mobile App
```bash
cd apps/mobile
npm install
npx expo start
```

> **Note:** No environment variables are required for the mobile app. It connects to the hosted backend at `https://cascadex-api.onrender.com` by default.

---

## ⚠️ Medical Disclaimer

> **IMPORTANT:** Cascadex is a decision-support tool for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult your physician or licensed pharmacist before making any changes to your medications. Drug interaction data is sourced from open-access datasets and may not reflect all known interactions.

---

<p align="center">
  <b>Cascadex</b> · HackHazards '26 · Built with Neo4j · Groq · Expo · Base44
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HackHazards-'26-blueviolet?style=for-the-badge" alt="HackHazards '26" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20API-black?style=for-the-badge" alt="Platforms" />
</p>

# 💊 Cascadex

**Cascadex is a graph-powered drug interaction intelligence platform that detects multi-hop medication risk chains and explains them in plain language for patients and clinicians.**

> _"See the chain reaction before it happens."_

Traditional interaction checkers focus on one drug pair at a time. Cascadex models drug, enzyme, and metabolic relationships as a connected graph in Neo4j, then traverses that graph to surface indirect risks that pairwise checks miss.

---

## Why Cascadex

- **Multi-hop risk detection:** Finds chain reactions across several biochemical relationships, not just A↔B checks.
- **Graph-native reasoning:** Uses Neo4j traversal for patient-specific risk discovery.
- **Actionable explanations:** Uses Groq LLM output to translate complex pathways into understandable summaries.
- **Two user experiences:**
  - **Patient app (Expo/React Native):** medication scan, alerts, graph view, and history.
  - **Clinician/admin APIs:** patient risk monitoring and prescribe-check endpoints.

---

## System architecture

```text
Mobile App (Expo) ──▶ FastAPI Backend ──▶ Neo4j (AuraDB/local)
                           │
                           ├──▶ Groq (natural-language explanations)
                           └──▶ External data integrations (FDA, RxNorm, KEGG)
```

---

## Monorepo layout

```text
Cascadex/
├── apps/
│   ├── mobile/              # Expo React Native app
│   └── pipeline/            # Python ingestion + graph update scripts
├── packages/
│   ├── api/                 # FastAPI backend service
│   ├── graph/               # Neo4j scripts and query validation utilities
│   └── shared/              # Shared TypeScript types
├── .github/workflows/       # CI workflows
├── docker-compose.yml       # Local API + Neo4j setup
└── .env.example             # Environment variable template
```

---

## Quick start

### 1) Prerequisites

- Python 3.12+
- Node.js 20+
- npm 10+
- Neo4j AuraDB account (or local Neo4j via Docker)
- Groq API key

### 2) Configure environment

```bash
cp .env.example .env
```

Fill required values in `.env`:

- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `GROQ_API_KEY`

### 3) Run with Docker Compose (backend + local Neo4j)

```bash
docker compose up --build
```

API health check:

```bash
curl http://localhost:8000/health
```

---

## Local development

### Backend API (`packages/api`)

```bash
cd packages/api
pip install -r requirements.txt
PYTHONPATH=../.. uvicorn packages.api.main:app --reload --port 8000
```

Open API docs at `http://localhost:8000/docs`.

### Mobile app (`apps/mobile`)

```bash
cd apps/mobile
npm ci
npm run start
```

### Data pipeline (`apps/pipeline`)

```bash
cd apps/pipeline
pip install -r requirements.txt
python main.py --help
```

---

## Testing and quality checks

### Python linting

```bash
ruff check packages/api/ --config pyproject.toml
ruff check apps/pipeline/ --config pyproject.toml
```

### Backend tests

```bash
cd packages/api
PYTHONPATH=../.. python -m pytest tests/ -v --tb=short
```

> Note: backend tests require configured env vars for Neo4j and Groq.

### Mobile type check

```bash
cd apps/mobile
npx tsc --noEmit
```

---

## Core API surface (high level)

- `/health`
- `/api/drugs/*` (lookup and barcode workflows)
- `/api/patient/*` (patient creation, medications, alerts, graph)
- `/api/interactions/*` (interaction retrieval and simulation)
- `/api/graph/*` (patient graph and enzyme-focused views)
- `/api/explain/*` (LLM-powered explanations)
- `/api/admin/*` (clinician/admin oversight endpoints)

---

## Medical disclaimer

Cascadex is a decision-support tool for educational and research workflows. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified clinicians before making medication decisions.

---

<p align="center">
  Built with Neo4j · FastAPI · Expo · Groq
</p>

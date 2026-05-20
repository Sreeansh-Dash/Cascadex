# CASCADEX — Master Build Plan
## HackHazards '26 | Antigravity Agent Instruction File
> **Project:** Cascadex — Drug Metabolic Pathway Intelligence  
> **Deadline:** June 30, 2026 | **Today:** May 18, 2026 | **Time Remaining:** ~6 weeks  
> **Read this entire file before writing a single line of code.**

---

## WHY THE NAME "CASCADEX"

A cascade is precisely what happens inside the human body when drugs interact: one enzyme gets blocked, which cascades into a metabolite buildup, which cascades into receptor overstimulation, which cascades into a clinical emergency. The "-dex" suffix is a real pharmaceutical naming convention (Appendex, Opti-Dex, Carbidex) — so the name sounds like a legitimate clinical product, not a hackathon side project. It's short, memorable, and instantly implies both the biochemical mechanism and the indexing/intelligence layer on top.

**Tagline:** *"See the chain reaction before it happens."*

---

## SECTION 0 — AGENT OPERATING RULES

These rules apply to every agent working on this codebase:

1. **Never use placeholder data where real API data is available.** DrugBank, KEGG, FDA, RxNorm APIs are all free. Use them.
2. **Neo4j is the reasoning engine, not the storage layer.** Every core feature must use a Cypher traversal query, not a simple node lookup. If you're doing `MATCH (d:Drug {name: $name}) RETURN d`, you're doing it wrong.
3. **Groq explains, Neo4j finds.** The graph finds the interaction chain. Groq translates it to human language. Never ask Groq to deduce a drug interaction from its training data.
4. **Expo-first mobile design.** Every screen must work on a 390px iPhone screen AND a 412px Android screen. Test both.
5. **Base44 portal is real.** Do not mock the pharmacist portal. Build the REST endpoints it calls and verify them.
6. **Every file must have a module-level docstring** explaining what it does and what API/service it touches.
7. **Environment variables only.** No hardcoded API keys, URIs, or credentials anywhere.
8. **The demo must work offline for core features.** Cache the patient's drug graph locally so the app doesn't break if the backend is slow.

---

## SECTION 1 — SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CASCADEX SYSTEM                               │
│                                                                         │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────┐   │
│  │  Expo Mobile │    │   FastAPI Backend │    │   Neo4j AuraDB       │  │
│  │   iOS/Android│───▶│   (Python 3.12)  │───▶│   Graph Database     │  │
│  │  React Native│    │   Railway Deploy  │    │   (Free Tier)        │  │
│  └──────────────┘    └──────────────────┘    └──────────────────────┘   │
│         │                     │                         │               │
│         │              ┌──────┴──────┐          ┌───────┴──────┐        │
│         │              │  Groq API   │          │  Data Pipeline│       │
│         │              │  (llama-3.1 │          │  (Python CLI) │       │
│         │              │   -70b)     │          │  DrugBank XML │       │
│         │              └─────────────┘          │  KEGG REST    │       │
│         │                                       │  FDA OpenFDA  │       │
│  ┌──────┴──────┐                                └───────────────┘       │
│  │  Base44     │◀── HTTP Connector ─── FastAPI /admin/* endpoints       │
│  │  Pharmacist │                                                        │
│  │  Portal     │                                                        │
│  └─────────────┘                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Monorepo Structure
```
cascadex/
├── apps/
│   ├── mobile/               # Expo React Native app
│   └── pipeline/             # Data ingestion scripts (Python)
├── packages/
│   ├── api/                  # FastAPI backend
│   ├── graph/                # Neo4j Cypher queries + driver wrapper
│   └── shared/               # Shared TypeScript types
├── .github/
│   └── workflows/            # CI/CD GitHub Actions
├── docker-compose.yml        # Local dev: Neo4j + API
├── .env.example
└── master_plan.md            # This file
```

---

## SECTION 2 — DESIGN SYSTEM & VISUAL IDENTITY

### Design Philosophy
Cascadex sits at the intersection of clinical precision and human urgency. The aesthetic is **"Biopunk Clinical"** — think the visual language of a high-end diagnostics lab crossed with a sci-fi neural scanner. Dark backgrounds (not pure black — deep navy/slate), glowing graph edges in amber/orange (danger) and teal (safe), monospaced type for data, humanist sans-serif for narrative. Every screen should feel like you're looking at a live biological system, not a pharmacy app.

### Color Palette
```
/* CSS Variables — use these everywhere */
--color-bg-primary:      #080D14;   /* deep space navy — main background */
--color-bg-surface:      #0E1521;   /* card/panel surfaces */
--color-bg-elevated:     #141E2E;   /* modals, sheets */
--color-bg-border:       #1E2E42;   /* dividers and borders */

--color-danger-strong:   #FF4500;   /* critical interaction — red-orange */
--color-danger-glow:     rgba(255, 69, 0, 0.25);
--color-warn-strong:     #F59E0B;   /* moderate interaction — amber */
--color-warn-glow:       rgba(245, 158, 11, 0.20);
--color-safe-strong:     #00E5B4;   /* no interaction — teal */
--color-safe-glow:       rgba(0, 229, 180, 0.18);

--color-text-primary:    #E8EFF8;   /* main text — off-white */
--color-text-secondary:  #7A90A8;   /* labels, captions */
--color-text-muted:      #3D5470;   /* placeholders */

--color-graph-node-drug: #4A9EFF;   /* drug nodes — electric blue */
--color-graph-node-enzyme: #A78BFA; /* enzyme nodes — violet */
--color-graph-node-metabolite: #34D399; /* metabolite — emerald */
--color-graph-node-receptor: #F472B6; /* receptor — rose */

--color-accent:          #4A9EFF;   /* interactive elements */
--color-accent-glow:     rgba(74, 158, 255, 0.20);
```

### Typography
```
Display font:   "Syne" (Google Fonts) — geometric, clinical, modern
Body font:      "IBM Plex Sans" — humanist, readable, tech-adjacent  
Mono font:      "IBM Plex Mono" — for enzyme names, drug IDs, Cypher snippets
```

Import in web contexts:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

For Expo (React Native), use `expo-font` to load these; fallback to `SF Pro Display` on iOS and `Roboto` on Android only if fonts fail to load.

### Animation Principles
- **Graph build animation:** When a patient's drug graph renders, nodes should fade in one by one with a 80ms stagger, then edges draw in with a path animation (stroke-dashoffset). This takes ~1.2s total. Never pop everything in at once.
- **Danger pulse:** Critical interaction edges pulse with a subtle glow animation (`box-shadow` / SVG filter oscillation) on a 2s loop. Amber edges pulse slower (3s). Teal edges are static.
- **Screen transitions:** Use shared element transitions (React Navigation's `sharedElementTransition`) when tapping a drug node → its detail screen. The node expands into the screen header.
- **Barcode scan overlay:** Animated corner brackets that "lock on" when a barcode is detected, with a green scan line sweeping across. Use `Animated.Value` with `Animated.loop`.
- **AI explanation entrance:** Groq explanation text types in character-by-character (typewriter effect, ~30ms per character) to emphasize it's being generated in real time.
- **Loading state:** A biomorphic pulsing blob in the brand teal/amber palette while graph queries run. Never use a spinner alone.

### Component Design Tokens
```typescript
// apps/mobile/src/theme/tokens.ts
export const TOKENS = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 40,
    xxl: 64,
  },
  shadow: {
    glow_danger: {
      shadowColor: '#FF4500',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    glow_safe: {
      shadowColor: '#00E5B4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
  },
};
```

---

## SECTION 3 — EXPO MOBILE APP

### Tech Stack (Mobile)
```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-camera": "~16.0.0",
  "expo-barcode-scanner": "~13.0.0",
  "expo-notifications": "~0.29.0",
  "expo-font": "~13.0.0",
  "expo-haptics": "~14.0.0",
  "expo-linear-gradient": "~14.0.0",
  "expo-blur": "~14.0.0",
  "react-native-reanimated": "~3.15.0",
  "react-native-gesture-handler": "~2.20.0",
  "react-native-svg": "~15.8.0",
  "react-native-webview": "~13.12.0",
  "@shopify/react-native-skia": "^1.5.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/stack": "^6.3.0",
  "@react-navigation/bottom-tabs": "^6.6.0",
  "zustand": "^5.0.0",
  "react-query": "^5.0.0",
  "@tanstack/react-query": "^5.60.0",
  "axios": "^1.7.0",
  "react-native-mmkv": "^3.1.0",
  "lottie-react-native": "~7.1.0"
}
```

### App File Structure
```
apps/mobile/
├── src/
│   ├── app/                          # Expo Router file-based routing
│   │   ├── _layout.tsx               # Root layout with providers
│   │   ├── (auth)/
│   │   │   ├── onboarding.tsx
│   │   │   └── profile-setup.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx           # Bottom tab navigator
│   │   │   ├── index.tsx             # Home: My Drug Graph
│   │   │   ├── scan.tsx              # Barcode scanner
│   │   │   ├── alerts.tsx            # Interaction alerts
│   │   │   └── history.tsx           # Medication history
│   │   ├── drug/[drugId].tsx         # Drug detail screen
│   │   ├── interaction/[chainId].tsx # Full interaction chain explainer
│   │   └── enzyme/[enzymeId].tsx     # Enzyme detail
│   ├── components/
│   │   ├── graph/
│   │   │   ├── DrugGraphCanvas.tsx   # Skia-based graph renderer
│   │   │   ├── GraphNode.tsx         # Animated node component
│   │   │   ├── GraphEdge.tsx         # Animated edge with glow
│   │   │   └── PathHighlight.tsx     # Danger path overlay animation
│   │   ├── ui/
│   │   │   ├── DangerBadge.tsx       # Critical/Moderate/Safe badges
│   │   │   ├── DrugCard.tsx          # Medication card with severity
│   │   │   ├── TypewriterText.tsx    # AI explanation typewriter
│   │   │   ├── GlowButton.tsx        # CTA button with glow effect
│   │   │   ├── ScanOverlay.tsx       # Barcode scan UI overlay
│   │   │   └── BioLoader.tsx         # Biomorphic loading animation
│   │   └── screens/
│   │       └── InteractionChain.tsx  # Full chain visualization
│   ├── store/
│   │   ├── patient.store.ts          # Zustand: patient profile + meds
│   │   ├── interactions.store.ts     # Zustand: live interaction alerts
│   │   └── graph.store.ts            # Zustand: current graph data
│   ├── api/
│   │   ├── client.ts                 # Axios instance with auth
│   │   ├── drugs.api.ts              # /drugs/* endpoints
│   │   ├── interactions.api.ts       # /interactions/* endpoints
│   │   └── patient.api.ts            # /patient/* endpoints
│   ├── hooks/
│   │   ├── useDrugGraph.ts           # Fetches + caches patient graph
│   │   ├── useBarcodeScan.ts         # Camera + NDC lookup logic
│   │   └── useGroqExplainer.ts       # Typewriter explanation hook
│   └── theme/
│       ├── tokens.ts                 # Design tokens (above)
│       ├── colors.ts                 # Color palette
│       └── typography.ts            # Font scales
├── assets/
│   ├── animations/                   # Lottie JSON files
│   │   ├── scan-lock.json            # Barcode lock-on animation
│   │   ├── bio-loader.json           # Loading blob
│   │   └── alert-pulse.json          # Critical alert pulse
│   └── fonts/                        # Downloaded font files
└── app.json
```

### Screen Specifications

#### Screen 1: Home — My Drug Graph (`(tabs)/index.tsx`)
**Purpose:** Patient's personal biochemical network, live.

**Layout:**
- Full-screen dark canvas with the patient's drug graph rendered using `@shopify/react-native-skia`
- Top: greeting header `"Your Metabolic Network"` in Syne 700, off-white
- Bottom sheet (swipe up): interaction summary — X critical, Y moderate alerts as glowing badge chips
- Floating action button (+) bottom-right: add medication

**Graph rendering with Skia:**
- Nodes: circles with a soft glow (use `Paint` with `BlurMaskFilter` for the glow effect). Color by node type (drug=blue, enzyme=violet, metabolite=emerald, receptor=rose)
- Edges: bezier curves, thickness proportional to interaction strength. Danger edges: animated dashed stroke cycling with a glow filter
- Layout algorithm: use D3-force layout calculated on the JS thread (react-native-d3 or pure JS), pass coordinates to Skia canvas
- On mount: staggered node entrance — each node scales from 0→1 with a 80ms delay per node

**Interaction:**
- Tap a node: spring-animates to 1.15× scale, shows tooltip with drug name + class
- Long-press a node: triggers haptic feedback (`expo-haptics`) + opens drug detail sheet
- Danger edges pulse continuously; tapping a danger edge opens the interaction chain screen

#### Screen 2: Barcode Scanner (`(tabs)/scan.tsx`)
**Purpose:** Scan any pill bottle barcode → instantly add to graph.

**Layout:**
- Full-screen camera view (expo-camera)
- Overlay: 4 animated corner brackets that pulse in the brand teal while scanning. When barcode detected: brackets snap to lock-on position (Reanimated spring), scan line animation stops, haptic feedback fires
- Bottom card slides up: drug name + class + "Add to My Graph" CTA
- Manual fallback: "Type drug name instead" link below the camera

**Logic flow:**
1. `expo-barcode-scanner` detects NDC barcode
2. `GET https://api.fda.gov/drug/ndc.json?search=product_ndc:{ndc}` → get drug name
3. `GET /api/drugs/lookup?name={name}` → fetch from Neo4j
4. Animate drug card slide-up with Reanimated `SlideInDown`
5. Confirm → `POST /api/patient/medications` → triggers graph re-fetch + animation of new node entering the graph

#### Screen 3: Interaction Alerts (`(tabs)/alerts.tsx`)
**Purpose:** Ranked list of dangerous interactions in patient's current medication set.

**Layout:**
- Header: "Active Interactions" with count badge
- FlatList of `InteractionCard` components, sorted by severity (critical first)
- Each card: gradient background (danger→surface), perpetrator drug name, arrow icon, victim drug name, severity badge, one-line consequence
- Tap any card → opens full chain explainer screen

**Card Animation:**
- On list load: staggered `FadeInDown` (Reanimated) per card, 60ms stagger
- Critical cards have a subtle left-border glow that pulses on a 2s loop
- Swipe-left on a card: "Dismissed" option (stores in local state, does NOT remove from graph — just snoozes the visual alert for 24h)

#### Screen 4: Interaction Chain Explainer (`interaction/[chainId].tsx`)
**Purpose:** Deep-dive: show the full biochemical chain + Groq explanation.

**Layout:**
- Full-screen, scrollable
- Top: animated chain diagram (horizontal scroll on small screens) — each node in the chain rendered as a pill-shaped chip connected by animated arrows
  - Drug A → [INHIBITS] → CYP2D6 → [BLOCKS METABOLISM OF] → Drug B → [ACCUMULATES] → Receptor → [OUTCOME]
- Color coding: perpetrator nodes in amber, victim nodes in danger-red, enzymes in violet
- Middle: "What this means for you" section — Groq explanation renders here with typewriter animation
- Bottom: "Severity breakdown" — strength badge, estimated risk level, suggested action ("Consult your pharmacist")
- "Report to pharmacist" CTA button (generates a PDF-ready summary, uses expo-sharing)

**Groq Explanation Flow:**
```typescript
// hooks/useGroqExplainer.ts
// 1. Call GET /api/interactions/{chainId}/explain
// 2. Backend calls Groq with structured graph data
// 3. Returns streaming response
// 4. Frontend renders with TypewriterText component (30ms/char)
```

#### Screen 5: Medication History (`(tabs)/history.tsx`)
**Purpose:** Timeline of when drugs were added/removed, how the graph changed.

**Layout:**
- Vertical timeline (custom SVG timeline component)
- Each entry: date, drug name, action (added/removed/dose changed), mini graph delta preview
- Empty state: illustrated molecule graphic with "Start scanning your medications"

### Push Notifications Setup
```typescript
// apps/mobile/src/services/notifications.ts
// Use Expo Notifications + background fetch
// Poll /api/patient/{id}/alerts every 6 hours via expo-background-fetch
// On new critical alert: fire local notification with:
//   title: "⚠️ New Drug Interaction Detected"
//   body: "{Drug A} may dangerously affect {Drug B} via CYP2D6"
//   data: { chainId: "..." }  // deep link to chain screen
```

---

## SECTION 4 — FASTAPI BACKEND

### File Structure
```
packages/api/
├── main.py                    # FastAPI app factory
├── config.py                  # Settings from env vars (pydantic-settings)
├── dependencies.py            # Shared FastAPI dependencies
├── routers/
│   ├── drugs.py               # Drug lookup, search, details
│   ├── patient.py             # Patient profile, medications CRUD
│   ├── interactions.py        # Interaction detection, chain fetch
│   ├── graph.py               # Full graph data for visualization
│   ├── explain.py             # Groq explanation endpoints
│   └── admin.py               # Base44 portal endpoints (read-heavy)
├── services/
│   ├── neo4j_service.py       # Neo4j driver wrapper + all Cypher queries
│   ├── groq_service.py        # Groq client + prompt templates
│   ├── fda_service.py         # OpenFDA NDC lookup
│   ├── rxnorm_service.py      # Drug name normalization
│   └── cache_service.py       # Redis/in-memory cache for graph results
├── models/
│   ├── drug.py                # Pydantic models for drug data
│   ├── patient.py             # Patient models
│   ├── interaction.py         # Interaction chain models
│   └── graph.py               # Graph response models
└── requirements.txt
```

### Core API Endpoints

```
# Drug Endpoints
GET  /api/drugs/lookup?name={name}         # Search by name, returns Neo4j node
GET  /api/drugs/{drugbank_id}              # Full drug detail
GET  /api/drugs/barcode/{ndc}             # NDC → drug via OpenFDA

# Patient Endpoints  
POST /api/patient/create                   # Create anonymized patient profile
GET  /api/patient/{id}/graph               # Full graph data (nodes + edges JSON)
POST /api/patient/{id}/medications         # Add medication
DELETE /api/patient/{id}/medications/{drugId}  # Remove medication
GET  /api/patient/{id}/alerts              # Current interaction alerts (sorted by severity)

# Interaction Endpoints
GET  /api/interactions/{patientId}         # All interaction chains for patient
GET  /api/interactions/chain/{chainId}     # Single chain detail
GET  /api/interactions/{patientId}/simulate?drugId={id}  # What if I added this drug?

# Explain Endpoints (Groq)
GET  /api/explain/chain/{chainId}          # Stream Groq explanation for a chain
GET  /api/explain/drug/{drugId}            # Plain-English drug summary

# Admin Endpoints (Base44)
GET  /api/admin/patients                   # Patient list with risk scores
GET  /api/admin/patient/{id}/graph         # Patient graph for portal
GET  /api/admin/high-risk                  # Patients with critical interactions
POST /api/admin/prescribe-check            # Simulate adding drug to patient graph
```

### Key FastAPI Patterns

```python
# packages/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .services.neo4j_service import neo4j_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    await neo4j_service.connect()
    yield
    await neo4j_service.close()

app = FastAPI(
    title="Cascadex API",
    description="Drug metabolic pathway intelligence via graph traversal",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```python
# packages/api/services/neo4j_service.py
"""
Neo4j AuraDB service. All Cypher queries live here.
Connects to: Neo4j AuraDB (URI from NEO4J_URI env var)
"""
from neo4j import AsyncGraphDatabase
from typing import Optional
import os

class Neo4jService:
    def __init__(self):
        self.driver = None

    async def connect(self):
        self.driver = AsyncGraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USER"), os.getenv("NEO4J_PASSWORD"))
        )

    async def close(self):
        await self.driver.close()

    async def get_patient_interactions(self, patient_id: str) -> list:
        """
        Core innovation query: multi-hop interaction chain detection.
        Returns all drug-enzyme-drug interaction paths for a patient.
        """
        query = """
        MATCH (p:Patient {id: $patientId})-[:TAKES]->(d1:Drug)
        MATCH path = (d1)-[:INHIBITS|INDUCES]->(e:Enzyme)
                     <-[:SUBSTRATE_OF]-(d2:Drug)
                     <-[:TAKES]-(p)
        WHERE d1 <> d2
        WITH path, d1, d2, e,
             [r IN relationships(path) | r.strength] AS strengths
        RETURN 
            d1.name AS perpetrator,
            d1.drugbank_id AS perpetrator_id,
            d2.name AS victim_drug,
            d2.drugbank_id AS victim_id,
            e.name AS via_enzyme,
            e.family AS enzyme_family,
            strengths,
            type(relationships(path)[0]) AS interaction_type,
            d2.name + ' metabolism affected via ' + e.name AS consequence
        ORDER BY size([s IN strengths WHERE s = 'strong']) DESC
        """
        async with self.driver.session() as session:
            result = await session.run(query, patientId=patient_id)
            return [record.data() async for record in result]

    async def get_blast_radius(self, enzyme_name: str, patient_meds: list) -> list:
        """
        Blast radius: all downstream effects of a single enzyme being inhibited.
        Used for the 'enzyme detail' screen.
        """
        query = """
        MATCH (target:Enzyme {name: $enzymeName})
        MATCH path = (target)<-[:SUBSTRATE_OF]-(drug:Drug)
                     -[:PRODUCES]->(met:Metabolite)
                     -[:ACTIVATES|INHIBITS]->(receptor:Receptor)
        WHERE drug.name IN $patientMeds
        RETURN 
            drug.name AS drug_name,
            met.name AS metabolite,
            met.active AS is_active_metabolite,
            met.toxicity_threshold AS toxicity_threshold,
            receptor.name AS receptor,
            receptor.effect AS receptor_effect,
            receptor.risk_category AS risk_category,
            length(path) AS chain_length
        ORDER BY receptor.risk_category DESC
        """
        async with self.driver.session() as session:
            result = await session.run(
                query, 
                enzymeName=enzyme_name, 
                patientMeds=patient_meds
            )
            return [record.data() async for record in result]

    async def simulate_add_drug(self, patient_id: str, new_drug_id: str) -> list:
        """
        Simulate adding a drug to patient's regimen without persisting.
        Returns new interaction chains that would be created.
        Powers the 'prescribe-check' feature.
        """
        query = """
        MATCH (p:Patient {id: $patientId})-[:TAKES]->(existing:Drug)
        MATCH (newDrug:Drug {drugbank_id: $newDrugId})
        MATCH path = (newDrug)-[:INHIBITS|INDUCES]->(e:Enzyme)
                     <-[:SUBSTRATE_OF]-(existing)
        RETURN 
            newDrug.name AS new_drug,
            existing.name AS affected_drug,
            e.name AS via_enzyme,
            type(relationships(path)[0]) AS mechanism,
            relationships(path)[0].strength AS strength
        UNION
        MATCH (p:Patient {id: $patientId})-[:TAKES]->(existing:Drug)
        MATCH (newDrug:Drug {drugbank_id: $newDrugId})
        MATCH path = (existing)-[:INHIBITS|INDUCES]->(e:Enzyme)
                     <-[:SUBSTRATE_OF]-(newDrug)
        RETURN 
            existing.name AS new_drug,
            newDrug.name AS affected_drug,
            e.name AS via_enzyme,
            type(relationships(path)[0]) AS mechanism,
            relationships(path)[0].strength AS strength
        """
        async with self.driver.session() as session:
            result = await session.run(
                query, 
                patientId=patient_id, 
                newDrugId=new_drug_id
            )
            return [record.data() async for record in result]

    async def get_full_graph(self, patient_id: str) -> dict:
        """
        Returns all nodes and edges for graph visualization.
        Used by mobile graph canvas and Base44 portal.
        """
        query = """
        MATCH (p:Patient {id: $patientId})-[:TAKES]->(d:Drug)
        OPTIONAL MATCH (d)-[r1:INHIBITS|INDUCES|SUBSTRATE_OF]->(e:Enzyme)
        OPTIONAL MATCH (d)-[r2:PRODUCES]->(m:Metabolite)
        OPTIONAL MATCH (m)-[r3:ACTIVATES|INHIBITS]->(rec:Receptor)
        WITH 
            collect(DISTINCT {id: d.drugbank_id, label: d.name, type: 'drug', class: d.class}) AS drugNodes,
            collect(DISTINCT {id: e.name, label: e.name, type: 'enzyme', family: e.family}) AS enzymeNodes,
            collect(DISTINCT {id: m.name, label: m.name, type: 'metabolite', active: m.active}) AS metNodes,
            collect(DISTINCT {id: rec.name, label: rec.name, type: 'receptor', effect: rec.effect}) AS recNodes,
            collect(DISTINCT {source: d.drugbank_id, target: e.name, type: type(r1), strength: r1.strength}) AS enzymeEdges,
            collect(DISTINCT {source: d.drugbank_id, target: m.name, type: 'PRODUCES'}) AS metEdges,
            collect(DISTINCT {source: m.name, target: rec.name, type: type(r3)}) AS recEdges
        RETURN 
            drugNodes + enzymeNodes + metNodes + recNodes AS nodes,
            enzymeEdges + metEdges + recEdges AS edges
        """
        async with self.driver.session() as session:
            result = await session.run(query, patientId=patient_id)
            record = await result.single()
            return record.data() if record else {"nodes": [], "edges": []}

neo4j_service = Neo4jService()
```

### Groq Service
```python
# packages/api/services/groq_service.py
"""
Groq inference service for plain-English explanations of graph results.
Model: llama-3.1-70b-versatile (fastest, largest available on Groq)
"""
from groq import AsyncGroq
import os

groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

INTERACTION_EXPLAIN_PROMPT = """
You are a clinical pharmacist explaining a drug interaction to a patient with no medical background.

The biochemical chain you must explain:
{chain_json}

Rules:
- Maximum 3 sentences
- No medical jargon. Use plain words.
- State: what drug interferes, how, and what happens to the other drug
- End with a simple recommended action (talk to your doctor/pharmacist)
- Tone: concerned but calm, not alarming

Respond with ONLY the explanation. No preamble, no "here is your explanation".
"""

async def explain_interaction_chain(chain_data: dict) -> str:
    """
    Takes a Neo4j graph traversal result dict and returns
    a plain-English patient-facing explanation via Groq.
    """
    import json
    response = await groq_client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": INTERACTION_EXPLAIN_PROMPT.format(
                chain_json=json.dumps(chain_data, indent=2)
            )
        }],
        model="llama-3.1-70b-versatile",
        max_tokens=200,
        temperature=0.3,  # Low temperature for clinical accuracy
        stream=False
    )
    return response.choices[0].message.content

async def explain_drug(drug_data: dict) -> str:
    """Returns a plain-English 2-sentence drug overview for the patient."""
    response = await groq_client.chat.completions.create(
        messages=[{
            "role": "user",
            "content": f"Explain this drug in 2 sentences for a patient. Drug data: {drug_data}. No jargon."
        }],
        model="llama-3.1-70b-versatile",
        max_tokens=120,
        temperature=0.3,
    )
    return response.choices[0].message.content
```

---

## SECTION 5 — NEO4J DATABASE

### AuraDB Setup Steps
1. Create a free AuraDB instance at `console.neo4j.io`
2. Region: us-east-1 (lowest latency from Railway)
3. Save connection URI, username, password to `.env`
4. Run the index creation script immediately (before any data ingestion)

### Indexes (Run First — CRITICAL for performance)
```cypher
// packages/graph/setup_indexes.cypher
// Run this BEFORE loading any data

CREATE INDEX drug_name IF NOT EXISTS FOR (d:Drug) ON (d.name);
CREATE INDEX drug_id IF NOT EXISTS FOR (d:Drug) ON (d.drugbank_id);
CREATE INDEX enzyme_name IF NOT EXISTS FOR (e:Enzyme) ON (e.name);
CREATE INDEX metabolite_name IF NOT EXISTS FOR (m:Metabolite) ON (m.name);
CREATE INDEX receptor_name IF NOT EXISTS FOR (r:Receptor) ON (r.name);
CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.id);
CREATE INDEX condition_icd IF NOT EXISTS FOR (c:Condition) ON (c.icd_code);

// Composite index for drug class queries
CREATE INDEX drug_class IF NOT EXISTS FOR (d:Drug) ON (d.class);

// Full-text index for drug name search
CREATE FULLTEXT INDEX drug_search IF NOT EXISTS
FOR (d:Drug) ON EACH [d.name, d.brand_name];
```

### Full Schema
```cypher
// Node definitions with all properties

// (:Drug)
// drugbank_id: "DB00472" (primary key)
// name: "Fluoxetine"
// brand_names: ["Prozac", "Sarafem"]  (list)
// class: "SSRI"
// half_life: "1-4 days"
// bioavailability: "72%"
// molecular_weight: 309.33
// description: "..."

// (:Enzyme)
// name: "CYP2D6"  (primary key)
// gene: "CYP2D6"
// family: "CYP450"
// chromosome: "22"
// function: "Metabolizes ~25% of clinically used drugs"

// (:Metabolite)
// name: "Norfluoxetine"
// active: true
// toxicity_threshold: "50 ng/mL"
// half_life: "4-16 days"

// (:Receptor)
// name: "5-HT1A"
// type: "Serotonin receptor"
// effect: "Mood regulation, anxiety"
// risk_category: "HIGH|MEDIUM|LOW"

// (:Condition)
// name: "Major Depressive Disorder"
// icd_code: "F32.1"
// category: "Psychiatric"

// (:Patient)
// id: UUID (anonymized)
// age_range: "40-50"  (bucketed for privacy)
// weight_range: "70-80kg"
// created_at: datetime
```

### Relationship Properties
```cypher
// INHIBITS / INDUCES (Drug → Enzyme)
// strength: "strong" | "moderate" | "weak"
// evidence_level: "established" | "theoretical" | "case_report"
// clinical_significance: "major" | "moderate" | "minor"
// onset: "rapid" | "delayed"
// reversibility: "reversible" | "irreversible"

// SUBSTRATE_OF (Drug → Enzyme)
// primary: true | false (is this the primary metabolic route?)
// fraction_metabolized: 0.8  (0-1, what fraction uses this enzyme)

// TAKES (Patient → Drug)
// dose: "20mg"
// frequency: "once_daily"
// start_date: date
// indication: "Depression"

// TREATS (Drug → Condition)
// approval_status: "approved" | "off_label"
// evidence_level: "level_1" | "level_2" | "level_3"
```

---

## SECTION 6 — DATA PIPELINE

### Overview
The data pipeline runs once to seed Neo4j, then incrementally for updates. It is a standalone Python CLI tool in `apps/pipeline/`.

```
apps/pipeline/
├── main.py                    # CLI entry point (click)
├── sources/
│   ├── drugbank.py            # DrugBank XML parser → Neo4j
│   ├── kegg.py                # KEGG REST API → enzyme data
│   ├── fda.py                 # OpenFDA → drug labels + adverse events
│   └── rxnorm.py              # RxNorm → name normalization
├── loaders/
│   ├── neo4j_loader.py        # Batch upsert to Neo4j (MERGE statements)
│   └── validators.py          # Validate data before insertion
├── requirements.txt
└── README.md
```

### DrugBank XML Parser
```python
# apps/pipeline/sources/drugbank.py
"""
Parses DrugBank open data XML (full_database.xml, ~500MB)
into structured dicts for Neo4j ingestion.

Download from: https://go.drugbank.com/releases/latest#open-data
Free academic registration required.

Scope for demo: top 500 drugs by prescription frequency
(filter by presence in OpenFDA adverse event database → these are common)
"""
import xml.etree.ElementTree as ET
from typing import Generator

NS = "http://www.drugbank.ca"

def parse_drugs(xml_path: str) -> Generator[dict, None, None]:
    """Stream-parse DrugBank XML, yielding one drug dict at a time."""
    tree = ET.iterparse(xml_path, events=("end",))
    for event, elem in tree:
        if elem.tag == f"{{{NS}}}drug" and elem.get("type") == "small molecule":
            drug_id = elem.findtext(f"{{{NS}}}drugbank-id[@primary='true']")
            name = elem.findtext(f"{{{NS}}}name")
            
            # Extract CYP enzymes
            enzymes = []
            for enzyme_elem in elem.findall(f".//{{{NS}}}enzyme"):
                enz_name = enzyme_elem.findtext(f".//{{{NS}}}name")
                if enz_name and "CYP" in enz_name:
                    action = enzyme_elem.findtext(f".//{{{NS}}}action")
                    enzymes.append({"name": enz_name, "action": action})
            
            yield {
                "drugbank_id": drug_id,
                "name": name,
                "enzymes": enzymes,
                # ... other fields
            }
            elem.clear()  # Free memory (large file)
```

### Neo4j Batch Loader
```python
# apps/pipeline/loaders/neo4j_loader.py
"""
Batch-upserts parsed drug data into Neo4j.
Uses MERGE (not CREATE) to allow safe re-runs.
Target: ~500 drugs, ~50 enzymes, ~200 metabolites, ~100 receptors
Estimated final graph: ~10K nodes, ~25K relationships (well within free tier)
"""
UPSERT_DRUG = """
MERGE (d:Drug {drugbank_id: $drugbank_id})
SET d.name = $name,
    d.class = $class,
    d.half_life = $half_life,
    d.bioavailability = $bioavailability,
    d.updated_at = datetime()
"""

UPSERT_ENZYME_RELATIONSHIP = """
MERGE (d:Drug {drugbank_id: $drug_id})
MERGE (e:Enzyme {name: $enzyme_name})
ON CREATE SET e.family = CASE WHEN $enzyme_name STARTS WITH 'CYP' THEN 'CYP450' ELSE 'Other' END
WITH d, e
CALL apoc.merge.relationship(d, $rel_type, 
    {strength: $strength}, 
    {evidence_level: $evidence, clinical_significance: $significance}, 
    e) YIELD rel
RETURN rel
"""
```

### Pipeline CLI Commands
```bash
# Seed the database (run once)
python main.py seed --drugbank-xml ./data/full_database.xml --limit 500

# Update CVE equivalents (new adverse events)
python main.py update-adverse-events

# Validate graph integrity
python main.py validate

# Test a known interaction (Fluoxetine + Codeine)
python main.py test-interaction --drug1 "Fluoxetine" --drug2 "Codeine"
```

---

## SECTION 7 — BASE44 PHARMACIST PORTAL

### What to Build in Base44
Base44 is a no-code builder. You do NOT write frontend code for the portal. You:
1. Deploy the FastAPI backend with `/api/admin/*` endpoints
2. Open Base44, create a new app
3. Add HTTP data sources pointing to your API
4. Build the UI visually using Base44's components

### Portal Pages to Build

**Page 1: Patient Risk Dashboard**
- Data source: `GET /api/admin/patients` — returns `[{id, name_anon, drug_count, critical_alerts, last_updated}]`
- Build: Table component with columns: Patient ID, Medication Count, Risk Score, Critical Alerts, Last Updated
- Add: color-coded row styling (red row = critical alerts > 0)
- Add: click row → navigates to Patient Detail page

**Page 2: Patient Detail — Drug Graph**
- Data source: `GET /api/admin/patient/{id}/graph` — returns nodes/edges JSON
- Build: Embed graph visualization using Base44's iframe embed or a Neovis.js HTML block
- Add: List of interaction alerts below the graph

**Page 3: Prescribe-Check Tool**
- Data source: `POST /api/admin/prescribe-check` with `{patientId, newDrugId}`
- Build: Form (patient selector dropdown + drug name text input) + result panel
- Result panel: "Adding {Drug} would create X new interactions" with a list of chains

**Page 4: High-Risk Alerts Board**
- Data source: `GET /api/admin/high-risk` — patients with critical alerts
- Build: Kanban-style view with columns: Critical / Moderate / Review Needed
- Auto-refresh every 60s using Base44's polling

### Base44 HTTP Connector Setup
```
Base44 → Settings → Data Sources → Add HTTP Source
Name: Cascadex API
Base URL: https://your-railway-app.railway.app/api/admin
Authentication: Bearer token (use API key env var)
Headers: { "Content-Type": "application/json" }
```

---

## SECTION 8 — CI/CD PIPELINE

### GitHub Actions Workflows

#### Workflow 1: Backend CI (`backend-ci.yml`)
```yaml
name: Backend CI
on:
  push:
    branches: [main, develop]
    paths: ['packages/api/**']
  pull_request:
    paths: ['packages/api/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: |
          cd packages/api
          pip install -r requirements.txt
          pip install pytest pytest-asyncio httpx
      - name: Run tests
        run: |
          cd packages/api
          pytest tests/ -v --tb=short
        env:
          NEO4J_URI: ${{ secrets.NEO4J_URI_TEST }}
          NEO4J_USER: ${{ secrets.NEO4J_USER }}
          NEO4J_PASSWORD: ${{ secrets.NEO4J_PASSWORD_TEST }}
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install ruff
      - run: ruff check packages/api/
```

#### Workflow 2: Backend Deploy to Railway (`backend-deploy.yml`)
```yaml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['packages/api/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy
        run: railway up --service cascadex-api
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

#### Workflow 3: Mobile EAS Build (`mobile-build.yml`)
```yaml
name: Expo EAS Build
on:
  push:
    branches: [main]
    paths: ['apps/mobile/**']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: |
          cd apps/mobile
          npm install
      - name: Build preview
        run: |
          cd apps/mobile
          eas build --profile preview --platform all --non-interactive
```

#### Workflow 4: Cypher Query Tests (`graph-test.yml`)
```yaml
name: Graph Query Tests
on:
  push:
    paths: ['packages/graph/**']

jobs:
  test-queries:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Test core Cypher queries against test instance
        run: python packages/graph/test_queries.py
        env:
          NEO4J_URI: ${{ secrets.NEO4J_URI_TEST }}
          NEO4J_USER: ${{ secrets.NEO4J_USER }}
          NEO4J_PASSWORD: ${{ secrets.NEO4J_PASSWORD_TEST }}
```

### Railway Deployment Config
```toml
# railway.toml (in packages/api/)
[build]
builder = "nixpacks"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30

[[services]]
name = "cascadex-api"
```

### Environment Variables (.env.example)
```
# Neo4j AuraDB
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-auradb-password

# Groq
GROQ_API_KEY=gsk_...

# OpenFDA (no key required, but rate limit applies)
FDA_API_BASE=https://api.fda.gov

# RxNorm
RXNORM_API_BASE=https://rxnav.nlm.nih.gov/REST

# KEGG
KEGG_API_BASE=https://rest.kegg.jp

# App
API_PORT=8000
ENVIRONMENT=development  # development | staging | production
API_SECRET_KEY=your-random-secret-for-jwt

# Railway (for CI/CD)
RAILWAY_TOKEN=...

# Expo
EXPO_TOKEN=...
```

---

## SECTION 9 — TESTING STRATEGY

### What to Test
1. **Core Cypher queries**: Run `test_patient_interactions.py` against a seeded test Neo4j instance with known drug pairs (Fluoxetine + Codeine is the gold standard — this MUST return a critical interaction via CYP2D6)
2. **API endpoints**: pytest + httpx for all `/api/*` routes
3. **Mobile**: Expo's built-in testing + manual testing on iOS Simulator + Android Emulator
4. **Barcode lookup**: Test with actual pill bottle UPC codes (buy a box of generic ibuprofen, scan it)

### Validation Drugs (known interactions for testing)
```python
# These MUST return correct interactions in your graph:
KNOWN_INTERACTIONS = [
    {
        "perpetrator": "Fluoxetine",
        "victim": "Codeine",
        "enzyme": "CYP2D6",
        "mechanism": "INHIBITS",
        "severity": "critical"
    },
    {
        "perpetrator": "Omeprazole",
        "victim": "Clopidogrel",
        "enzyme": "CYP2C19",
        "mechanism": "INHIBITS",
        "severity": "critical"
    },
    {
        "perpetrator": "Rifampicin",
        "victim": "Warfarin",
        "enzyme": "CYP2C9",
        "mechanism": "INDUCES",
        "severity": "critical"
    },
]
# If your graph doesn't return these, your data pipeline has a bug.
```

---

## SECTION 10 — WEEK-BY-WEEK AGENT ASSIGNMENTS

### WEEK 1 (May 18–24): Foundation — Agent "SEED"
**Primary goal:** Neo4j has real data. Backend runs locally. Expo project exists.

- [ ] Create Neo4j AuraDB free instance. Record URI/credentials in `.env`.
- [ ] Run `setup_indexes.cypher` against the live instance.
- [ ] Download DrugBank open data XML (requires free registration at drugbank.com/releases/latest#open-data).
- [ ] Write and run `apps/pipeline/sources/drugbank.py` — parse top 500 drugs.
- [ ] Write and run `apps/pipeline/loaders/neo4j_loader.py` — load drugs + enzyme relationships.
- [ ] Validate: run the Fluoxetine → Codeine test query manually in Neo4j Browser.
- [ ] Set up FastAPI project in `packages/api/` with `neo4j_service.py` and `/health` endpoint.
- [ ] `expo init apps/mobile --template expo-template-blank-typescript`
- [ ] Install all dependencies listed in Section 3.

**Definition of done for Week 1:**
```cypher
// This query in Neo4j Browser must return at least 1 row:
MATCH (d1:Drug {name: "Fluoxetine"})-[:INHIBITS]->(e:Enzyme)<-[:SUBSTRATE_OF]-(d2:Drug {name: "Codeine"})
RETURN d1.name, e.name, d2.name
// Expected: Fluoxetine | CYP2D6 | Codeine
```

---

### WEEK 2 (May 25–31): Core Graph Logic — Agent "QUERY"
**Primary goal:** All Cypher queries written, tested, and wrapped in API endpoints.

- [ ] Write all queries in `packages/api/services/neo4j_service.py` (all methods from Section 4).
- [ ] Write API router files in `packages/api/routers/`.
- [ ] Write Pydantic models in `packages/api/models/`.
- [ ] Test `get_patient_interactions()` with all 3 known interaction pairs (Section 9).
- [ ] Test `simulate_add_drug()` — verify it finds the new chains without persisting.
- [ ] Test `get_full_graph()` — verify nodes and edges JSON is valid for D3/Skia rendering.
- [ ] Write FastAPI tests in `packages/api/tests/`.
- [ ] Deploy backend to Railway. Verify `/health` returns 200.

**Definition of done for Week 2:**
```bash
curl https://your-app.railway.app/api/interactions/{test_patient_id}
# Must return JSON array with Fluoxetine-Codeine interaction
```

---

### WEEK 3 (June 1–7): Mobile App Core — Agent "MOBILE"
**Primary goal:** Working mobile app with graph visualization and barcode scanner.

- [ ] Build the bottom tab navigator with 4 tabs (Home, Scan, Alerts, History).
- [ ] Build `DrugGraphCanvas.tsx` using Skia — node types, edge types, staggered entrance animation.
- [ ] Build `ScanOverlay.tsx` — camera view, animated corner brackets, lock-on animation.
- [ ] Implement barcode scan → OpenFDA NDC → drug lookup → graph update flow.
- [ ] Build `InteractionCard.tsx` for the alerts tab.
- [ ] Build the Alerts screen with sorted interaction list.
- [ ] Implement Zustand stores (`patient.store.ts`, `interactions.store.ts`).
- [ ] Implement React Query hooks for all API calls with proper caching.

**Definition of done for Week 3:**
- Scan a real pill bottle UPC code → drug appears in graph (test on device or simulator).
- Alerts screen shows the Fluoxetine+Codeine interaction from test patient.

---

### WEEK 4 (June 8–14): AI Layer + Base44 — Agent "AI-PORTAL"
**Primary goal:** Groq explains every interaction. Base44 portal is live.

- [ ] Implement `packages/api/services/groq_service.py` fully.
- [ ] Add `/api/explain/chain/{chainId}` endpoint.
- [ ] Build `TypewriterText.tsx` component in mobile app.
- [ ] Build full Interaction Chain Explainer screen (`interaction/[chainId].tsx`).
- [ ] Set up Base44 app with HTTP connector pointing to Railway backend.
- [ ] Build all 4 portal pages in Base44 (Section 7).
- [ ] Test pharmacist prescribe-check flow end-to-end.
- [ ] Add `/api/admin/*` endpoints with proper data shaping for Base44 tables.

**Definition of done for Week 4:**
- Tap an interaction chain in the mobile app → typewriter Groq explanation appears.
- Base44 portal loads patient list with risk scores.
- Prescribe-check: add Fluoxetine to a patient on Codeine → portal shows new critical interaction.

---

### WEEK 5 (June 15–21): Polish + Testing — Agent "POLISH"
**Primary goal:** Demo-ready on real devices. No crashes. Looks stunning.

- [ ] Test on real iOS device (use Expo Go or TestFlight).
- [ ] Test on real Android device (use Expo Go).
- [ ] Fix all layout issues for different screen sizes.
- [ ] Add Lottie animations: scan-lock, bio-loader, alert-pulse.
- [ ] Add all micro-animations: node entrance stagger, edge draw-on, danger pulse.
- [ ] Add haptic feedback on barcode scan success and critical alert.
- [ ] Add expo-notifications: implement background polling + push alert.
- [ ] Performance: add Redis caching (or in-memory dict) for graph query results in FastAPI.
- [ ] Add "share with pharmacist" button (expo-sharing, generates a text summary).
- [ ] Write the architecture diagram (draw.io or Excalidraw).

---

### WEEK 6 (June 22–30): Submission — Agent "SUBMIT"
**Primary goal:** Win.

- [ ] Record 2–3 minute demo video. Script below.
- [ ] Write GitHub README with: problem statement, architecture diagram, tech stack, all 4 partner tracks called out explicitly.
- [ ] Final submission text (template below).
- [ ] Deploy stable backend to Railway with environment variables set.
- [ ] Ensure Neo4j AuraDB instance has demo data (Fluoxetine, Codeine, Warfarin, Aspirin, Omeprazole test patient).
- [ ] Backup the Neo4j demo data (export CSV) so you can re-seed if it gets corrupted.
- [ ] Submit on Devfolio/Devpost with all required fields.

---

## SECTION 11 — DEMO VIDEO SCRIPT

**Total duration: 2:30 (record this exactly)**

**[0:00–0:20] The Hook**
Voiceover: "125,000 Americans die every year from preventable medication errors — most from drug interactions that every existing tool misses. Drugs.com says yes or no. Your doctor guesses. We built something completely different."

**[0:20–0:50] The Problem Visualization**
Show the chain: "Fluoxetine inhibits CYP2D6. Codeine needs CYP2D6 to work. Patient takes both. Doctor increases Codeine dose. Codeine accumulates. Toxic levels."
Show this as an animated diagram, not just words. The enzyme in the middle, the two drugs on either side, arrows highlighting.

**[0:50–1:30] The Product Demo**
- Open app. Patient has 3 medications. Show the glowing graph.
- Scan a pill bottle with the camera. Barcode locks on. New drug node animates into the graph.
- New danger edge appears (in red-orange). Camera cuts to the Alerts tab.
- "Critical interaction detected." Tap it.
- Full chain lights up. Groq explanation types in: "Fluoxetine is blocking the enzyme your body uses to process Codeine. This means Codeine is building up to dangerous levels. Talk to your pharmacist before your next dose."

**[1:30–2:00] The Pharmacist Portal**
- Switch to Base44 portal on desktop.
- Patient list. Three patients highlighted in red.
- Click into one. Graph renders. Prescribe-check: type in a new drug, see new interactions computed in real time.
- "The same intelligence, now in a tool built for clinicians."

**[2:00–2:30] The Technical Payoff**
- Show the Neo4j Browser with the traversal query running.
- "This is not a lookup table. This is graph traversal through the actual biochemical network. Neo4j traverses 5-hop interaction chains in under 50ms."
- Show architecture diagram.
- End: "Cascadex. See the chain reaction before it happens."

---

## SECTION 12 — SUBMISSION TEXT TEMPLATE

```
## Cascadex — Drug Metabolic Pathway Intelligence

**The problem:** 125,000 Americans die annually from preventable medication errors, 
most caused by drug-drug interactions. Every existing tool (Drugs.com, Epocrates, 
Medscape) performs simple pairwise lookups — "Drug A + Drug B = yes/no." 
But the human body doesn't work in pairs.

**The innovation:** Drug interactions are chain reactions through the metabolic graph. 
Fluoxetine INHIBITS CYP2D6 → Codeine CANNOT be metabolized → Codeine accumulates 
→ toxic levels. This is a graph traversal problem. We solved it with one.

**What we built:** Cascadex traverses the live biochemical graph using Neo4j AuraDB 
to detect multi-hop interaction chains no pairwise lookup can find. Groq's llama-3.1-70b 
translates graph results to plain English for patients. Patients scan pill bottles 
with the Expo mobile app. Pharmacists review patient risk profiles in a Base44 portal.

**Track coverage:**
- ✅ Expo Track: React Native mobile app with barcode scanner, graph visualization, 
  push notifications for new interactions
- ✅ Neo4j AuraDB Track: Drug → CYP450 Enzyme → Metabolite → Receptor graph with 
  multi-hop Cypher traversal queries as the core innovation
- ✅ Base44 Track: Pharmacist portal for patient risk review, prescribe-checking, 
  and high-risk patient alerts
- ✅ Groq: Real-time plain-English explanation of every detected interaction chain

**Data sources:** DrugBank (open academic), KEGG, OpenFDA, RxNorm — all free APIs.

**Themes:** HealthTech & Bio Platforms (primary), Human Experience & Productivity, 
Public Systems & Governance
```

---

## SECTION 13 — KNOWN RISKS AND MITIGATIONS

| Risk | Likelihood | Mitigation |
|---|---|---|
| DrugBank XML parsing fails / data gaps | Medium | Pre-validate with 20 known drugs before full ingest. Have fallback hardcoded test data for demo |
| Neo4j free tier node limit hit | Low | Target 500 drugs + 50 enzymes + 200 metabolites ≈ 5K nodes. Well within 200K limit |
| Railway backend cold-start during demo | Medium | Keep backend warm with a ping cron job. Have a local fallback running on laptop |
| Groq API rate limit during demo | Low | Cache all explanation results for demo drug combinations. Never call Groq twice for the same chain |
| Barcode scan fails on demo pill bottle | Low | Have 3 pill bottles ready (ibuprofen, acetaminophen, one statin). Pre-test NDC lookups. Have manual entry fallback |
| Graph visualization too slow on device | Medium | Pre-compute D3 layout on server, send coordinates in API response. Cap graph at 30 nodes for mobile |
| Judge asks "is this clinically validated?" | Certain | Prepared answer: "This is a decision-support tool using established pharmacology data from DrugBank and KEGG. It flags interactions for pharmacist/physician review, not autonomous clinical decision-making." |

---

## SECTION 14 — MEDICAL DISCLAIMER (REQUIRED)

Include this in the app, the README, and the submission:

```
IMPORTANT: Cascadex is a decision-support tool for educational purposes only. 
It is not a substitute for professional medical advice, diagnosis, or treatment. 
Always consult your physician or licensed pharmacist before making any changes 
to your medications. Drug interaction data is sourced from DrugBank open-access 
dataset and may not reflect all known interactions.
```

---

*Master plan version: 1.0 | Generated: May 18, 2026 | Project: Cascadex | Hackathon: HackHazards '26*

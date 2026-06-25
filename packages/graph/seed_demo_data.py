"""
Cascadex — Neo4j Demo Data Seeder.

Seeds the graph with essential drugs, enzymes, metabolites, receptors,
and their relationships. This replaces the DrugBank XML pipeline when
the XML download is unavailable.

Includes the 3 gold-standard interaction pairs from master_plan.md:
  1. Fluoxetine → CYP2D6 → Codeine (critical)
  2. Omeprazole → CYP2C19 → Clopidogrel (critical)
  3. Rifampicin → CYP2C9 → Warfarin (critical)

Usage:
  cd packages/graph
  .\venv\\Scripts\\Activate.ps1
  python seed_demo_data.py
"""

import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase

# Resolve .env from project root (two levels up from this script)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=PROJECT_ROOT / ".env")

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

# ── Drug Data ──────────────────────────────────────────────────────
DRUGS = [
    {"id": "DB00472", "name": "Fluoxetine", "class": "SSRI", "brand": ["Prozac", "Sarafem"], "half_life": "1-4 days", "bio": "72%"},
    {"id": "DB00318", "name": "Codeine", "class": "Opioid Analgesic", "brand": ["Tylenol #3"], "half_life": "2.5-3 hours", "bio": "90%"},
    {"id": "DB00338", "name": "Omeprazole", "class": "PPI", "brand": ["Prilosec"], "half_life": "0.5-1 hour", "bio": "35-76%"},
    {"id": "DB00758", "name": "Clopidogrel", "class": "Antiplatelet", "brand": ["Plavix"], "half_life": "6 hours", "bio": "50%"},
    {"id": "DB01045", "name": "Rifampicin", "class": "Antibiotic", "brand": ["Rifadin"], "half_life": "2-5 hours", "bio": "90-95%"},
    {"id": "DB00682", "name": "Warfarin", "class": "Anticoagulant", "brand": ["Coumadin", "Jantoven"], "half_life": "20-60 hours", "bio": "100%"},
    {"id": "DB00945", "name": "Aspirin", "class": "NSAID", "brand": ["Bayer", "Ecotrin"], "half_life": "15-20 min", "bio": "80-100%"},
    {"id": "DB00316", "name": "Acetaminophen", "class": "Analgesic", "brand": ["Tylenol"], "half_life": "1-4 hours", "bio": "63-89%"},
    {"id": "DB00619", "name": "Ibuprofen", "class": "NSAID", "brand": ["Advil", "Motrin"], "half_life": "2 hours", "bio": "80%"},
    {"id": "DB01050", "name": "Itraconazole", "class": "Antifungal", "brand": ["Sporanox"], "half_life": "21 hours", "bio": "55%"},
    {"id": "DB00641", "name": "Simvastatin", "class": "Statin", "brand": ["Zocor"], "half_life": "2-3 hours", "bio": "5%"},
    {"id": "DB01175", "name": "Escitalopram", "class": "SSRI", "brand": ["Lexapro"], "half_life": "27-32 hours", "bio": "80%"},
    {"id": "DB00696", "name": "Ergotamine", "class": "Ergot Alkaloid", "brand": ["Ergomar"], "half_life": "2 hours", "bio": "5%"},
    {"id": "DB01211", "name": "Clarithromycin", "class": "Macrolide", "brand": ["Biaxin"], "half_life": "3-7 hours", "bio": "50%"},
    {"id": "DB00564", "name": "Carbamazepine", "class": "Anticonvulsant", "brand": ["Tegretol"], "half_life": "25-65 hours", "bio": "85%"},
    {"id": "DB01174", "name": "Phenobarbital", "class": "Barbiturate", "brand": ["Luminal"], "half_life": "53-118 hours", "bio": "80-100%"},
    {"id": "DB00252", "name": "Phenytoin", "class": "Anticonvulsant", "brand": ["Dilantin"], "half_life": "22 hours", "bio": "70-100%"},
    {"id": "DB00829", "name": "Diazepam", "class": "Benzodiazepine", "brand": ["Valium"], "half_life": "20-100 hours", "bio": "100%"},
    {"id": "DB01026", "name": "Ketoconazole", "class": "Antifungal", "brand": ["Nizoral"], "half_life": "8 hours", "bio": "Variable"},
    {"id": "DB00196", "name": "Fluconazole", "class": "Antifungal", "brand": ["Diflucan"], "half_life": "30 hours", "bio": "90%"},
]

# ── Enzymes ────────────────────────────────────────────────────────
ENZYMES = [
    {"name": "CYP2D6", "gene": "CYP2D6", "family": "CYP450", "chr": "22", "fn": "Metabolizes ~25% of clinically used drugs"},
    {"name": "CYP2C19", "gene": "CYP2C19", "family": "CYP450", "chr": "10", "fn": "Metabolizes PPIs, antidepressants, antiplatelet agents"},
    {"name": "CYP2C9", "gene": "CYP2C9", "family": "CYP450", "chr": "10", "fn": "Metabolizes warfarin, NSAIDs, oral hypoglycemics"},
    {"name": "CYP3A4", "gene": "CYP3A4", "family": "CYP450", "chr": "7", "fn": "Metabolizes ~50% of all drugs, largest CYP450"},
    {"name": "CYP1A2", "gene": "CYP1A2", "family": "CYP450", "chr": "15", "fn": "Metabolizes caffeine, theophylline, some antipsychotics"},
    {"name": "CYP2B6", "gene": "CYP2B6", "family": "CYP450", "chr": "19", "fn": "Metabolizes efavirenz, bupropion, cyclophosphamide"},
]

# ── Metabolites ────────────────────────────────────────────────────
METABOLITES = [
    {"name": "Norfluoxetine", "active": True, "tox": "50 ng/mL", "half": "4-16 days"},
    {"name": "Morphine", "active": True, "tox": "200 ng/mL", "half": "2-3 hours"},
    {"name": "5-Hydroxyomeprazole", "active": False, "tox": None, "half": "1 hour"},
    {"name": "2-Oxoclopidogrel", "active": True, "tox": None, "half": "0.5 hours"},
    {"name": "Desacetylrifampicin", "active": True, "tox": None, "half": "3 hours"},
    {"name": "S-7-Hydroxywarfarin", "active": False, "tox": "10 mcg/mL", "half": "20 hours"},
    {"name": "NAPQI", "active": True, "tox": "Very low", "half": "2 hours"},
]

# ── Receptors ──────────────────────────────────────────────────────
RECEPTORS = [
    {"name": "Mu-Opioid", "type": "Opioid receptor", "effect": "Pain relief, respiratory depression", "risk": "HIGH"},
    {"name": "5-HT1A", "type": "Serotonin receptor", "effect": "Mood regulation, anxiety", "risk": "HIGH"},
    {"name": "5-HT2A", "type": "Serotonin receptor", "effect": "Hallucinations, platelet aggregation", "risk": "MEDIUM"},
    {"name": "P2Y12", "type": "Purinergic receptor", "effect": "Platelet aggregation inhibition", "risk": "HIGH"},
    {"name": "VKORC1", "type": "Vitamin K receptor", "effect": "Blood coagulation", "risk": "HIGH"},
]

# ── Relationships ──────────────────────────────────────────────────
# (drug_id, enzyme, rel_type, strength, evidence, significance)
DRUG_ENZYME_RELS = [
    ("DB00472", "CYP2D6", "INHIBITS", "strong", "established", "major"),
    ("DB00472", "CYP2C19", "INHIBITS", "moderate", "established", "moderate"),
    ("DB00318", "CYP2D6", "SUBSTRATE_OF", "strong", "established", "major"),
    ("DB00338", "CYP2C19", "INHIBITS", "strong", "established", "major"),
    ("DB00338", "CYP3A4", "SUBSTRATE_OF", "moderate", "established", "moderate"),
    ("DB00758", "CYP2C19", "SUBSTRATE_OF", "strong", "established", "major"),
    ("DB01045", "CYP2C9", "INDUCES", "strong", "established", "major"),
    ("DB01045", "CYP3A4", "INDUCES", "strong", "established", "major"),
    ("DB00682", "CYP2C9", "SUBSTRATE_OF", "strong", "established", "major"),
    ("DB00682", "CYP3A4", "SUBSTRATE_OF", "moderate", "established", "moderate"),
    ("DB00641", "CYP3A4", "SUBSTRATE_OF", "strong", "established", "major"),
    ("DB01050", "CYP3A4", "INHIBITS", "strong", "established", "major"),
    ("DB01026", "CYP3A4", "INHIBITS", "strong", "established", "major"),
    ("DB00196", "CYP2C19", "INHIBITS", "moderate", "established", "moderate"),
    ("DB00196", "CYP2C9", "INHIBITS", "moderate", "established", "moderate"),
    ("DB01211", "CYP3A4", "INHIBITS", "strong", "established", "major"),
    ("DB00564", "CYP3A4", "INDUCES", "strong", "established", "major"),
    ("DB01174", "CYP2C9", "INDUCES", "moderate", "established", "moderate"),
    ("DB01174", "CYP3A4", "INDUCES", "strong", "established", "major"),
    ("DB00829", "CYP3A4", "SUBSTRATE_OF", "moderate", "established", "moderate"),
    ("DB00829", "CYP2C19", "SUBSTRATE_OF", "moderate", "established", "moderate"),
    ("DB01175", "CYP2C19", "SUBSTRATE_OF", "moderate", "established", "moderate"),
    ("DB01175", "CYP2D6", "INHIBITS", "moderate", "established", "moderate"),
    ("DB00316", "CYP2E1", "SUBSTRATE_OF", "strong", "established", "major"),
    ("DB00619", "CYP2C9", "SUBSTRATE_OF", "moderate", "established", "moderate"),
]

# (drug_id, metabolite)
DRUG_PRODUCES = [
    ("DB00472", "Norfluoxetine"),
    ("DB00318", "Morphine"),
    ("DB00338", "5-Hydroxyomeprazole"),
    ("DB00758", "2-Oxoclopidogrel"),
    ("DB01045", "Desacetylrifampicin"),
    ("DB00682", "S-7-Hydroxywarfarin"),
    ("DB00316", "NAPQI"),
]

# (metabolite, receptor, rel_type)
MET_RECEPTOR = [
    ("Morphine", "Mu-Opioid", "ACTIVATES"),
    ("Norfluoxetine", "5-HT1A", "ACTIVATES"),
    ("2-Oxoclopidogrel", "P2Y12", "INHIBITS"),
    ("S-7-Hydroxywarfarin", "VKORC1", "INHIBITS"),
]

DEMO_PATIENT_ID = "demo-patient-001"
DEMO_PATIENT_MEDS = [
    ("DB00472", "20mg", "once_daily", "Depression"),
    ("DB00318", "30mg", "as_needed", "Pain"),
    ("DB00682", "5mg", "once_daily", "Atrial Fibrillation"),
    ("DB00338", "20mg", "once_daily", "GERD"),
    ("DB00945", "81mg", "once_daily", "Cardioprotection"),
]


async def seed():
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    async with driver.session() as s:
        print("Verifying connection...")
        await s.run("RETURN 1")
        print("Connected to Neo4j AuraDB!")

        # Run indexes
        print("\nCreating indexes...")
        indexes = [
            "CREATE INDEX drug_name IF NOT EXISTS FOR (d:Drug) ON (d.name)",
            "CREATE INDEX drug_id IF NOT EXISTS FOR (d:Drug) ON (d.drugbank_id)",
            "CREATE INDEX enzyme_name IF NOT EXISTS FOR (e:Enzyme) ON (e.name)",
            "CREATE INDEX metabolite_name IF NOT EXISTS FOR (m:Metabolite) ON (m.name)",
            "CREATE INDEX receptor_name IF NOT EXISTS FOR (r:Receptor) ON (r.name)",
            "CREATE INDEX patient_id IF NOT EXISTS FOR (p:Patient) ON (p.id)",
            "CREATE INDEX drug_class IF NOT EXISTS FOR (d:Drug) ON (d.class)",
        ]
        for idx in indexes:
            await s.run(idx)
        print(f"  {len(indexes)} indexes created.")

        # Drugs
        print("\nSeeding drugs...")
        for d in DRUGS:
            await s.run(
                """MERGE (d:Drug {drugbank_id: $id})
                SET d.name=$name, d.class=$cls, d.brand_names=$brand,
                    d.half_life=$hl, d.bioavailability=$bio, d.updated_at=datetime()""",
                id=d["id"], name=d["name"], cls=d["class"],
                brand=d["brand"], hl=d["half_life"], bio=d["bio"],
            )
        print(f"  {len(DRUGS)} drugs seeded.")

        # Enzymes
        print("Seeding enzymes...")
        for e in ENZYMES:
            await s.run(
                """MERGE (e:Enzyme {name: $name})
                SET e.gene=$gene, e.family=$fam, e.chromosome=$chr, e.function=$fn""",
                name=e["name"], gene=e["gene"], fam=e["family"],
                chr=e["chr"], fn=e["fn"],
            )
        print(f"  {len(ENZYMES)} enzymes seeded.")

        # Metabolites
        print("Seeding metabolites...")
        for m in METABOLITES:
            await s.run(
                """MERGE (m:Metabolite {name: $name})
                SET m.active=$active, m.toxicity_threshold=$tox, m.half_life=$hl""",
                name=m["name"], active=m["active"], tox=m["tox"], hl=m["half"],
            )
        print(f"  {len(METABOLITES)} metabolites seeded.")

        # Receptors
        print("Seeding receptors...")
        for r in RECEPTORS:
            await s.run(
                """MERGE (r:Receptor {name: $name})
                SET r.type=$type, r.effect=$effect, r.risk_category=$risk""",
                name=r["name"], type=r["type"], effect=r["effect"], risk=r["risk"],
            )
        print(f"  {len(RECEPTORS)} receptors seeded.")

        # Drug → Enzyme relationships
        print("Seeding drug-enzyme relationships...")
        for drug_id, enz, rel, strength, evidence, sig in DRUG_ENZYME_RELS:
            if rel == "SUBSTRATE_OF":
                await s.run(
                    """MATCH (d:Drug {drugbank_id: $did}), (e:Enzyme {name: $enz})
                    MERGE (d)-[r:SUBSTRATE_OF]->(e)
                    SET r.strength=$str, r.evidence_level=$ev, r.clinical_significance=$sig""",
                    did=drug_id, enz=enz, str=strength, ev=evidence, sig=sig,
                )
            elif rel == "INHIBITS":
                await s.run(
                    """MATCH (d:Drug {drugbank_id: $did}), (e:Enzyme {name: $enz})
                    MERGE (d)-[r:INHIBITS]->(e)
                    SET r.strength=$str, r.evidence_level=$ev, r.clinical_significance=$sig""",
                    did=drug_id, enz=enz, str=strength, ev=evidence, sig=sig,
                )
            elif rel == "INDUCES":
                await s.run(
                    """MATCH (d:Drug {drugbank_id: $did}), (e:Enzyme {name: $enz})
                    MERGE (d)-[r:INDUCES]->(e)
                    SET r.strength=$str, r.evidence_level=$ev, r.clinical_significance=$sig""",
                    did=drug_id, enz=enz, str=strength, ev=evidence, sig=sig,
                )
        print(f"  {len(DRUG_ENZYME_RELS)} relationships seeded.")

        # Drug → Metabolite
        print("Seeding drug-metabolite relationships...")
        for did, met in DRUG_PRODUCES:
            await s.run(
                """MATCH (d:Drug {drugbank_id: $did}), (m:Metabolite {name: $met})
                MERGE (d)-[:PRODUCES]->(m)""",
                did=did, met=met,
            )
        print(f"  {len(DRUG_PRODUCES)} PRODUCES relationships seeded.")

        # Metabolite → Receptor
        print("Seeding metabolite-receptor relationships...")
        for met, rec, rel in MET_RECEPTOR:
            if rel == "ACTIVATES":
                await s.run(
                    """MATCH (m:Metabolite {name: $met}), (r:Receptor {name: $rec})
                    MERGE (m)-[:ACTIVATES]->(r)""",
                    met=met, rec=rec,
                )
            else:
                await s.run(
                    """MATCH (m:Metabolite {name: $met}), (r:Receptor {name: $rec})
                    MERGE (m)-[:INHIBITS]->(r)""",
                    met=met, rec=rec,
                )
        print(f"  {len(MET_RECEPTOR)} metabolite-receptor relationships seeded.")

        # Demo patient
        print(f"\nCreating demo patient: {DEMO_PATIENT_ID}")
        await s.run(
            """MERGE (p:Patient {id: $pid})
            SET p.age_range='40-50', p.weight_range='70-80kg', p.created_at=datetime()""",
            pid=DEMO_PATIENT_ID,
        )
        for did, dose, freq, indication in DEMO_PATIENT_MEDS:
            await s.run(
                """MATCH (p:Patient {id: $pid}), (d:Drug {drugbank_id: $did})
                MERGE (p)-[r:TAKES]->(d)
                SET r.dose=$dose, r.frequency=$freq, r.indication=$ind, r.start_date=date()""",
                pid=DEMO_PATIENT_ID, did=did, dose=dose, freq=freq, ind=indication,
            )
        print(f"  Patient takes {len(DEMO_PATIENT_MEDS)} medications.")

        # Validate the gold-standard query
        print("\n── VALIDATION ──")
        result = await s.run(
            """MATCH (d1:Drug {name: "Fluoxetine"})-[:INHIBITS]->(e:Enzyme)<-[:SUBSTRATE_OF]-(d2:Drug {name: "Codeine"})
            RETURN d1.name AS perpetrator, e.name AS enzyme, d2.name AS victim"""
        )
        records = [r.data() async for r in result]
        if records:
            r = records[0]
            print(f"  ✅ {r['perpetrator']} → {r['enzyme']} → {r['victim']}")
        else:
            print("  ❌ Fluoxetine-Codeine interaction NOT found!")

        result2 = await s.run(
            """MATCH (d1:Drug {name: "Omeprazole"})-[:INHIBITS]->(e:Enzyme)<-[:SUBSTRATE_OF]-(d2:Drug {name: "Clopidogrel"})
            RETURN d1.name AS perpetrator, e.name AS enzyme, d2.name AS victim"""
        )
        records2 = [r.data() async for r in result2]
        if records2:
            r = records2[0]
            print(f"  ✅ {r['perpetrator']} → {r['enzyme']} → {r['victim']}")
        else:
            print("  ❌ Omeprazole-Clopidogrel interaction NOT found!")

        result3 = await s.run(
            """MATCH (d1:Drug {name: "Rifampicin"})-[:INDUCES]->(e:Enzyme)<-[:SUBSTRATE_OF]-(d2:Drug {name: "Warfarin"})
            RETURN d1.name AS perpetrator, e.name AS enzyme, d2.name AS victim"""
        )
        records3 = [r.data() async for r in result3]
        if records3:
            r = records3[0]
            print(f"  ✅ {r['perpetrator']} → {r['enzyme']} → {r['victim']}")
        else:
            print("  ❌ Rifampicin-Warfarin interaction NOT found!")

    await driver.close()
    print("\n🎉 Seed complete! Graph is ready.")


if __name__ == "__main__":
    asyncio.run(seed())

"""
Cascadex API — Neo4j AuraDB Service.

Core database service wrapping the Neo4j async driver.
All Cypher traversal queries live here. This is the reasoning engine of Cascadex.
Connects to: Neo4j AuraDB (URI from NEO4J_URI env var)
"""

from neo4j import AsyncGraphDatabase
from typing import Optional


class Neo4jService:
    """Async Neo4j driver wrapper with all Cypher query methods."""

    def __init__(self):
        self.driver = None

    async def connect(self, uri: str, user: str, password: str):
        """Initialize the Neo4j async driver."""
        self.driver = AsyncGraphDatabase.driver(
            uri, auth=(user, password)
        )
        # Verify connectivity
        async with self.driver.session() as session:
            await session.run("RETURN 1")

    async def close(self):
        """Close the Neo4j driver."""
        if self.driver:
            await self.driver.close()

    # ----------------------------------------------------------------
    # CORE QUERY: Multi-hop interaction chain detection
    # ----------------------------------------------------------------
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

    # ----------------------------------------------------------------
    # BLAST RADIUS: Downstream effects of enzyme inhibition
    # ----------------------------------------------------------------
    async def get_blast_radius(self, enzyme_name: str, patient_meds: list) -> list:
        """
        All downstream effects of a single enzyme being inhibited.
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
                patientMeds=patient_meds,
            )
            return [record.data() async for record in result]

    # ----------------------------------------------------------------
    # SIMULATE: What-if drug addition without persistence
    # ----------------------------------------------------------------
    async def simulate_add_drug(self, patient_id: str, new_drug_id: str) -> list:
        """
        Simulate adding a drug to a patient's regimen without persisting.
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
                newDrugId=new_drug_id,
            )
            return [record.data() async for record in result]

    # ----------------------------------------------------------------
    # FULL GRAPH: Complete visualization data
    # ----------------------------------------------------------------
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
            collect(DISTINCT CASE WHEN e IS NOT NULL THEN {id: e.name, label: e.name, type: 'enzyme', family: e.family} END) AS enzymeNodes,
            collect(DISTINCT CASE WHEN m IS NOT NULL THEN {id: m.name, label: m.name, type: 'metabolite', active: m.active} END) AS metNodes,
            collect(DISTINCT CASE WHEN rec IS NOT NULL THEN {id: rec.name, label: rec.name, type: 'receptor', effect: rec.effect} END) AS recNodes,
            collect(DISTINCT CASE WHEN r1 IS NOT NULL THEN {source: d.drugbank_id, target: e.name, type: type(r1), strength: r1.strength} END) AS enzymeEdges,
            collect(DISTINCT CASE WHEN r2 IS NOT NULL THEN {source: d.drugbank_id, target: m.name, type: 'PRODUCES'} END) AS metEdges,
            collect(DISTINCT CASE WHEN r3 IS NOT NULL THEN {source: m.name, target: rec.name, type: type(r3)} END) AS recEdges
        RETURN
            [n IN drugNodes + enzymeNodes + metNodes + recNodes WHERE n IS NOT NULL] AS nodes,
            [e IN enzymeEdges + metEdges + recEdges WHERE e IS NOT NULL] AS edges
        """
        async with self.driver.session() as session:
            result = await session.run(query, patientId=patient_id)
            record = await result.single()
            return record.data() if record else {"nodes": [], "edges": []}

    # ----------------------------------------------------------------
    # DRUG LOOKUP
    # ----------------------------------------------------------------
    async def lookup_drug_by_name(self, name: str) -> list:
        """Search for drugs by name (case-insensitive partial match)."""
        query = """
        MATCH (d:Drug)
        WHERE toLower(d.name) CONTAINS toLower($name)
        RETURN d {.*} AS drug
        LIMIT 10
        """
        async with self.driver.session() as session:
            result = await session.run(query, name=name)
            return [record.data()["drug"] async for record in result]

    async def get_drug_by_id(self, drugbank_id: str) -> Optional[dict]:
        """Get a single drug by its DrugBank ID."""
        query = """
        MATCH (d:Drug {drugbank_id: $drugbankId})
        RETURN d {.*} AS drug
        """
        async with self.driver.session() as session:
            result = await session.run(query, drugbankId=drugbank_id)
            record = await result.single()
            return record.data()["drug"] if record else None

    # ----------------------------------------------------------------
    # PATIENT MANAGEMENT
    # ----------------------------------------------------------------
    async def create_patient(self, patient_id: str, age_range: str = None, weight_range: str = None) -> dict:
        """Create an anonymized patient node."""
        query = """
        MERGE (p:Patient {id: $patientId})
        ON CREATE SET p.created_at = datetime(),
                      p.age_range = $ageRange,
                      p.weight_range = $weightRange
        RETURN p {.*} AS patient
        """
        async with self.driver.session() as session:
            result = await session.run(
                query,
                patientId=patient_id,
                ageRange=age_range,
                weightRange=weight_range,
            )
            record = await result.single()
            return record.data()["patient"] if record else None

    async def add_patient_medication(
        self, patient_id: str, drugbank_id: str,
        dose: str = None, frequency: str = None, indication: str = None
    ) -> dict:
        """Add a TAKES relationship between patient and drug."""
        query = """
        MATCH (p:Patient {id: $patientId})
        MATCH (d:Drug {drugbank_id: $drugbankId})
        MERGE (p)-[r:TAKES]->(d)
        ON CREATE SET r.dose = $dose,
                      r.frequency = $frequency,
                      r.indication = $indication,
                      r.start_date = date()
        RETURN d.name AS drug_name, d.drugbank_id AS drugbank_id
        """
        async with self.driver.session() as session:
            result = await session.run(
                query,
                patientId=patient_id,
                drugbankId=drugbank_id,
                dose=dose,
                frequency=frequency,
                indication=indication,
            )
            record = await result.single()
            return record.data() if record else None

    async def remove_patient_medication(self, patient_id: str, drugbank_id: str) -> bool:
        """Remove a TAKES relationship between patient and drug."""
        query = """
        MATCH (p:Patient {id: $patientId})-[r:TAKES]->(d:Drug {drugbank_id: $drugbankId})
        DELETE r
        RETURN count(r) AS deleted
        """
        async with self.driver.session() as session:
            result = await session.run(
                query,
                patientId=patient_id,
                drugbankId=drugbank_id,
            )
            record = await result.single()
            return record.data()["deleted"] > 0 if record else False

    async def get_patient_medications(self, patient_id: str) -> list:
        """Get all medications a patient is currently taking."""
        query = """
        MATCH (p:Patient {id: $patientId})-[r:TAKES]->(d:Drug)
        RETURN d.drugbank_id AS drugbank_id,
               d.name AS name,
               d.class AS class,
               r.dose AS dose,
               r.frequency AS frequency,
               r.start_date AS start_date
        """
        async with self.driver.session() as session:
            result = await session.run(query, patientId=patient_id)
            return [record.data() async for record in result]

    async def get_patient_alerts(self, patient_id: str) -> list:
        """Get current interaction alerts for a patient, sorted by severity."""
        interactions = await self.get_patient_interactions(patient_id)
        # Classify severity based on strength values
        for interaction in interactions:
            strengths = interaction.get("strengths", [])
            if "strong" in strengths:
                interaction["severity"] = "critical"
            elif "moderate" in strengths:
                interaction["severity"] = "moderate"
            else:
                interaction["severity"] = "minor"
        # Sort: critical first
        severity_order = {"critical": 0, "moderate": 1, "minor": 2}
        interactions.sort(key=lambda x: severity_order.get(x.get("severity", "minor"), 3))
        return interactions

    # ----------------------------------------------------------------
    # CHAIN DETAIL: Full interaction chain for a specific drug pair
    # ----------------------------------------------------------------
    async def get_chain_detail(
        self, perpetrator_id: str, victim_id: str, enzyme_name: str
    ) -> dict | None:
        """
        Full chain traversal for a specific drug-drug interaction.

        Walks the path: Drug1 -[INHIBITS|INDUCES]-> Enzyme <-[SUBSTRATE_OF]- Drug2,
        then continues: Drug2 -[PRODUCES]-> Metabolite -[ACTIVATES|INHIBITS]-> Receptor.
        Returns the complete path data including downstream metabolite/receptor effects.
        """
        query = """
        MATCH (d1:Drug {drugbank_id: $perpetratorId})
              -[r1:INHIBITS|INDUCES]->(e:Enzyme {name: $enzymeName})
              <-[r2:SUBSTRATE_OF]-(d2:Drug {drugbank_id: $victimId})
        OPTIONAL MATCH (d2)-[r3:PRODUCES]->(met:Metabolite)
                       -[r4:ACTIVATES|INHIBITS]->(rec:Receptor)
        RETURN
            d1.name AS perpetrator,
            d1.drugbank_id AS perpetrator_id,
            d1.class AS perpetrator_class,
            type(r1) AS interaction_type,
            r1.strength AS interaction_strength,
            e.name AS enzyme,
            e.family AS enzyme_family,
            d2.name AS victim,
            d2.drugbank_id AS victim_id,
            d2.class AS victim_class,
            collect(DISTINCT CASE WHEN met IS NOT NULL THEN {
                metabolite: met.name,
                active: met.active,
                toxicity_threshold: met.toxicity_threshold,
                receptor: rec.name,
                receptor_effect: rec.effect,
                receptor_action: type(r4),
                risk_category: rec.risk_category
            } END) AS downstream_effects
        """
        async with self.driver.session() as session:
            result = await session.run(
                query,
                perpetratorId=perpetrator_id,
                victimId=victim_id,
                enzymeName=enzyme_name,
            )
            record = await result.single()
            if not record:
                return None
            data = record.data()
            # Filter out null entries from downstream_effects
            data["downstream_effects"] = [
                e for e in data.get("downstream_effects", []) if e is not None
            ]
            return data

    # ----------------------------------------------------------------
    # ENZYME DETAIL: Enzyme info + related drugs
    # ----------------------------------------------------------------
    async def get_enzyme_detail(self, enzyme_name: str) -> Optional[dict]:
        """
        Return enzyme info plus all drugs that are substrates of it
        and all drugs that inhibit or induce it.

        Uses traversal: Enzyme <-[SUBSTRATE_OF]- Drug (substrates)
                        Enzyme <-[INHIBITS|INDUCES]- Drug (perpetrators)
        """
        query = """
        MATCH (e:Enzyme {name: $enzymeName})
        OPTIONAL MATCH (e)<-[:SUBSTRATE_OF]-(substrate:Drug)
        OPTIONAL MATCH (e)<-[perp_rel:INHIBITS|INDUCES]-(perpetrator:Drug)
        RETURN
            e.name AS name,
            e.family AS family,
            collect(DISTINCT CASE WHEN substrate IS NOT NULL THEN {
                drugbank_id: substrate.drugbank_id,
                name: substrate.name,
                class: substrate.class
            } END) AS substrates,
            collect(DISTINCT CASE WHEN perpetrator IS NOT NULL THEN {
                drugbank_id: perpetrator.drugbank_id,
                name: perpetrator.name,
                class: perpetrator.class,
                action: type(perp_rel),
                strength: perp_rel.strength
            } END) AS perpetrators
        """
        async with self.driver.session() as session:
            result = await session.run(query, enzymeName=enzyme_name)
            record = await result.single()
            if not record:
                return None
            data = record.data()
            data["substrates"] = [s for s in data.get("substrates", []) if s is not None]
            data["perpetrators"] = [p for p in data.get("perpetrators", []) if p is not None]
            return data

    # ----------------------------------------------------------------
    # FULLTEXT DRUG SEARCH
    # ----------------------------------------------------------------
    async def search_drugs_fulltext(self, query_text: str) -> list:
        """
        Search drugs by name using fulltext index if available,
        otherwise fall back to case-insensitive CONTAINS matching.
        Returns top 10 matches.
        """
        # Try fulltext index first
        fulltext_query = """
        CALL db.index.fulltext.queryNodes('drug_name_fulltext', $query)
        YIELD node, score
        RETURN node {.*, score: score} AS drug
        LIMIT 10
        """
        fallback_query = """
        MATCH (d:Drug)
        WHERE toLower(d.name) CONTAINS toLower($query)
        RETURN d {.*} AS drug
        LIMIT 10
        """
        async with self.driver.session() as session:
            try:
                result = await session.run(fulltext_query, query=query_text)
                records = [record.data()["drug"] async for record in result]
                if records:
                    return records
            except Exception:
                pass
            # Fallback to CONTAINS
            result = await session.run(fallback_query, query=query_text)
            return [record.data()["drug"] async for record in result]

    # ----------------------------------------------------------------
    # ALL PATIENTS: With medication and interaction counts
    # ----------------------------------------------------------------
    async def get_all_patients(self) -> list:
        """
        Return all patients with their medication count and interaction count.

        Uses traversal to count TAKES edges and multi-hop interaction paths.
        """
        query = """
        MATCH (p:Patient)
        OPTIONAL MATCH (p)-[:TAKES]->(d:Drug)
        WITH p, count(DISTINCT d) AS med_count
        OPTIONAL MATCH (p)-[:TAKES]->(d1:Drug)
                       -[:INHIBITS|INDUCES]->(e:Enzyme)
                       <-[:SUBSTRATE_OF]-(d2:Drug)
                       <-[:TAKES]-(p)
        WHERE d1 <> d2
        WITH p, med_count, count(DISTINCT d1.drugbank_id + ':' + d2.drugbank_id + ':' + e.name) AS interaction_count
        RETURN
            p.id AS id,
            p.age_range AS age_range,
            p.weight_range AS weight_range,
            p.created_at AS created_at,
            med_count,
            interaction_count
        ORDER BY interaction_count DESC
        """
        async with self.driver.session() as session:
            result = await session.run(query)
            return [record.data() async for record in result]

    # ----------------------------------------------------------------
    # HIGH-RISK PATIENTS: At least one 'strong' strength interaction
    # ----------------------------------------------------------------
    async def get_high_risk_patients(self) -> list:
        """
        Return patients that have at least one interaction chain
        with 'strong' strength, indicating high clinical risk.

        Uses traversal through the full interaction path to check
        relationship strength properties.
        """
        query = """
        MATCH (p:Patient)-[:TAKES]->(d1:Drug)
              -[r:INHIBITS|INDUCES]->(e:Enzyme)
              <-[:SUBSTRATE_OF]-(d2:Drug)
              <-[:TAKES]-(p)
        WHERE d1 <> d2 AND r.strength = 'strong'
        WITH p, count(DISTINCT d1.drugbank_id + ':' + d2.drugbank_id + ':' + e.name) AS strong_interactions
        OPTIONAL MATCH (p)-[:TAKES]->(d:Drug)
        WITH p, strong_interactions, count(DISTINCT d) AS med_count
        RETURN
            p.id AS id,
            p.age_range AS age_range,
            p.weight_range AS weight_range,
            p.created_at AS created_at,
            med_count,
            strong_interactions
        ORDER BY strong_interactions DESC
        """
        async with self.driver.session() as session:
            result = await session.run(query)
            return [record.data() async for record in result]


# Singleton instance
neo4j_service = Neo4jService()

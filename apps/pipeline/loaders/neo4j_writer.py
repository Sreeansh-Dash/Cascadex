import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from neo4j import GraphDatabase

env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
logger = logging.getLogger(__name__)

class Neo4jWriter:
    def __init__(self):
        uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        user = os.getenv("NEO4J_USERNAME", "neo4j")
        password = os.getenv("NEO4J_PASSWORD", "password")

        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def setup_constraints(self):
        with self.driver.session() as session:
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (d:Drug) REQUIRE d.id IS UNIQUE")
            session.run("CREATE CONSTRAINT IF NOT EXISTS FOR (e:Enzyme) REQUIRE e.id IS UNIQUE")
            logger.info("Constraints created/verified in Neo4j.")

    def write_interaction(self, drug1_name: str, drug2_name: str, ai_data: dict, description: str):
        """
        Takes the AI structured JSON and writes the appropriate nodes and edges.
        """
        enzyme_name = ai_data.get("enzyme")
        mechanism = ai_data.get("mechanism")
        perpetrator = ai_data.get("perpetrator")
        victim = ai_data.get("victim")
        severity = ai_data.get("severity", "moderate")

        d1_id = drug1_name.upper().replace(" ", "_")
        d2_id = drug2_name.upper().replace(" ", "_")

        with self.driver.session() as session:
            # Always ensure both drugs exist
            session.run("""
                MERGE (d1:Drug {id: $d1_id}) ON CREATE SET d1.name = $d1_name
                MERGE (d2:Drug {id: $d2_id}) ON CREATE SET d2.name = $d2_name
            """, d1_id=d1_id, d1_name=drug1_name, d2_id=d2_id, d2_name=drug2_name)

            if enzyme_name and enzyme_name.upper() != "NULL" and mechanism and perpetrator and victim:
                # Resolve perpetrator/victim
                is_d1_perp = perpetrator.lower() in drug1_name.lower()
                perp_id = d1_id if is_d1_perp else d2_id
                vict_id = d2_id if is_d1_perp else d1_id

                # Default victim to SUBSTRATE_OF
                # Perpetrator to mechanism (INHIBITS or INDUCES)
                mech = mechanism.upper()
                if mech not in ["INHIBITS", "INDUCES", "SUBSTRATE_OF"]:
                    mech = "INTERACTS_WITH"

                query = f"""
                MERGE (e:Enzyme {{id: $enzyme, name: $enzyme}})
                MERGE (p:Drug {{id: $perp_id}})
                MERGE (v:Drug {{id: $vict_id}})
                MERGE (p)-[r1:{mech} {{severity: $severity, description: $desc}}]->(e)
                MERGE (v)-[r2:SUBSTRATE_OF]->(e)
                """
                session.run(query, enzyme=enzyme_name.upper(), perp_id=perp_id, vict_id=vict_id, severity=severity, desc=description)
                logger.info(f"Created pathway: {perp_id} -[{mech}]-> {enzyme_name} <-[SUBSTRATE_OF]- {vict_id}")
            else:
                # Generic interaction fallback
                query = """
                MERGE (d1:Drug {id: $d1_id})
                MERGE (d2:Drug {id: $d2_id})
                MERGE (d1)-[r:INTERACTS_WITH {severity: $severity, description: $desc}]->(d2)
                """
                session.run(query, d1_id=d1_id, d2_id=d2_id, severity=severity, desc=description)
                logger.info(f"Created generic interaction: {d1_id} <-> {d2_id}")

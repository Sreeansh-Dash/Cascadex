"""Quick validation of seeded Neo4j data."""
import asyncio, os
from pathlib import Path
from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase

load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
URI = os.getenv("NEO4J_URI")
USER = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
PWD = os.getenv("NEO4J_PASSWORD")

async def validate():
    driver = AsyncGraphDatabase.driver(URI, auth=(USER, PWD))
    async with driver.session() as s:
        # Test 1: Fluoxetine -> CYP2D6 -> Codeine
        r = await s.run(
            'MATCH (d1:Drug {name:"Fluoxetine"})-[:INHIBITS]->(e:Enzyme)'
            '<-[:SUBSTRATE_OF]-(d2:Drug {name:"Codeine"}) '
            'RETURN d1.name AS p, e.name AS e, d2.name AS v'
        )
        recs = [rec.data() async for rec in r]
        print("Test 1:", "PASS" if recs else "FAIL", recs[0] if recs else "")

        # Test 2: Omeprazole -> CYP2C19 -> Clopidogrel
        r2 = await s.run(
            'MATCH (d1:Drug {name:"Omeprazole"})-[:INHIBITS]->(e:Enzyme)'
            '<-[:SUBSTRATE_OF]-(d2:Drug {name:"Clopidogrel"}) '
            'RETURN d1.name AS p, e.name AS e, d2.name AS v'
        )
        recs2 = [rec.data() async for rec in r2]
        print("Test 2:", "PASS" if recs2 else "FAIL", recs2[0] if recs2 else "")

        # Test 3: Rifampicin -> CYP2C9 -> Warfarin
        r3 = await s.run(
            'MATCH (d1:Drug {name:"Rifampicin"})-[:INDUCES]->(e:Enzyme)'
            '<-[:SUBSTRATE_OF]-(d2:Drug {name:"Warfarin"}) '
            'RETURN d1.name AS p, e.name AS e, d2.name AS v'
        )
        recs3 = [rec.data() async for rec in r3]
        print("Test 3:", "PASS" if recs3 else "FAIL", recs3[0] if recs3 else "")

        # Count nodes
        r4 = await s.run("MATCH (n) RETURN labels(n)[0] AS label, count(n) AS c ORDER BY c DESC")
        counts = [rec.data() async for rec in r4]
        print("\nNode counts:")
        for c in counts:
            print(f"  {c['label']}: {c['c']}")

    await driver.close()

asyncio.run(validate())

"""Quick verification script to check Neo4j seed data status."""
import asyncio
import os
from pathlib import Path

from dotenv import load_dotenv
from neo4j import AsyncGraphDatabase

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=PROJECT_ROOT / ".env")

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USER = os.getenv("NEO4J_USERNAME") or os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")


async def verify():
    print("Connecting to Neo4j...")
    driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    async with driver.session() as session:
        # Count nodes
        for label in ["Drug", "Enzyme", "Metabolite", "Receptor", "Patient"]:
            result = await session.run(f"MATCH (n:{label}) RETURN count(n) AS cnt")
            record = await result.single()
            print(f"  {label}: {record['cnt']}")

        # Gold standard test
        result = await session.run(
            'MATCH (d1:Drug {name: "Fluoxetine"})-[:INHIBITS]->(e:Enzyme)'
            '<-[:SUBSTRATE_OF]-(d2:Drug {name: "Codeine"}) '
            'RETURN d1.name AS p, e.name AS enz, d2.name AS v'
        )
        record = await result.single()
        if record:
            print(f"\n  GOLD TEST PASS: {record['p']} -> {record['enz']} -> {record['v']}")
        else:
            print("\n  GOLD TEST FAIL: Fluoxetine-Codeine interaction NOT found!")
            print("  >>> Run seed_demo_data.py first! <<<")

    await driver.close()
    print("\nVerification complete.")


if __name__ == "__main__":
    asyncio.run(verify())

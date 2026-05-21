import json
import typer
import logging
from pathlib import Path
from loaders.nlm_client import NLMClient
from loaders.ai_extractor import AIExtractor
from loaders.neo4j_writer import Neo4jWriter

app = typer.Typer()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.command()
def seed_graph(limit: int = 50):
    """
    Runs the full ETL pipeline:
    1. Loads seed drugs.
    2. Queries NLM RxNav for interactions.
    3. Uses Groq to extract structured enzyme pathways.
    4. Writes to Neo4j.
    """
    seed_file = Path(__file__).parent / "data" / "seed_drugs.json"
    if not seed_file.exists():
        typer.secho(f"Seed file not found: {seed_file}", fg=typer.colors.RED)
        raise typer.Exit(code=1)
        
    with open(seed_file, 'r') as f:
        drugs = json.load(f)
        
    drugs = drugs[:limit]
    typer.secho(f"Loaded {len(drugs)} drugs from seed list.", fg=typer.colors.GREEN)
    
    ai = AIExtractor()
    writer = Neo4jWriter()
    
    writer.setup_constraints()
    
    total_interactions = 0
    
    for drug in drugs:
        typer.echo(f"Generating interactions for {drug} via Groq...")
        interactions = ai.generate_interactions(drug)
        
        for ai_data in interactions:
            d1 = ai_data.get('perpetrator')
            d2 = ai_data.get('victim')
            desc = ai_data.get('description', '')
            
            if d1 and d2:
                writer.write_interaction(d1, d2, ai_data, desc)
                total_interactions += 1
                
    writer.close()
    typer.secho(f"Pipeline complete. Ingested {total_interactions} structured interaction pathways.", fg=typer.colors.GREEN, bold=True)

if __name__ == "__main__":
    app()

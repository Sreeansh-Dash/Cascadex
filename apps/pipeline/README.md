# Cascadex Data Pipeline

Standalone Python CLI tool for seeding and maintaining the Neo4j graph database with drug interaction data.

## Data Sources

| Source | URL | Access |
|---|---|---|
| DrugBank | https://go.drugbank.com/releases/latest#open-data | Free academic registration |
| KEGG | https://rest.kegg.jp | Free REST API |
| OpenFDA | https://api.fda.gov | Free, rate-limited |
| RxNorm | https://rxnav.nlm.nih.gov/REST | Free REST API |

## Setup

```powershell
# Activate venv
.\venv\Scripts\Activate.ps1

# Download DrugBank XML into data/ directory first
# Then run the seed command
python main.py seed --drugbank-xml ./data/full_database.xml --limit 500
```

## CLI Commands

```bash
python main.py seed              # Seed Neo4j with DrugBank data
python main.py update-adverse-events  # Update adverse event data
python main.py validate          # Validate graph integrity
python main.py test-interaction  # Test a known drug interaction
```

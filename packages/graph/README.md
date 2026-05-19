# Cascadex Graph Utilities

This package contains Neo4j Cypher scripts and Python utilities for managing the Cascadex graph database.

## Files

| File | Purpose |
|---|---|
| `setup_indexes.cypher` | Index creation script — run before loading data |
| `test_queries.py` | Validates core Cypher queries against known drug pairs |
| `seed_demo_data.py` | Seeds demo patient data for testing/demos |

## Usage

```powershell
# Activate venv
.\venv\Scripts\Activate.ps1

# Run query tests
python test_queries.py

# Seed demo data
python seed_demo_data.py
```

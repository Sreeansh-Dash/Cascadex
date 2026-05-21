"""
Cascadex API — Application Configuration.

Loads settings from environment variables using pydantic-settings.
All external service URIs, API keys, and app settings are defined here.

The .env file is resolved relative to this file's location, walking up to
the project root. This works in all contexts: local dev, Docker, CI, and Render.
"""

import pathlib
from functools import lru_cache

from pydantic_settings import BaseSettings


def _find_env_file() -> str | None:
    """
    Walk up from this file to find .env in an ancestor directory.
    Works whether uvicorn is started from packages/api/ or from project root.
    """
    current = pathlib.Path(__file__).resolve().parent
    for _ in range(5):  # Check up to 5 levels up
        candidate = current / ".env"
        if candidate.exists():
            return str(candidate)
        current = current.parent
    return None


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # --- Neo4j AuraDB ---
    neo4j_uri: str
    neo4j_user: str = "neo4j"
    neo4j_username: str = ""  # AuraDB uses instance-specific usernames
    neo4j_password: str

    @property
    def neo4j_effective_user(self) -> str:
        """AuraDB may use instance-specific usernames (NEO4J_USERNAME)."""
        return self.neo4j_username or self.neo4j_user

    # --- Groq ---
    groq_api_key: str

    # --- OpenFDA ---
    fda_api_base: str = "https://api.fda.gov"

    # --- RxNorm ---
    rxnorm_api_base: str = "https://rxnav.nlm.nih.gov/REST"

    # --- KEGG ---
    kegg_api_base: str = "https://rest.kegg.jp"

    # --- App ---
    api_port: int = 8000
    environment: str = "development"
    api_secret_key: str = "change-me-to-a-random-string"

    model_config = {
        "env_file": _find_env_file(),
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Returns cached settings instance."""
    return Settings()

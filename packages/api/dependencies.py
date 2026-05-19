"""
Cascadex API — Shared FastAPI dependencies.

Dependency injection for Neo4j sessions, settings, and shared services.
"""

from fastapi import Depends
from .config import Settings, get_settings
from .services.neo4j_service import neo4j_service


async def get_neo4j():
    """Yields a Neo4j async session for use in route handlers."""
    async with neo4j_service.driver.session() as session:
        yield session


def get_config() -> Settings:
    """Returns the application settings."""
    return get_settings()

"""
Cascadex API — FastAPI Application Factory.

Main entry point for the Cascadex backend. Configures the FastAPI app
with CORS, lifespan management for Neo4j connections, and all route handlers.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import admin, drugs, explain, graph, interactions, patient
from .services.groq_service import init_groq
from .services.neo4j_service import neo4j_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifecycle — connect/disconnect Neo4j driver."""
    settings = get_settings()
    await neo4j_service.connect(
        uri=settings.neo4j_uri,
        user=settings.neo4j_effective_user,
        password=settings.neo4j_password,
    )
    init_groq(settings.groq_api_key)
    yield
    await neo4j_service.close()


app = FastAPI(
    title="Cascadex API",
    description="Drug metabolic pathway intelligence via graph traversal. "
    "Detects multi-hop drug interaction chains using Neo4j AuraDB.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
# Auth removed — app is local-first, no server accounts required
app.include_router(drugs.router, prefix="/api/drugs", tags=["Drugs"])
app.include_router(patient.router, prefix="/api/patient", tags=["Patient"])
app.include_router(interactions.router, prefix="/api/interactions", tags=["Interactions"])
app.include_router(graph.router, prefix="/api/graph", tags=["Graph"])
app.include_router(explain.router, prefix="/api/explain", tags=["Explain"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint. Returns Neo4j connectivity status."""
    neo4j_ok = neo4j_service.driver is not None
    return {
        "status": "healthy" if neo4j_ok else "degraded",
        "service": "cascadex-api",
        "version": "1.0.0",
        "neo4j_connected": neo4j_ok,
    }

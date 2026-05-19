"""
Cascadex API — In-Memory Cache Service.

Simple TTL-based cache for graph query results to reduce Neo4j load.
Uses an in-memory dict with expiry timestamps.
Can be swapped for Redis in production.
"""

import time
from typing import Any, Optional


class CacheService:
    """Simple in-memory TTL cache."""

    def __init__(self, default_ttl: int = 300):
        """
        Initialize cache with a default TTL in seconds.
        Default: 5 minutes.
        """
        self._store: dict[str, tuple[Any, float]] = {}
        self._default_ttl = default_ttl

    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache. Returns None if expired or missing."""
        if key in self._store:
            value, expiry = self._store[key]
            if time.time() < expiry:
                return value
            else:
                del self._store[key]
        return None

    def set(self, key: str, value: Any, ttl: int = None):
        """Set a value in cache with optional TTL override."""
        expiry = time.time() + (ttl or self._default_ttl)
        self._store[key] = (value, expiry)

    def delete(self, key: str):
        """Remove a key from cache."""
        self._store.pop(key, None)

    def clear(self):
        """Clear all cached values."""
        self._store.clear()

    def invalidate_patient(self, patient_id: str):
        """Invalidate all cache entries for a specific patient."""
        keys_to_remove = [k for k in self._store if patient_id in k]
        for k in keys_to_remove:
            del self._store[k]


# Singleton instance
cache_service = CacheService()

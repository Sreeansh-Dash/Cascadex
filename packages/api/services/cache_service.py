"""
Cascadex API — In-Memory Cache Service.

Simple TTL-based cache for graph query results and Groq explanations.
Uses an in-memory dict with expiry timestamps.
Can be swapped for Redis in production.
"""

import time
from typing import Any, Callable, Coroutine, Optional


class CacheService:
    """Simple in-memory TTL cache with async helper."""

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

    async def get_or_set(
        self,
        key: str,
        async_fn: Callable[[], Coroutine[Any, Any, Any]],
        ttl: int = None,
    ) -> Any:
        """
        Check cache first; on miss, call async_fn(), cache the result, return it.
        This is the primary helper for wiring cache into async service calls.
        """
        cached = self.get(key)
        if cached is not None:
            return cached
        value = await async_fn()
        self.set(key, value, ttl=ttl)
        return value

    @property
    def stats(self) -> dict:
        """Return cache statistics for debugging."""
        now = time.time()
        total = len(self._store)
        alive = sum(1 for _, (_, exp) in self._store.items() if exp > now)
        return {"total_entries": total, "alive_entries": alive, "expired_entries": total - alive}


# Singleton instance
cache_service = CacheService()

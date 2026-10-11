from functools import lru_cache
import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


def _resolve_env_file() -> Optional[str]:
    """Resolve the env_file following the same priority as the API service.

    Priority (first match wins):
      1. Explicitly named file via ``PROM_ENV_FILE`` (for testing).
      2. ``.env.${PROM_ENV}`` when ``PROM_ENV`` is set (e.g. ``development``, ``staging``).
      3. ``.env.local``.
      4. ``.env`` (default for production).

    Docker/Kubernetes typically inject environment variables directly so none
    of the files need to exist; ``env_file_encoding`` + ``extra="ignore"`` +
    the ``Optional`` return ensures a missing file is silently tolerated.
    """

    explicit = os.environ.get("PROM_ENV_FILE")
    if explicit and Path(explicit).is_file():
        return explicit

    env = os.environ.get("PROM_ENV") or os.environ.get("NODE_ENV") or os.environ.get("PYTHON_ENV")
    if env:
        candidate = Path(f".env.{env}")
        if candidate.is_file():
            return str(candidate)

    local = Path(".env.local")
    if local.is_file():
        return str(local)

    default = Path(".env")
    return str(default) if default.is_file() else None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_resolve_env_file(),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    api_port: int = 8000
    log_level: str = "info"
    database_url: Optional[str] = None
    redis_url: Optional[str] = None
    minio_endpoint: Optional[str] = None
    minio_port: int = 9000
    minio_use_ssl: bool = False
    minio_access_key: Optional[str] = None
    minio_secret_key: Optional[str] = None
    minio_bucket: Optional[str] = None


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

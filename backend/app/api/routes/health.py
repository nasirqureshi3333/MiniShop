from fastapi import APIRouter

from app.schemas.health import HealthStatus

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthStatus, summary="Health check", description="Liveness probe for the API.")
def health_check() -> HealthStatus:
    return HealthStatus()

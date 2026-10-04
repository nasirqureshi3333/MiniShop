import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.error_handlers import register_error_handlers
from app.frontend import register_frontend
from app.repositories.product_repository import ProductRepository

logger = logging.getLogger(__name__)

API_DESCRIPTION = """
REST API for a bilingual (English / Arabic) mini e-commerce product catalog.

* Every content endpoint accepts `lang` (`en` or `ar`, default `en`) and returns localized text.
* Product data is served from a static JSON file validated at startup.
* Errors share one envelope: `{"error": {"code", "message", "details"}}`.
"""

OPENAPI_TAGS = [
    {"name": "Products", "description": "Browse, search, filter and sort the product catalog."},
    {"name": "Categories", "description": "Product categories derived from the catalog."},
    {"name": "Health", "description": "Service health."},
]


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=API_DESCRIPTION,
        openapi_tags=OPENAPI_TAGS,
    )
    app.state.product_repository = ProductRepository.from_json_file(settings.products_file)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET"],
        allow_headers=["*"],
    )
    register_error_handlers(app)
    app.include_router(api_router, prefix=settings.api_prefix)

    if settings.frontend_dir.is_dir():
        register_frontend(app, settings.frontend_dir, settings.api_prefix)
        logger.info("Serving the static frontend from %s", settings.frontend_dir)
    return app


app = create_app()

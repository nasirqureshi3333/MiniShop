from typing import Annotated

from fastapi import APIRouter, Query

from app.api.dependencies import ProductServiceDep
from app.api.openapi import CATEGORY_LIST_RESPONSES
from app.schemas.product import CategoryList
from app.schemas.query import LanguageQuery

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=CategoryList,
    summary="List categories",
    description=(
        "Returns the unique product categories derived from the product data (not hardcoded), "
        "localized to `lang` and sorted by name. Use `slug` to filter `/api/products` by category."
    ),
    responses=CATEGORY_LIST_RESPONSES,
)
def list_categories(query: Annotated[LanguageQuery, Query()], service: ProductServiceDep) -> CategoryList:
    return service.list_categories(query.lang)

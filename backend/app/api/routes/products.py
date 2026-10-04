from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.api.dependencies import ProductServiceDep
from app.api.openapi import PRODUCT_DETAIL_RESPONSES, PRODUCT_LIST_RESPONSES
from app.schemas.product import Product, ProductList
from app.schemas.query import LanguageQuery, ProductListQuery

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "",
    response_model=ProductList,
    summary="List products",
    description=(
        "Returns the product catalog localized to `lang`. Supports name search, category filtering, "
        "an inclusive price range and price sorting. All filters are optional and can be combined. "
        "Unknown query parameters are rejected with `422`."
    ),
    responses=PRODUCT_LIST_RESPONSES,
)
def list_products(query: Annotated[ProductListQuery, Query()], service: ProductServiceDep) -> ProductList:
    return service.list_products(query)


@router.get(
    "/{product_id}",
    response_model=Product,
    summary="Get a product by id",
    description="Returns a single product localized to `lang`, or `404` when no product has this id.",
    responses=PRODUCT_DETAIL_RESPONSES,
)
def get_product(
    product_id: Annotated[int, Path(gt=0, description="Positive integer product id.", examples=[1])],
    query: Annotated[LanguageQuery, Query()],
    service: ProductServiceDep,
) -> Product:
    return service.get_product(product_id, query.lang)

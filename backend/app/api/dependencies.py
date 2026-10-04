from typing import Annotated

from fastapi import Depends, Request

from app.repositories.product_repository import ProductRepository
from app.services.product_service import ProductService


def get_product_repository(request: Request) -> ProductRepository:
    return request.app.state.product_repository


def get_product_service(
    repository: Annotated[ProductRepository, Depends(get_product_repository)],
) -> ProductService:
    return ProductService(repository)


ProductServiceDep = Annotated[ProductService, Depends(get_product_service)]

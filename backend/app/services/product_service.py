import re
from collections.abc import Iterable

from app.core.exceptions import ProductNotFoundError
from app.models.product import LocalizedText, ProductRecord
from app.repositories.product_repository import ProductRepository
from app.schemas.common import Language, SortOrder
from app.schemas.product import Category, CategoryList, Product, ProductList
from app.schemas.query import ProductListQuery

_NON_ALPHANUMERIC = re.compile(r"[^a-z0-9]+")


def category_slug(category: LocalizedText) -> str:
    return _NON_ALPHANUMERIC.sub("-", category.en.casefold()).strip("-")


class ProductService:
    def __init__(self, repository: ProductRepository) -> None:
        self._repository = repository

    def list_products(self, query: ProductListQuery) -> ProductList:
        products: Iterable[ProductRecord] = self._repository.list_all()

        if query.search:
            needle = query.search.casefold()
            products = [p for p in products if needle in p.name.get(query.lang).casefold()]
        if query.category:
            products = [p for p in products if self._matches_category(p, query.category)]
        if query.min_price is not None:
            products = [p for p in products if p.price >= query.min_price]
        if query.max_price is not None:
            products = [p for p in products if p.price <= query.max_price]
        if query.sort is not None:
            products = sorted(products, key=lambda p: p.price, reverse=query.sort is SortOrder.DESC)

        items = [self._to_product(p, query.lang) for p in products]
        return ProductList(total=len(items), items=items)

    def get_product(self, product_id: int, lang: Language) -> Product:
        record = self._repository.get_by_id(product_id)
        if record is None:
            raise ProductNotFoundError(product_id)
        return self._to_product(record, lang)

    def list_categories(self, lang: Language) -> CategoryList:
        unique: dict[str, Category] = {}
        for product in self._repository.list_all():
            slug = category_slug(product.category)
            unique.setdefault(slug, Category(slug=slug, name=product.category.get(lang)))
        items = sorted(unique.values(), key=lambda c: c.name.casefold())
        return CategoryList(total=len(items), items=items)

    @staticmethod
    def _matches_category(product: ProductRecord, value: str) -> bool:
        needle = value.casefold()
        candidates = (category_slug(product.category), product.category.en, product.category.ar)
        return any(needle == candidate.casefold() for candidate in candidates)

    @staticmethod
    def _to_product(record: ProductRecord, lang: Language) -> Product:
        return Product(
            id=record.id,
            name=record.name.get(lang),
            description=record.description.get(lang),
            price=record.price,
            category=Category(slug=category_slug(record.category), name=record.category.get(lang)),
            image=str(record.image),
            stock=record.stock,
            in_stock=record.stock > 0,
        )

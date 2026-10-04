import json
from pathlib import Path

from pydantic import TypeAdapter, ValidationError

from app.core.exceptions import DataSourceError
from app.models.product import ProductRecord

_products_adapter = TypeAdapter(list[ProductRecord])


class ProductRepository:
    def __init__(self, products: list[ProductRecord]) -> None:
        self._products = tuple(products)
        self._by_id = {product.id: product for product in self._products}
        if len(self._by_id) != len(self._products):
            raise DataSourceError("Product data contains duplicate ids.")

    @classmethod
    def from_json_file(cls, path: Path) -> "ProductRepository":
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            products = _products_adapter.validate_python(raw)
        except FileNotFoundError as exc:
            raise DataSourceError(f"Product data file not found: {path}") from exc
        except (json.JSONDecodeError, ValidationError) as exc:
            raise DataSourceError(f"Product data file is invalid: {path}\n{exc}") from exc
        return cls(products)

    def list_all(self) -> tuple[ProductRecord, ...]:
        return self._products

    def get_by_id(self, product_id: int) -> ProductRecord | None:
        return self._by_id.get(product_id)

import json
from pathlib import Path

import pytest

from app.core.config import Settings
from app.core.exceptions import DataSourceError
from app.repositories.product_repository import ProductRepository

VALID_PRODUCT = {
    "id": 1,
    "name": {"en": "Mug", "ar": "كوب"},
    "description": {"en": "A mug", "ar": "كوب"},
    "price": 5.5,
    "category": {"en": "Kitchen", "ar": "المطبخ"},
    "image": "https://example.com/mug.jpg",
    "stock": 3,
}


def write_json(path: Path, data: object) -> Path:
    path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    return path


def test_bundled_catalog_is_valid_and_has_at_least_ten_products() -> None:
    repository = ProductRepository.from_json_file(Settings().products_file)

    assert len(repository.list_all()) >= 10


def test_get_by_id(tmp_path: Path) -> None:
    repository = ProductRepository.from_json_file(write_json(tmp_path / "p.json", [VALID_PRODUCT]))

    assert repository.get_by_id(1).name.en == "Mug"
    assert repository.get_by_id(2) is None


def test_missing_file_raises(tmp_path: Path) -> None:
    with pytest.raises(DataSourceError, match="not found"):
        ProductRepository.from_json_file(tmp_path / "missing.json")


def test_malformed_json_raises(tmp_path: Path) -> None:
    path = tmp_path / "p.json"
    path.write_text("[{", encoding="utf-8")

    with pytest.raises(DataSourceError, match="invalid"):
        ProductRepository.from_json_file(path)


@pytest.mark.parametrize(
    "override",
    [
        {"price": -1},
        {"stock": -1},
        {"image": "not-a-url"},
        {"name": {"en": "Mug"}},
        {"unexpected": True},
    ],
)
def test_invalid_product_raises(tmp_path: Path, override: dict) -> None:
    with pytest.raises(DataSourceError, match="invalid"):
        ProductRepository.from_json_file(write_json(tmp_path / "p.json", [{**VALID_PRODUCT, **override}]))


def test_duplicate_ids_raise(tmp_path: Path) -> None:
    with pytest.raises(DataSourceError, match="duplicate"):
        ProductRepository.from_json_file(write_json(tmp_path / "p.json", [VALID_PRODUCT, VALID_PRODUCT]))

import json

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_lists_unique_english_categories(client: TestClient) -> None:
    response = client.get("/api/categories", params={"lang": "en"})

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == len(body["items"])
    assert [c["name"] for c in body["items"]] == ["Accessories", "Beauty", "Electronics", "Fashion", "Home"]
    assert {c["slug"] for c in body["items"]} == {"accessories", "beauty", "electronics", "fashion", "home"}


def test_lists_arabic_categories_with_same_slugs(client: TestClient) -> None:
    en = client.get("/api/categories", params={"lang": "en"}).json()["items"]
    ar = client.get("/api/categories", params={"lang": "ar"}).json()["items"]

    assert {c["slug"] for c in ar} == {c["slug"] for c in en}
    assert {"slug": "electronics", "name": "إلكترونيات"} in ar


def test_categories_are_derived_from_product_data(tmp_path) -> None:
    product = {
        "id": 1,
        "name": {"en": "Mug", "ar": "كوب"},
        "description": {"en": "A mug", "ar": "كوب"},
        "price": 5,
        "category": {"en": "Kitchen & Dining", "ar": "المطبخ"},
        "image": "https://example.com/mug.jpg",
        "stock": 1,
    }
    data_file = tmp_path / "products.json"
    data_file.write_text(json.dumps([product, {**product, "id": 2}]), encoding="utf-8")
    client = TestClient(create_app(Settings(products_file=data_file)))

    response = client.get("/api/categories")

    assert response.json() == {"total": 1, "items": [{"slug": "kitchen-dining", "name": "Kitchen & Dining"}]}

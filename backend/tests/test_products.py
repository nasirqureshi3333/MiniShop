import pytest
from fastapi.testclient import TestClient


def get_products(client: TestClient, **params: object) -> list[dict]:
    response = client.get("/api/products", params=params)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total"] == len(body["items"])
    return body["items"]


def names(items: list[dict]) -> list[str]:
    return [item["name"] for item in items]


def prices(items: list[dict]) -> list[float]:
    return [item["price"] for item in items]


class TestListProducts:
    def test_defaults_to_english_and_returns_full_catalog(self, client: TestClient) -> None:
        items = get_products(client)

        assert len(items) >= 10
        assert "Wireless Headphones" in names(items)

    def test_product_shape(self, client: TestClient) -> None:
        item = get_products(client, lang="en")[0]

        assert set(item) == {"id", "name", "description", "price", "category", "image", "stock", "in_stock"}
        assert set(item["category"]) == {"slug", "name"}
        assert item["in_stock"] is (item["stock"] > 0)

    def test_returns_arabic_content(self, client: TestClient) -> None:
        item = next(i for i in get_products(client, lang="ar") if i["id"] == 1)

        assert item["name"] == "سماعات لاسلكية"
        assert item["category"] == {"slug": "electronics", "name": "إلكترونيات"}

    @pytest.mark.parametrize(
        ("lang", "search", "expected"),
        [
            ("en", "headphones", ["Wireless Headphones"]),
            ("en", "HEADPHONES", ["Wireless Headphones"]),
            ("en", "  headphones  ", ["Wireless Headphones"]),
            ("ar", "سماعات", ["سماعات لاسلكية"]),
        ],
    )
    def test_search_by_name(self, client: TestClient, lang: str, search: str, expected: list[str]) -> None:
        assert names(get_products(client, lang=lang, search=search)) == expected

    def test_search_is_scoped_to_requested_language(self, client: TestClient) -> None:
        assert get_products(client, lang="ar", search="headphones") == []

    def test_blank_search_is_ignored(self, client: TestClient) -> None:
        assert len(get_products(client, search="")) == len(get_products(client))

    @pytest.mark.parametrize(
        ("lang", "category"),
        [("en", "Electronics"), ("en", "electronics"), ("ar", "إلكترونيات"), ("ar", "electronics")],
    )
    def test_filter_by_category_name_or_slug(self, client: TestClient, lang: str, category: str) -> None:
        items = get_products(client, lang=lang, category=category)

        assert items
        assert {item["category"]["slug"] for item in items} == {"electronics"}

    def test_unknown_category_returns_empty_list(self, client: TestClient) -> None:
        assert get_products(client, category="does-not-exist") == []

    def test_filter_by_price_range_is_inclusive(self, client: TestClient) -> None:
        items = get_products(client, min_price=20, max_price=100)

        assert items
        assert all(20 <= price <= 100 for price in prices(items))

        boundary = get_products(client, min_price=79.99, max_price=79.99)
        assert names(boundary) == ["Wireless Headphones"]

    @pytest.mark.parametrize(("sort", "reverse"), [("asc", False), ("desc", True)])
    def test_sort_by_price(self, client: TestClient, sort: str, reverse: bool) -> None:
        result = prices(get_products(client, sort=sort))

        assert result == sorted(result, reverse=reverse)

    def test_filters_can_be_combined(self, client: TestClient) -> None:
        items = get_products(client, lang="en", category="electronics", min_price=50, max_price=200, sort="desc")

        assert names(items) == ["Smart Watch", "Instant Camera", "Wireless Headphones", "Portable Bluetooth Speaker"]

    def test_no_match_returns_empty_list(self, client: TestClient) -> None:
        response = client.get("/api/products", params={"search": "zzz-no-such-product"})

        assert response.status_code == 200
        assert response.json() == {"total": 0, "items": []}


class TestGetProduct:
    @pytest.mark.parametrize(("lang", "name"), [("en", "Wireless Headphones"), ("ar", "سماعات لاسلكية")])
    def test_returns_localized_product(self, client: TestClient, lang: str, name: str) -> None:
        response = client.get("/api/products/1", params={"lang": lang})

        assert response.status_code == 200
        body = response.json()
        assert body["id"] == 1
        assert body["name"] == name
        assert body["price"] == 79.99

    def test_returns_404_for_missing_product(self, client: TestClient) -> None:
        response = client.get("/api/products/9999")

        assert response.status_code == 404
        assert response.json() == {
            "error": {"code": "not_found", "message": "Product with id 9999 was not found.", "details": []}
        }

    @pytest.mark.parametrize("product_id", ["abc", "1.5", "0", "-1"])
    def test_rejects_invalid_product_id(self, client: TestClient, product_id: str) -> None:
        response = client.get(f"/api/products/{product_id}")

        assert response.status_code == 422
        error = response.json()["error"]
        assert error["code"] == "validation_error"
        assert error["details"][0]["field"] == "product_id"
        assert error["details"][0]["location"] == "path"

    def test_rejects_invalid_language(self, client: TestClient) -> None:
        response = client.get("/api/products/1", params={"lang": "fr"})

        assert response.status_code == 422
        assert response.json()["error"]["details"][0]["field"] == "lang"

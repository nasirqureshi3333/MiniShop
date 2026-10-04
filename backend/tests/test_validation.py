import pytest
from fastapi.testclient import TestClient


def assert_validation_error(response, field: str | None, error_type: str) -> None:
    assert response.status_code == 422, response.text
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["message"]
    assert any(d["field"] == field and d["type"] == error_type for d in error["details"]), error["details"]


@pytest.mark.parametrize(
    ("params", "field", "error_type"),
    [
        ({"lang": "fr"}, "lang", "enum"),
        ({"lang": ""}, "lang", "enum"),
        ({"min_price": "abc"}, "min_price", "float_parsing"),
        ({"max_price": "ten"}, "max_price", "float_parsing"),
        ({"min_price": "-1"}, "min_price", "greater_than_equal"),
        ({"max_price": "-0.01"}, "max_price", "greater_than_equal"),
        ({"min_price": "inf"}, "min_price", "finite_number"),
        ({"max_price": "nan"}, "max_price", "finite_number"),
        ({"min_price": "100", "max_price": "10"}, None, "value_error"),
        ({"sort": "up"}, "sort", "enum"),
        ({"sort": "ASC"}, "sort", "enum"),
        ({"search": "x" * 101}, "search", "string_too_long"),
        ({"category": "x" * 101}, "category", "string_too_long"),
        ({"colour": "red"}, "colour", "extra_forbidden"),
    ],
)
def test_products_rejects_invalid_query(client: TestClient, params: dict, field: str | None, error_type: str) -> None:
    assert_validation_error(client.get("/api/products", params=params), field, error_type)


def test_price_range_error_has_readable_message(client: TestClient) -> None:
    response = client.get("/api/products", params={"min_price": 100, "max_price": 10})

    assert response.json()["error"]["details"][0]["message"] == "min_price must be less than or equal to max_price"


@pytest.mark.parametrize(
    ("params", "field", "error_type"),
    [({"lang": "de"}, "lang", "enum"), ({"page": "1"}, "page", "extra_forbidden")],
)
def test_categories_rejects_invalid_query(client: TestClient, params: dict, field: str, error_type: str) -> None:
    assert_validation_error(client.get("/api/categories", params=params), field, error_type)


def test_unknown_route_uses_error_envelope(client: TestClient) -> None:
    response = client.get("/api/unknown")

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_unsupported_method_uses_error_envelope(client: TestClient) -> None:
    response = client.post("/api/products")

    assert response.status_code == 405
    assert response.json()["error"]["code"] == "method_not_allowed"

from fastapi.testclient import TestClient


def test_swagger_ui_is_served(client: TestClient) -> None:
    response = client.get("/docs")

    assert response.status_code == 200
    assert "swagger-ui" in response.text


def test_openapi_documents_all_endpoints(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]

    assert set(paths) == {"/api/products", "/api/products/{product_id}", "/api/categories", "/api/health"}
    assert set(paths["/api/products"]["get"]["responses"]) >= {"200", "422"}
    assert set(paths["/api/products/{product_id}"]["get"]["responses"]) >= {"200", "404", "422"}


def test_openapi_includes_english_and_arabic_examples(client: TestClient) -> None:
    paths = client.get("/openapi.json").json()["paths"]

    for path in ("/api/products", "/api/products/{product_id}", "/api/categories"):
        examples = paths[path]["get"]["responses"]["200"]["content"]["application/json"]["examples"]
        assert {"english", "arabic"} <= set(examples)


def test_list_products_documents_all_query_parameters(client: TestClient) -> None:
    parameters = client.get("/openapi.json").json()["paths"]["/api/products"]["get"]["parameters"]

    assert {p["name"] for p in parameters} == {"lang", "search", "category", "min_price", "max_price", "sort"}
    assert all(p["required"] is False for p in parameters)

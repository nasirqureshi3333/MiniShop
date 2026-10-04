from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.frontend import StaticSite, parse_accept_language
from app.main import create_app

SITE_FILES = {
    "en.html": "<html>home en</html>",
    "ar.html": "<html>home ar</html>",
    "en.txt": "rsc payload en",
    "en/cart/__next._tree.txt": "cart tree",
    "en/cart/__next.$d$locale/cart/__PAGE__.txt": "cart page segment",
    "en/__next.$d$locale/__PAGE__.txt": "home page segment",
    "en/cart.html": "<html>cart en</html>",
    "en/products/1.html": "<html>product 1 en</html>",
    "en/not-found.html": "<html>not found en</html>",
    "ar/not-found.html": "<html>not found ar</html>",
    "en/products/not-found.html": "<html>product not found en</html>",
    "404.html": "<html>not found</html>",
    "_next/static/chunks/app.js": "console.log('app')",
    "favicon.ico": "icon",
}


@pytest.fixture
def site_dir(tmp_path: Path) -> Path:
    root = tmp_path / "out"
    for relative, content in SITE_FILES.items():
        file = root / relative
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(content, encoding="utf-8")
    (tmp_path / "secret.txt").write_text("outside the site", encoding="utf-8")
    return root


@pytest.fixture
def site(site_dir: Path) -> TestClient:
    return TestClient(create_app(Settings(frontend_dir=site_dir)), follow_redirects=False)


class TestRootRedirect:
    def test_defaults_to_english(self, site: TestClient) -> None:
        response = site.get("/")

        assert response.status_code == 307
        assert response.headers["location"] == "/en"

    def test_uses_accept_language(self, site: TestClient) -> None:
        response = site.get("/", headers={"Accept-Language": "fr-FR,ar;q=0.8,en;q=0.5"})

        assert response.headers["location"] == "/ar"

    def test_saved_language_cookie_wins(self, site: TestClient) -> None:
        site.cookies.set("NEXT_LOCALE", "en")
        response = site.get("/", headers={"Accept-Language": "ar"})

        assert response.headers["location"] == "/en"


class TestPages:
    def test_serves_localized_page_and_remembers_language(self, site: TestClient) -> None:
        response = site.get("/ar")

        assert response.status_code == 200
        assert response.text == "<html>home ar</html>"
        assert response.headers["content-type"].startswith("text/html")
        assert "NEXT_LOCALE=ar" in response.headers["set-cookie"]

    @pytest.mark.parametrize(("path", "body"), [("/en/cart", "cart en"), ("/en/products/1", "product 1 en")])
    def test_maps_clean_urls_to_html_files(self, site: TestClient, path: str, body: str) -> None:
        response = site.get(path)

        assert response.status_code == 200
        assert body in response.text

    def test_serves_client_navigation_payloads(self, site: TestClient) -> None:
        response = site.get("/en.txt", params={"_rsc": "abc"})

        assert response.status_code == 200
        assert response.text == "rsc payload en"
        assert "NEXT_LOCALE=en" in response.headers["set-cookie"]

    @pytest.mark.parametrize(
        ("path", "body"),
        [
            ("/en/cart/__next.$d$locale.cart.__PAGE__.txt", "cart page segment"),
            ("/en/__next.$d$locale.__PAGE__.txt", "home page segment"),
            ("/en/cart/__next._tree.txt", "cart tree"),
        ],
    )
    def test_serves_segment_prefetch_payloads(self, site: TestClient, path: str, body: str) -> None:
        response = site.get(path, params={"_rsc": "abc"})

        assert response.status_code == 200
        assert response.text == body

    def test_locale_less_page_redirects_to_localized_page(self, site: TestClient) -> None:
        response = site.get("/cart", params={"x": "1"}, headers={"Accept-Language": "ar"})

        assert response.status_code == 307
        assert response.headers["location"] == "/ar/cart?x=1"

    @pytest.mark.parametrize(
        ("path", "body"),
        [
            ("/en/products/999", "product not found en"),
            ("/en/products/abc/extra", "product not found en"),
            ("/en/unknown", "not found en"),
            ("/ar/unknown/deep", "not found ar"),
        ],
    )
    def test_unknown_page_returns_nearest_localized_not_found_page(
        self, site: TestClient, path: str, body: str
    ) -> None:
        response = site.get(path)

        assert response.status_code == 404
        assert response.text == f"<html>{body}</html>"
        assert response.headers["content-type"].startswith("text/html")


class TestAssets:
    def test_hashed_assets_are_cached_forever(self, site: TestClient) -> None:
        response = site.get("/_next/static/chunks/app.js")

        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/javascript")
        assert "immutable" in response.headers["cache-control"]

    def test_pages_are_revalidated(self, site: TestClient) -> None:
        assert site.get("/en").headers["cache-control"] == "no-cache"

    def test_missing_asset_is_a_plain_404(self, site: TestClient) -> None:
        response = site.get("/_next/static/missing.js")

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "not_found"

    def test_head_requests_are_supported(self, site: TestClient) -> None:
        assert site.head("/en").status_code == 200


class TestApiIsUnaffected:
    def test_api_routes_still_win(self, site: TestClient) -> None:
        assert site.get("/api/health").json() == {"status": "healthy"}

    def test_unknown_api_route_keeps_json_errors(self, site: TestClient) -> None:
        response = site.get("/api/unknown")

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "not_found"

    def test_docs_still_served(self, site: TestClient) -> None:
        assert site.get("/docs").status_code == 200
        assert "/{path}" not in site.get("/openapi.json").json()["paths"]


def test_site_never_resolves_outside_its_folder(site_dir: Path) -> None:
    site = StaticSite(site_dir)

    assert site.resolve("../secret.txt") is None
    assert site.resolve("en/../../secret.txt") is None
    assert site.resolve("en") == (site_dir / "en.html").resolve()


def test_frontend_disabled_without_build(tmp_path: Path) -> None:
    client = TestClient(create_app(Settings(frontend_dir=tmp_path / "missing")))

    assert client.get("/").status_code == 404


def test_parse_accept_language_orders_by_quality() -> None:
    assert parse_accept_language("en;q=0.5, ar, fr;q=0.9, de;q=0") == ["ar", "fr", "en"]

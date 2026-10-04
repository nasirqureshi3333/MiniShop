import re
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, RedirectResponse, Response
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.common import Language

LOCALES = tuple(language.value for language in Language)
DEFAULT_LOCALE = Language.EN.value
LOCALE_COOKIE = "NEXT_LOCALE"
LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
NOT_FOUND_SEGMENT = "not-found"

IMMUTABLE_CACHE = "public, max-age=31536000, immutable"
REVALIDATE_CACHE = "no-cache"

MEDIA_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".json": "application/json",
    ".map": "application/json",
    ".woff2": "font/woff2",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
}

_LOCALE_PREFIX = re.compile(rf"^({'|'.join(LOCALES)})(?=$|[/.])")
_QUALITY = re.compile(r"q=([0-9.]+)")
_SEGMENT_PAYLOAD = re.compile(r"^__next\.(?P<segments>.+)\.txt$")


def _segment_payload_path(path: str) -> str | None:
    folder, _, name = path.rpartition("/")
    match = _SEGMENT_PAYLOAD.match(name)
    if match is None:
        return None
    first, *rest = match["segments"].split(".")
    if not rest:
        return None
    nested = "/".join([f"__next.{first}", *rest]) + ".txt"
    return f"{folder}/{nested}" if folder else nested


def parse_accept_language(header: str) -> list[str]:
    weighted: list[tuple[float, str]] = []
    for part in header.split(","):
        tag, _, params = part.strip().partition(";")
        if not tag:
            continue
        match = _QUALITY.search(params)
        try:
            quality = float(match.group(1)) if match else 1.0
        except ValueError:
            quality = 0.0
        weighted.append((quality, tag.strip()))
    return [tag for quality, tag in sorted(weighted, key=lambda item: -item[0]) if quality > 0]


def preferred_locale(request: Request) -> str:
    cookie = request.cookies.get(LOCALE_COOKIE)
    if cookie in LOCALES:
        return cookie
    for tag in parse_accept_language(request.headers.get("accept-language", "")):
        primary = tag.split("-")[0].lower()
        if primary in LOCALES:
            return primary
    return DEFAULT_LOCALE


class StaticSite:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()

    def resolve(self, url_path: str) -> Path | None:
        path = url_path.strip("/")
        candidates = [path, f"{path}.html", f"{path}/index.html"] if path else ["index.html"]
        if segment_payload := _segment_payload_path(path):
            candidates.append(segment_payload)
        for candidate in candidates:
            file = (self.root / candidate).resolve()
            if file.is_relative_to(self.root) and file.is_file():
                return file
        return None

    def not_found_page(self, url_path: str) -> Path | None:
        segments = url_path.strip("/").split("/")
        for depth in range(len(segments) - 1, 0, -1):
            page = self.resolve("/".join([*segments[:depth], NOT_FOUND_SEGMENT]))
            if page is not None:
                return page
        return self.resolve("404")


def _file_response(file: Path, *, status_code: int = 200, cache_control: str = REVALIDATE_CACHE) -> FileResponse:
    return FileResponse(
        file,
        status_code=status_code,
        media_type=MEDIA_TYPES.get(file.suffix.lower()),
        headers={"Cache-Control": cache_control},
    )


def register_frontend(app: FastAPI, root: Path, api_prefix: str) -> None:
    site = StaticSite(root)
    api_root = api_prefix.strip("/")

    @app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
    async def frontend_index(request: Request) -> Response:
        return RedirectResponse(f"/{preferred_locale(request)}", status_code=307)

    @app.api_route("/{path:path}", methods=["GET", "HEAD"], include_in_schema=False)
    async def frontend_page(path: str, request: Request) -> Response:
        if path == api_root or path.startswith(f"{api_root}/"):
            raise StarletteHTTPException(status_code=404)

        locale_match = _LOCALE_PREFIX.match(path)
        is_asset = "." in path.rsplit("/", 1)[-1]
        file = site.resolve(path)

        if file is not None:
            cache = IMMUTABLE_CACHE if path.startswith("_next/static/") else REVALIDATE_CACHE
            response: Response = _file_response(file, cache_control=cache)
        elif is_asset:
            raise StarletteHTTPException(status_code=404)
        elif locale_match is None:
            query = f"?{request.url.query}" if request.url.query else ""
            return RedirectResponse(f"/{preferred_locale(request)}/{path}{query}", status_code=307)
        else:
            page = site.not_found_page(path)
            if page is None:
                raise StarletteHTTPException(status_code=404)
            response = _file_response(page, status_code=404)

        if locale_match:
            response.set_cookie(
                LOCALE_COOKIE, locale_match.group(1), max_age=LOCALE_COOKIE_MAX_AGE, path="/", samesite="lax"
            )
        return response

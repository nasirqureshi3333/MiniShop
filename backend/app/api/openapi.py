from typing import Any

from app.schemas.error import ErrorResponse

_HEADPHONES_EN = {
    "id": 1,
    "name": "Wireless Headphones",
    "description": "Over-ear Bluetooth wireless headphones with active noise cancellation...",
    "price": 79.99,
    "category": {"slug": "electronics", "name": "Electronics"},
    "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1600&h=1600&fit=crop&crop=focalpoint&q=80&fp-x=0.5&fp-y=0.58&fp-z=1.45",
    "stock": 15,
    "in_stock": True,
}
_HEADPHONES_AR = {
    **_HEADPHONES_EN,
    "name": "سماعات لاسلكية",
    "description": "سماعات رأس لاسلكية تعمل بالبلوتوث مع خاصية إلغاء الضوضاء النشطة...",
    "category": {"slug": "electronics", "name": "إلكترونيات"},
}


def _json_examples(**examples: tuple[str, Any]) -> dict[str, Any]:
    return {
        "application/json": {
            "examples": {key: {"summary": summary, "value": value} for key, (summary, value) in examples.items()}
        }
    }


def _error(code: str, message: str, details: list[dict[str, str | None]] | None = None) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "details": details or []}}


def _validation_error(field: str | None, location: str, message: str, error_type: str) -> dict[str, Any]:
    detail: dict[str, str | None] = {"field": field, "location": location, "message": message, "type": error_type}
    return _error("validation_error", "One or more request parameters are invalid.", [detail])


_INVALID_LANGUAGE = ("Unsupported language (lang=fr)", _validation_error("lang", "query", "Input should be 'en' or 'ar'", "enum"))
_UNKNOWN_PARAMETER = ("Unknown query parameter", _validation_error("color", "query", "Extra inputs are not permitted", "extra_forbidden"))

INTERNAL_ERROR_RESPONSE: dict[int | str, dict[str, Any]] = {
    500: {
        "model": ErrorResponse,
        "description": "Unexpected server error.",
        "content": _json_examples(internal=("Internal error", _error("internal_error", "An unexpected error occurred."))),
    }
}

PRODUCT_LIST_RESPONSES: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "Products matching the filters, localized to `lang`.",
        "content": _json_examples(
            english=("English (lang=en)", {"total": 1, "items": [_HEADPHONES_EN]}),
            arabic=("Arabic (lang=ar)", {"total": 1, "items": [_HEADPHONES_AR]}),
            empty=("No matching products", {"total": 0, "items": []}),
        ),
    },
    422: {
        "model": ErrorResponse,
        "description": "Invalid query parameters.",
        "content": _json_examples(
            invalid_language=_INVALID_LANGUAGE,
            invalid_price=(
                "Negative price (min_price=-5)",
                _validation_error("min_price", "query", "Input should be greater than or equal to 0", "greater_than_equal"),
            ),
            invalid_price_range=(
                "min_price greater than max_price",
                _validation_error(None, "query", "min_price must be less than or equal to max_price", "value_error"),
            ),
            invalid_sort=(
                "Unsupported sort (sort=up)",
                _validation_error("sort", "query", "Input should be 'asc' or 'desc'", "enum"),
            ),
            unknown_parameter=_UNKNOWN_PARAMETER,
        ),
    },
    **INTERNAL_ERROR_RESPONSE,
}

PRODUCT_DETAIL_RESPONSES: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "The requested product, localized to `lang`.",
        "content": _json_examples(english=("English (lang=en)", _HEADPHONES_EN), arabic=("Arabic (lang=ar)", _HEADPHONES_AR)),
    },
    404: {
        "model": ErrorResponse,
        "description": "No product exists with this id.",
        "content": _json_examples(
            not_found=("Product not found", _error("not_found", "Product with id 999 was not found."))
        ),
    },
    422: {
        "model": ErrorResponse,
        "description": "Invalid product id or query parameters.",
        "content": _json_examples(
            invalid_id=(
                "Non-numeric id (/api/products/abc)",
                _validation_error(
                    "product_id", "path", "Input should be a valid integer, unable to parse string as an integer", "int_parsing"
                ),
            ),
            non_positive_id=(
                "Non-positive id (/api/products/0)",
                _validation_error("product_id", "path", "Input should be greater than 0", "greater_than"),
            ),
            invalid_language=_INVALID_LANGUAGE,
        ),
    },
    **INTERNAL_ERROR_RESPONSE,
}

CATEGORY_LIST_RESPONSES: dict[int | str, dict[str, Any]] = {
    200: {
        "description": "Unique categories derived from the product data, localized to `lang`.",
        "content": _json_examples(
            english=(
                "English (lang=en)",
                {"total": 2, "items": [{"slug": "electronics", "name": "Electronics"}, {"slug": "fashion", "name": "Fashion"}]},
            ),
            arabic=(
                "Arabic (lang=ar)",
                {"total": 2, "items": [{"slug": "fashion", "name": "أزياء"}, {"slug": "electronics", "name": "إلكترونيات"}]},
            ),
        ),
    },
    422: {
        "model": ErrorResponse,
        "description": "Invalid query parameters.",
        "content": _json_examples(invalid_language=_INVALID_LANGUAGE, unknown_parameter=_UNKNOWN_PARAMETER),
    },
    **INTERNAL_ERROR_RESPONSE,
}

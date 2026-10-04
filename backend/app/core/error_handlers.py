import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError
from app.schemas.error import ErrorBody, ErrorDetail, ErrorResponse

logger = logging.getLogger(__name__)

_HTTP_ERROR_CODES = {
    HTTPStatus.NOT_FOUND: "not_found",
    HTTPStatus.METHOD_NOT_ALLOWED: "method_not_allowed",
}


def _error_response(status_code: int, code: str, message: str, details: list[ErrorDetail] | None = None) -> JSONResponse:
    body = ErrorResponse(error=ErrorBody(code=code, message=message, details=details or []))
    return JSONResponse(status_code=status_code, content=jsonable_encoder(body))


def _to_error_detail(error: dict) -> ErrorDetail:
    location, *field_path = error.get("loc", ())
    message = str(error.get("msg", "Invalid value."))
    message = message.removeprefix("Value error, ")
    return ErrorDetail(
        field=".".join(str(part) for part in field_path) or None,
        location=str(location) if location is not None else None,
        message=message,
        type=error.get("type"),
    )


async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return _error_response(exc.status_code, exc.code, exc.message)


async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    details = [_to_error_detail(error) for error in exc.errors()]
    return _error_response(
        HTTPStatus.UNPROCESSABLE_ENTITY, "validation_error", "One or more request parameters are invalid.", details
    )


async def http_exception_handler(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = _HTTP_ERROR_CODES.get(exc.status_code, "http_error")
    return _error_response(exc.status_code, code, str(exc.detail))


async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error", exc_info=exc)
    return _error_response(HTTPStatus.INTERNAL_SERVER_ERROR, "internal_error", "An unexpected error occurred.")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

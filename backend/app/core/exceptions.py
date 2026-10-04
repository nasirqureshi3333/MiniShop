from http import HTTPStatus


class AppError(Exception):
    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR
    code: str = "internal_error"

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(AppError):
    status_code = HTTPStatus.NOT_FOUND
    code = "not_found"


class ProductNotFoundError(NotFoundError):
    def __init__(self, product_id: int) -> None:
        super().__init__(f"Product with id {product_id} was not found.")
        self.product_id = product_id


class DataSourceError(Exception):
    pass

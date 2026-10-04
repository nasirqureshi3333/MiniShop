from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    field: str | None = Field(default=None, description="Offending parameter, when applicable.")
    location: str | None = Field(default=None, description="Where the parameter was sent: query, path, ...")
    message: str
    type: str | None = Field(default=None, description="Machine-readable validation error type.")


class ErrorBody(BaseModel):
    code: str = Field(description="Machine-readable error code, e.g. `not_found` or `validation_error`.")
    message: str = Field(description="Human-readable summary of the error.")
    details: list[ErrorDetail] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: ErrorBody

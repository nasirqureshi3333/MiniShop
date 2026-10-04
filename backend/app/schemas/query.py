from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.common import Language, SortOrder

MAX_TEXT_PARAM_LENGTH = 100


class LanguageQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lang: Language = Field(
        default=Language.EN,
        description="Language of the returned content. Only `en` and `ar` are supported.",
    )


class ProductListQuery(LanguageQuery):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    search: str | None = Field(
        default=None,
        max_length=MAX_TEXT_PARAM_LENGTH,
        description="Case-insensitive search on the product name in the requested language.",
        examples=["headphones"],
    )
    category: str | None = Field(
        default=None,
        max_length=MAX_TEXT_PARAM_LENGTH,
        description="Category slug (e.g. `electronics`) or category name in English or Arabic. Case-insensitive.",
        examples=["Electronics"],
    )
    min_price: float | None = Field(
        default=None, ge=0, allow_inf_nan=False, description="Inclusive minimum price.", examples=[20]
    )
    max_price: float | None = Field(
        default=None, ge=0, allow_inf_nan=False, description="Inclusive maximum price.", examples=[100]
    )
    sort: SortOrder | None = Field(
        default=None,
        description="Sort by price: `asc` (low to high) or `desc` (high to low). Defaults to catalog order.",
    )

    @field_validator("search", "category", mode="after")
    @classmethod
    def blank_to_none(cls, value: str | None) -> str | None:
        return value or None

    @model_validator(mode="after")
    def check_price_range(self) -> Self:
        if self.min_price is not None and self.max_price is not None and self.min_price > self.max_price:
            raise ValueError("min_price must be less than or equal to max_price")
        return self

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, NonNegativeInt, PositiveInt

from app.schemas.common import Language


class LocalizedText(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    en: str = Field(min_length=1)
    ar: str = Field(min_length=1)

    def get(self, lang: Language) -> str:
        return getattr(self, lang.value)


class ProductRecord(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    id: PositiveInt
    name: LocalizedText
    description: LocalizedText
    price: float = Field(ge=0, allow_inf_nan=False)
    category: LocalizedText
    image: HttpUrl
    stock: NonNegativeInt

from pydantic import BaseModel, Field


class Category(BaseModel):
    slug: str = Field(
        description="Language-independent identifier. Use it to filter products regardless of language.",
        examples=["electronics"],
    )
    name: str = Field(description="Category name in the requested language.", examples=["Electronics"])


class Product(BaseModel):
    id: int = Field(examples=[1])
    name: str = Field(examples=["Wireless Headphones"])
    description: str = Field(examples=["Bluetooth wireless headphones"])
    price: float = Field(description="Unit price in USD.", examples=[79.99])
    category: Category
    image: str = Field(description="Absolute URL of the product image.")
    stock: int = Field(description="Units currently available.", examples=[15])
    in_stock: bool = Field(description="Convenience flag, `true` when `stock > 0`.")


class ProductList(BaseModel):
    total: int = Field(description="Number of products matching the filters.")
    items: list[Product]


class CategoryList(BaseModel):
    total: int
    items: list[Category]

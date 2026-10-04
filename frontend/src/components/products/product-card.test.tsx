import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, ImgHTMLAttributes } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { cartStore } from "@/lib/cart/cart-store";
import { renderWithIntl } from "@/test/render-with-intl";
import type { Product } from "@/types/api";

import { ProductCard } from "./product-card";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props} />,
}));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: ({ fill, preload, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; preload?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt} />
  ),
}));

const product: Product = {
  id: 1,
  name: "Wireless Headphones",
  description: "Bluetooth wireless headphones",
  price: 79.99,
  category: { slug: "electronics", name: "Electronics" },
  image: "https://images.unsplash.com/photo-1",
  stock: 2,
  in_stock: true,
};

describe("ProductCard", () => {
  beforeEach(() => cartStore.dispatch({ type: "clear" }));

  it("renders all required product information", () => {
    renderWithIntl(<ProductCard product={product} />);

    expect(screen.getByRole("img", { name: "Wireless Headphones" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Wireless Headphones" })).toBeInTheDocument();
    expect(screen.getByText("Bluetooth wireless headphones")).toBeInTheDocument();
    expect(screen.getByText("$79.99")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Only 2 left")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "View Details" })).toHaveAttribute("href", "/product?id=1");
    expect(screen.getByRole("article", { name: "Wireless Headphones" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add to Cart/ })).toBeEnabled();
  });

  it("adds to the cart and disables the button once stock is reached", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ProductCard product={product} />);

    await user.click(screen.getByRole("button", { name: /Add to Cart/ }));
    await user.click(screen.getByRole("button", { name: /Added to cart/ }));

    expect(cartStore.getSnapshot().items).toEqual([{ productId: 1, quantity: 2 }]);
    expect(screen.getByRole("button", { name: /Max in cart/ })).toBeDisabled();
  });

  it("disables Add to Cart for out-of-stock products", () => {
    renderWithIntl(<ProductCard product={{ ...product, stock: 0, in_stock: false }} />);

    expect(screen.getByRole("button", { name: /Out of stock/ })).toBeDisabled();
  });

  it("renders translated UI text in Arabic", () => {
    renderWithIntl(<ProductCard product={{ ...product, name: "سماعات لاسلكية" }} />, "ar");

    expect(screen.getByRole("heading", { name: "سماعات لاسلكية" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "عرض التفاصيل" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /أضف إلى السلة/ })).toBeInTheDocument();
    expect(screen.getByText("متبقٍ 2 فقط")).toBeInTheDocument();
  });
});

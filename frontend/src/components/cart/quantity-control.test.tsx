import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl } from "@/test/render-with-intl";

import { QuantityControl } from "./quantity-control";

const renderControl = (quantity: number, max: number) => {
  const onIncrement = vi.fn();
  const onDecrement = vi.fn();
  renderWithIntl(
    <QuantityControl productName="Mug" quantity={quantity} max={max} onIncrement={onIncrement} onDecrement={onDecrement} />,
  );
  return { onIncrement, onDecrement };
};

describe("QuantityControl", () => {
  it("calls the handlers when stepping the quantity", async () => {
    const user = userEvent.setup();
    const { onIncrement, onDecrement } = renderControl(2, 5);

    await user.click(screen.getByRole("button", { name: "Increase quantity of Mug" }));
    await user.click(screen.getByRole("button", { name: "Decrease quantity of Mug" }));

    expect(onIncrement).toHaveBeenCalledOnce();
    expect(onDecrement).toHaveBeenCalledOnce();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("disables decrement at 1 and increment at the stock limit", () => {
    renderControl(1, 1);

    expect(screen.getByRole("button", { name: "Decrease quantity of Mug" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity of Mug" })).toBeDisabled();
  });
});

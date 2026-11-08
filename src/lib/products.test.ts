import { describe, expect, it } from "vitest";

import { getProductPurchaseState, products } from "@/lib/products";

describe("marketplace products", () => {
  it("lists the six requested products at their specified prices", () => {
    expect(products.map(({ title, price }) => [title, price])).toEqual([
      ["Lattice Elite Fashion Portal", "₦200,000"],
      ["AeroFit Wellness Portal", "₦180,000"],
      ["OmniVendor Smart Store", "₦150,000"],
      ["Apex Corporate Hub", "₦250,000"],
      ["BiteSpeed Food & Bakery Delivery", "₦180,000"],
      ["Lattice Chronicle Media Blog", "₦100,000"],
    ]);
  });

  it("marks all six listings available by default", () => {
    expect(products).toHaveLength(6);
    expect(products.every((product) => product.isSold === false)).toBe(true);
  });

  it("maps sold products to a sold state and unsold products to an available state", () => {
    expect(getProductPurchaseState(true)).toBe("sold");
    expect(getProductPurchaseState(false)).toBe("available");
  });
});
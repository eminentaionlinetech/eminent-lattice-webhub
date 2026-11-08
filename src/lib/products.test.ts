import { describe, expect, it } from "vitest";

import {
  canPurchaseProduct,
  getProductAmountInNaira,
  products,
} from "@/lib/products";

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

  it("only allows checkout when a product is not sold", () => {
    expect(canPurchaseProduct(true)).toBe(false);
    expect(canPurchaseProduct(false)).toBe(true);
  });

  it("converts each listed price into the exact checkout amount in naira", () => {
    expect(products.map((product) => getProductAmountInNaira(product.price))).toEqual([
      200000,
      180000,
      150000,
      250000,
      180000,
      100000,
    ]);
  });

  it("rejects invalid or non-positive checkout amounts", () => {
    expect(() => getProductAmountInNaira("₦0")).toThrow("Invalid product price");
    expect(() => getProductAmountInNaira("₦not a price")).toThrow("Invalid product price");
  });
});
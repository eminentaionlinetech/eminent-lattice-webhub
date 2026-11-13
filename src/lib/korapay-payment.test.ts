import { describe, expect, it } from "vitest";

import {
  isFinalKorapayStatus,
  matchesKorapayOrder,
  validateKorapayCheckoutUrl,
} from "@/lib/korapay-payment";

describe("Korapay payment confirmation", () => {
  const expectedOrder = { reference: "EL-order-001", amount: 200000 };

  it("accepts only final Korapay results that match reference, NGN currency, and the full order amount", () => {
    expect(
      matchesKorapayOrder(
        { reference: "EL-order-001", amount: 200000, currency: "NGN", status: "success" },
        expectedOrder,
      ),
    ).toBe(true);
    expect(
      matchesKorapayOrder(
        { reference: "EL-other-order", amount: 200000, currency: "NGN", status: "success" },
        expectedOrder,
      ),
    ).toBe(false);
    expect(
      matchesKorapayOrder(
        { reference: "EL-order-001", amount: 199999, currency: "NGN", status: "success" },
        expectedOrder,
      ),
    ).toBe(false);
    expect(
      matchesKorapayOrder(
        { reference: "EL-order-001", amount: 200000, currency: "USD", status: "success" },
        expectedOrder,
      ),
    ).toBe(false);
    expect(
      matchesKorapayOrder(
        { reference: "EL-order-001", amount: 200000, currency: "NGN", status: "processing" },
        expectedOrder,
      ),
    ).toBe(false);
  });

  it("waits for Korapay's terminal success or failure status", () => {
    expect(isFinalKorapayStatus("success")).toBe(true);
    expect(isFinalKorapayStatus("failed")).toBe(true);
    expect(isFinalKorapayStatus("processing")).toBe(false);
  });

  it("accepts secure Korapay checkout addresses, including checkout subdomains", () => {
    expect(validateKorapayCheckoutUrl("https://checkout.korapay.com/reference/pay")).toBe(
      "https://checkout.korapay.com/reference/pay",
    );
    expect(validateKorapayCheckoutUrl("https://region.checkout.korapay.com/reference/pay")).toBe(
      "https://region.checkout.korapay.com/reference/pay",
    );
  });

  it("rejects insecure, spoofed, credentialed, or non-checkout URLs", () => {
    expect(validateKorapayCheckoutUrl("http://checkout.korapay.com/reference/pay")).toBeNull();
    expect(
      validateKorapayCheckoutUrl("https://checkout.korapay.com.attacker.example/pay"),
    ).toBeNull();
    expect(validateKorapayCheckoutUrl("https://notcheckout.korapay.com/pay")).toBeNull();
    expect(validateKorapayCheckoutUrl("https://user@checkout.korapay.com/pay")).toBeNull();
    expect(validateKorapayCheckoutUrl("https://checkout.korapay.com:8443/pay")).toBeNull();
    expect(validateKorapayCheckoutUrl(null)).toBeNull();
  });
});

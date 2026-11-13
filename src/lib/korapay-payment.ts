export type KorapayPaymentMethod = "card" | "bank_transfer" | "pay_with_bank";

export type KorapayChargeSnapshot = {
  reference?: unknown;
  amount?: unknown;
  currency?: unknown;
  status?: unknown;
};

export function matchesKorapayOrder(
  charge: KorapayChargeSnapshot,
  expected: { reference: string; amount: number },
) {
  return (
    charge.reference === expected.reference &&
    charge.amount === expected.amount &&
    charge.currency === "NGN" &&
    (charge.status === "success" || charge.status === "failed")
  );
}

export function isFinalKorapayStatus(status: unknown): status is "success" | "failed" {
  return status === "success" || status === "failed";
}

export function validateKorapayCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    const isKorapayCheckoutHost =
      hostname === "checkout.korapay.com" || hostname.endsWith(".checkout.korapay.com");

    if (
      url.protocol !== "https:" ||
      !isKorapayCheckoutHost ||
      url.username ||
      url.password ||
      url.port
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

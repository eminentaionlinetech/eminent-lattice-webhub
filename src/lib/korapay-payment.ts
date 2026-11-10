export type KorapayPaymentMethod = "card" | "bank_transfer" | "pay_with_bank";

export type KorapayChargeSnapshot = {
  reference: unknown;
  amount: unknown;
  currency: unknown;
  status: unknown;
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
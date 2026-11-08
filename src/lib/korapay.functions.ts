import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { canPurchaseProduct, getProductAmountInNaira, products } from "@/lib/products";

export const createKorapayCheckout = createServerFn({ method: "POST" })
  .validator((input) =>
    z
      .object({
        productId: z.string().min(1).max(80),
        email: z.string().trim().email().max(254),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const product = products.find((item) => item.id === data.productId);
    if (!product || !canPurchaseProduct(product.isSold)) {
      return { ok: false as const, message: "This listing is no longer available." };
    }

    const secretKey = process.env["KORAPAY_SECRET_KEY"];
    if (!secretKey) {
      return { ok: false as const, message: "Checkout is not configured yet." };
    }

    const reference = `EL-${crypto.randomUUID()}`;
    const siteUrl = getRequestUrl();

    try {
      const response = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getProductAmountInNaira(product.price),
          currency: "NGN",
          reference,
          narration: `Purchase: ${product.title}`,
          customer: { email: data.email },
          metadata: { productId: product.id },
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        status?: unknown;
        data?: { checkout_url?: unknown };
      } | null;

      if (!response.ok || payload?.status !== true || typeof payload.data?.checkout_url !== "string") {
        console.error(`Korapay checkout initialization failed with status ${response.status}.`);
        return { ok: false as const, message: "Korapay could not start checkout. Please try again." };
      }

      const checkoutUrl = new URL(payload.data.checkout_url);
      if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.korapay.com") {
        console.error("Korapay returned an unexpected checkout address.");
        return { ok: false as const, message: "Checkout could not be opened safely. Please try again." };
      }

      return { ok: true as const, checkoutUrl: checkoutUrl.toString() };
    } catch {
      console.error("Korapay checkout request could not be completed.");
      return { ok: false as const, message: "We could not reach Korapay. Please try again." };
    }
  });
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { isFinalKorapayStatus, matchesKorapayOrder } from "@/lib/korapay-payment";

const checkoutInput = z.object({
  productId: z.string().min(1).max(80),
  email: z.string().trim().email().max(254),
  paymentMethod: z.enum(["card", "bank_transfer", "pay_with_bank"]),
});

const verificationInput = z.object({
  reference: z.string().min(8).max(100),
  claimToken: z.string().regex(/^[a-f0-9]{64}$/),
});

const catalogRowSchema = z.object({
  product_id: z.string(),
  title: z.string(),
  category: z.string(),
  price: z.string(),
  amount_ngn: z.number().int().positive(),
  features: z.array(z.string()),
  is_sold: z.boolean(),
  is_reserved: z.boolean(),
});

const korapaySecretNameByProduct = {
  "lattice-elite-fashion": {
    url: "LATTICE_ELITE_FASHION_ADMIN_URL",
    username: "LATTICE_ELITE_FASHION_ADMIN_USERNAME",
    password: "LATTICE_ELITE_FASHION_ADMIN_PASSWORD",
  },
  "aerofit-wellness": {
    url: "AEROFIT_WELLNESS_ADMIN_URL",
    username: "AEROFIT_WELLNESS_ADMIN_USERNAME",
    password: "AEROFIT_WELLNESS_ADMIN_PASSWORD",
  },
  "omnivendor-smart-store": {
    url: "OMNIVENDOR_SMART_STORE_ADMIN_URL",
    username: "OMNIVENDOR_SMART_STORE_ADMIN_USERNAME",
    password: "OMNIVENDOR_SMART_STORE_ADMIN_PASSWORD",
  },
  "apex-corporate-hub": {
    url: "APEX_CORPORATE_HUB_ADMIN_URL",
    username: "APEX_CORPORATE_HUB_ADMIN_USERNAME",
    password: "APEX_CORPORATE_HUB_ADMIN_PASSWORD",
  },
  "bitespeed-food-bakery": {
    url: "BITESPEED_FOOD_BAKERY_ADMIN_URL",
    username: "BITESPEED_FOOD_BAKERY_ADMIN_USERNAME",
    password: "BITESPEED_FOOD_BAKERY_ADMIN_PASSWORD",
  },
  "lattice-chronicle-media": {
    url: "LATTICE_CHRONICLE_MEDIA_ADMIN_URL",
    username: "LATTICE_CHRONICLE_MEDIA_ADMIN_USERNAME",
    password: "LATTICE_CHRONICLE_MEDIA_ADMIN_PASSWORD",
  },
} as const;

export const getMarketplaceCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("marketplace_catalog").select("*").order("product_id");

  if (error || !data) {
    console.error("Marketplace inventory could not be loaded.");
    return { products: [], error: "Listings are temporarily unavailable." };
  }

  const products = z.array(catalogRowSchema).safeParse(data);
  if (!products.success) {
    console.error("Marketplace inventory returned unexpected listing data.");
    return { products: [], error: "Listings are temporarily unavailable." };
  }

  return {
    products: products.data.map((product) => ({
      id: product.product_id,
      title: product.title,
      category: product.category,
      price: product.price,
      features: product.features,
      isSold: product.is_sold,
      isReserved: product.is_reserved,
    })),
    error: null,
  };
});

export const createKorapayCheckout = createServerFn({ method: "POST" })
  .validator((input) => checkoutInput.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env["KORAPAY_SECRET_KEY"];
    if (!secretKey) {
      return { ok: false as const, message: "Checkout is not configured yet." };
    }

    const reference = `EL-${crypto.randomUUID()}`;
    const claimToken = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    const claimTokenHash = await hashSecret(claimToken);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: reservationData, error: reservationError } = await supabaseAdmin.rpc(
      "reserve_marketplace_order",
      {
        _product_id: data.productId,
        _reference: reference,
        _customer_email: data.email,
        _payment_method: data.paymentMethod,
        _claim_token_hash: claimTokenHash,
      },
    );
    const reservation = z
      .object({ status: z.string(), amount_ngn: z.number().optional(), title: z.string().optional() })
      .safeParse(reservationData);

    if (reservationError || !reservation.success) {
      console.error("A marketplace order could not be reserved.");
      return { ok: false as const, message: "This listing could not be reserved. Please try again." };
    }

    if (reservation.data.status !== "reserved" || !reservation.data.amount_ngn || !reservation.data.title) {
      const message =
        reservation.data.status === "sold"
          ? "This website has already been claimed."
          : reservation.data.status === "reserved"
            ? "Another buyer is completing checkout for this website. Please try again shortly."
            : "This listing is no longer available.";
      return { ok: false as const, message };
    }

    try {
      const appRequest = getRequest();
      const returnUrl = new URL("/", appRequest.url);
      returnUrl.searchParams.set("payment_reference", reference);
      const webhookUrl = new URL("/api/public/korapay/webhook", appRequest.url);

      const response = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: reservation.data.amount_ngn,
          currency: "NGN",
          reference,
          narration: `Purchase: ${reservation.data.title}`,
          customer: { email: data.email },
          redirect_url: returnUrl.toString(),
          notification_url: webhookUrl.toString(),
          channels: [data.paymentMethod],
          default_channel: data.paymentMethod,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        status?: unknown;
        data?: { checkout_url?: unknown };
      } | null;

      if (
        !response.ok ||
        (payload?.status !== true && payload?.status !== "true") ||
        typeof payload.data?.checkout_url !== "string"
      ) {
        console.error(`Korapay checkout initialization failed with status ${response.status}.`);
        await releaseReservation(reference);
        return { ok: false as const, message: "Korapay could not start checkout. Please try again." };
      }

      const checkoutUrl = new URL(payload.data.checkout_url);
      if (checkoutUrl.protocol !== "https:" || checkoutUrl.hostname !== "checkout.korapay.com") {
        console.error("Korapay returned an unexpected checkout address.");
        await releaseReservation(reference);
        return { ok: false as const, message: "Checkout could not be opened safely. Please try again." };
      }

      return { ok: true as const, checkoutUrl: checkoutUrl.toString(), reference, claimToken };
    } catch {
      console.error("Korapay checkout request could not be completed.");
      await releaseReservation(reference);
      return { ok: false as const, message: "We could not reach Korapay. Please try again." };
    }
  });

export const verifyKorapayPayment = createServerFn({ method: "POST" })
  .validator((input) => verificationInput.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env["KORAPAY_SECRET_KEY"];
    if (!secretKey) return { ok: false as const, message: "Payment verification is unavailable." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("marketplace_orders")
      .select("reference, product_id, amount_ngn, status, claim_token_hash")
      .eq("reference", data.reference)
      .maybeSingle();

    if (error || !order || !order.claim_token_hash) {
      return { ok: false as const, message: "We could not confirm this order. Contact the marketplace owner." };
    }

    if (!(await matchesSecret(data.claimToken, order.claim_token_hash))) {
      return { ok: false as const, message: "This checkout session could not be confirmed." };
    }

    if (order.status !== "pending" && order.status !== "paid") {
      return { ok: false as const, message: "This order could not be completed. Please contact the marketplace owner." };
    }

    if (order.status !== "paid") {
      try {
        const response = await fetch(
          `https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(data.reference)}`,
          { headers: { Authorization: `Bearer ${secretKey}` } },
        );
        const payload = (await response.json().catch(() => null)) as {
          status?: unknown;
          data?: { status?: unknown; amount?: unknown; currency?: unknown; reference?: unknown };
        } | null;

        if (!response.ok || (payload?.status !== true && payload?.status !== "true")) {
          return { ok: false as const, message: "Your payment is still being confirmed. Please check again shortly." };
        }

        const payment = payload.data;
        if (!payment || !matchesKorapayOrder(payment, { reference: data.reference, amount: order.amount_ngn })) {
          console.error("Korapay returned a transaction that did not match its order.");
          return { ok: false as const, message: "Payment details could not be matched to this order." };
        }

        if (!isFinalKorapayStatus(payment.status)) {
          return { ok: false as const, message: "Your payment is still being confirmed. Please check again shortly." };
        }

        const { data: finalizedStatus, error: finalizeError } = await supabaseAdmin.rpc("finalize_marketplace_payment", {
          _reference: data.reference,
          _amount_ngn: order.amount_ngn,
          _provider_status: payment.status,
        });

        if (finalizeError || finalizedStatus !== "paid") {
          console.error("A Korapay transaction could not claim its listing.");
          return {
            ok: false as const,
            message:
              finalizedStatus === "conflict"
                ? "Payment received, but another order claimed this listing first. Contact the marketplace owner for assistance."
                : "Payment is being confirmed. Please check again shortly.",
          };
        }
      } catch {
        console.error("Korapay transaction verification could not be completed.");
        return { ok: false as const, message: "Your payment is still being confirmed. Please check again shortly." };
      }
    }

    const secretNames = korapaySecretNameByProduct[order.product_id as keyof typeof korapaySecretNameByProduct];
    if (!secretNames) {
      console.error("Credential delivery is not configured for the purchased listing.");
      return { ok: false as const, message: "Your purchase is confirmed; contact the marketplace owner for access." };
    }

    const adminUrl = process.env[secretNames.url];
    const username = process.env[secretNames.username];
    const password = process.env[secretNames.password];

    if (!adminUrl || !username || !password) {
      console.error("Credential delivery is not configured for the purchased listing.");
      return { ok: false as const, message: "Your purchase is confirmed; contact the marketplace owner for access." };
    }

    try {
      const parsedUrl = new URL(adminUrl);
      if (parsedUrl.protocol !== "https:" || !parsedUrl.pathname.includes("/admin")) {
        console.error("Credential delivery is not configured with a secure admin address.");
        return { ok: false as const, message: "Your purchase is confirmed; contact the marketplace owner for access." };
      }
    } catch {
      console.error("Credential delivery is not configured with a valid admin address.");
      return { ok: false as const, message: "Your purchase is confirmed; contact the marketplace owner for access." };
    }

    const { data: claimed, error: claimError } = await supabaseAdmin.rpc("consume_marketplace_credential_claim", {
      _reference: data.reference,
      _claim_token_hash: order.claim_token_hash,
    });

    if (claimError || !claimed) {
      return { ok: false as const, message: "These credentials have already been retrieved. Keep them safe." };
    }

    return {
      ok: true as const,
      credentials: {
        productId: order.product_id,
        adminUrl,
        username,
        password,
        hosting: "Free fully functional cloud hosting included.",
        domains: "Link your own .com, .ng, or .com.ng domain when you take ownership.",
      },
    };
  });

async function releaseReservation(reference: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.rpc("release_marketplace_order", { _reference: reference });
  } catch {
    console.error("A marketplace checkout reservation could not be released.");
  }
}

async function hashSecret(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function matchesSecret(value: string, expectedHash: string) {
  const actualHash = await hashSecret(value);
  if (actualHash.length !== expectedHash.length) return false;
  const actual = new TextEncoder().encode(actualHash);
  const expected = new TextEncoder().encode(expectedHash);
  let mismatch = 0;
  for (let index = 0; index < actual.length; index += 1) {
    mismatch |= (actual[index] ?? 0) ^ (expected[index] ?? 0);
  }
  return mismatch === 0;
}
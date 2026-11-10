import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { matchesKorapayOrder } from "@/lib/korapay-payment";

const webhookSchema = z.object({
  event: z.enum(["charge.success", "charge.failed"]),
  data: z.object({ reference: z.string().min(8).max(100) }),
});

export const Route = createFileRoute("/api/public/korapay/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = webhookSchema.safeParse(await request.json().catch(() => null));
        if (!body.success) return Response.json({ error: "Invalid payment notification." }, { status: 400 });

        const secretKey = process.env["KORAPAY_SECRET_KEY"];
        if (!secretKey) {
          console.error("Korapay webhook could not verify the transaction.");
          return Response.json({ error: "Payment verification is unavailable." }, { status: 503 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order, error: orderError } = await supabaseAdmin
          .from("marketplace_orders")
          .select("reference, amount_ngn, status")
          .eq("reference", body.data.data.reference)
          .maybeSingle();

        if (orderError || !order) return Response.json({ received: true });
        if (order.status !== "pending") return Response.json({ received: true });

        try {
          const providerResponse = await fetch(
            `https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(order.reference)}`,
            { headers: { Authorization: `Bearer ${secretKey}` } },
          );
          const result = (await providerResponse.json().catch(() => null)) as {
            status?: unknown;
            data?: { reference?: unknown; amount?: unknown; currency?: unknown; status?: unknown };
          } | null;

          if (
            !providerResponse.ok ||
            (result?.status !== true && result?.status !== "true") ||
            !result.data ||
            !matchesKorapayOrder(result.data, { reference: order.reference, amount: order.amount_ngn })
          ) {
            console.error("Korapay webhook did not match a verified marketplace transaction.");
            return Response.json({ error: "Transaction could not be verified." }, { status: 409 });
          }

          const expectedStatus = body.data.event === "charge.success" ? "success" : "failed";
          if (result.data.status !== expectedStatus) {
            console.error("Korapay webhook event did not match its verified transaction status.");
            return Response.json({ error: "Transaction status did not match." }, { status: 409 });
          }

          const { error: finalizeError } = await supabaseAdmin.rpc("finalize_marketplace_payment", {
            _reference: order.reference,
            _amount_ngn: order.amount_ngn,
            _provider_status: expectedStatus,
          });

          if (finalizeError) {
            console.error("A verified Korapay payment could not be recorded.");
            return Response.json({ error: "Payment could not be recorded yet." }, { status: 503 });
          }

          return Response.json({ received: true });
        } catch {
          console.error("Korapay webhook verification request could not be completed.");
          return Response.json({ error: "Payment verification is unavailable." }, { status: 503 });
        }
      },
    },
  },
});
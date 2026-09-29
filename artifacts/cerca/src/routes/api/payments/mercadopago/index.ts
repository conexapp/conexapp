import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { bumpRateLimit } from "@/lib/cerca/domain/rate-limit";
import { readMercadoPagoEnv, verifyMercadoPagoSignature } from "@/lib/cerca/payments/mercadopago";
import { clientIp } from "@/lib/cerca/payments/rate-limit";
import { processMercadoPagoWebhook } from "@/lib/cerca/server/payment-runtime";

/**
 * Webhook de Mercado Pago. No usa sesión.
 * Firma inválida: 401, sin cambiar el pedido.
 * Firma válida: se guarda el evento y se lee GET /v1/payments/{id}
 * con el token del vendedor. Solo approved pasa el pedido a PAID.
 */
export const Route = createFileRoute("/api/payments/mercadopago/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const db = await getSql();
        const hits = await bumpRateLimit(db, `webhook:${clientIp(request)}`, 60);
        if (hits > 120) return Response.json({ ok: false }, { status: 429 });
        const env = readMercadoPagoEnv();
        if (!env.webhookSecret) {
          return Response.json(
            { ok: false, code: "PAYMENTS_NOT_CONFIGURED", missing: ["MP_WEBHOOK_SECRET"] },
            { status: 503 },
          );
        }
        const url = new URL(request.url);
        const body = (await request.json().catch(() => null)) as {
          id?: number | string;
          type?: string;
          action?: string;
          user_id?: string | number;
        } | null;
        const dataId = url.searchParams.get("data.id");
        const valid = verifyMercadoPagoSignature({
          header: request.headers.get("x-signature"),
          requestId: request.headers.get("x-request-id"),
          dataId,
          secret: env.webhookSecret,
        });
        if (!valid) return Response.json({ ok: false }, { status: 401 });
        const result = await processMercadoPagoWebhook({
          dataId,
          topic: body?.type ?? url.searchParams.get("type") ?? "payment",
          body,
        });
        return Response.json(result.body, { status: result.httpStatus });
      },
    },
  },
});

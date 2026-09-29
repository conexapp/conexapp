import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { bumpRateLimit } from "@/lib/cerca/domain/rate-limit";
import { clientIp } from "@/lib/cerca/payments/rate-limit";
import { completeSellerOAuth } from "@/lib/cerca/server/payment-runtime";

function page(title: string, text: string): Response {
  const clean = (value: string) => value.replace(/[<>&]/g, "");
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${clean(title)}</title><body style="font-family:sans-serif;padding:2rem"><h1>${clean(title)}</h1><p>${clean(text)}</p><p><a href="/panel">Volver al panel</a></p></body>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export const Route = createFileRoute("/api/payments/mercadopago/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const db = await getSql();
        const hits = await bumpRateLimit(db, `oauth-callback:${clientIp(request)}`, 60);
        if (hits > 30) return page("Demasiados intentos", "Esperá un minuto y volvé a conectar.");
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !state) return page("No se vinculó", "Mercado Pago no envió el código.");
        try {
          const result = await completeSellerOAuth({ code, state });
          return page(result.ok ? "Cuenta vinculada" : "No se vinculó", result.message);
        } catch {
          return page("No se vinculó", "No se pudo guardar la cuenta. Revisá CERCA_TOKEN_KEY y las credenciales.");
        }
      },
    },
  },
});

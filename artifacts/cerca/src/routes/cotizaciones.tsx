import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { PaymentMethodRadios } from "@/components/cerca/payment-methods";
import { paymentMethodByCode } from "@/lib/cerca/domain/payment-methods";
import { acceptQuote, cancelBuyerNeed, listMyQuoteRequests } from "@/lib/cerca/server/trade";
import { formatArs } from "@/lib/cerca/domain/money";
import { formatWhen, quoteStatusLabel, requestStatusLabel } from "@/lib/cerca/domain/labels";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/cotizaciones")({ component: QuotesPage });

function QuotesPage() {
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Awaited<ReturnType<typeof listMyQuoteRequests>> | null>(null);

  function reload() {
    void listMyQuoteRequests()
      .then(setData)
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se pudieron leer."));
  }

  useEffect(() => {
    if (user) reload();
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <Shell>
      <h1 className="mb-2 text-4xl">Mis consultas</h1>
      <p className="mb-4 max-w-2xl text-sm text-muted">
        Acá están las consultas de productos y lo que publicaste porque no lo encontraste. Aceptar una respuesta arma una compra solo cuando está ligada a un producto publicado.
      </p>
      <div className="grid gap-4">
        {data?.requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-line bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-2xl">{request.title}</h2>
              <span className="text-sm text-muted">{requestStatusLabel(request.status)}</span>
            </div>
            <p className="text-sm text-muted">
              Cantidad: {request.quantity}
              {" · "}
              {request.delivery_required ? "Entrega" : "Retiro"}
              {request.listing_id ? "" : " · pedido abierto"}
              {formatWhen(request.created_at) ? ` · ${formatWhen(request.created_at)}` : ""}
            </p>
            {!request.listing_id ? (
              <p className="mt-2 text-sm text-muted">
                Los proveedores pueden responder, pero aceptar esta respuesta no genera una compra: no hay un producto publicado del cual reservar stock.
              </p>
            ) : null}
            <ul className="mt-3 grid gap-2">
              {data.quotes
                .filter((quote) => quote.request_id === request.id)
                .map((quote) => (
                  <li key={quote.id} className="grid gap-2 border-t border-line pt-3">
                    <div>
                      <p className="font-medium">{quote.trade_name}</p>
                      <p className="text-sm text-muted">
                        {formatArs(quote.unitPriceCents)} × {quote.quantity}
                        {quote.shippingCents ? ` + envío ${formatArs(quote.shippingCents)}` : ""}
                        {` · total ${formatArs(quote.totalCents)}`}
                        {quote.lead_time_hours !== null ? ` · ${quote.lead_time_hours} h` : ""}
                        {" · "}
                        {quoteStatusLabel(quote.status)}
                      </p>
                      {quote.notes ? <p className="mt-1 text-sm">{quote.notes}</p> : null}
                    </div>
                    {quote.status === "submitted" && request.status !== "accepted" && request.listing_id ? (
                      <AcceptQuote quoteId={quote.id} totalCents={quote.totalCents} methods={quote.paymentMethods} />
                    ) : null}
                  </li>
                ))}
            </ul>
            {data.quotes.every((quote) => quote.request_id !== request.id) ? (
              <p className="mt-2 text-sm text-muted">Todavía no hay respuestas.</p>
            ) : null}
            {!request.listing_id && (request.status === "open" || request.status === "answered") ? (
              <button
                type="button"
                className="cx-danger mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-semibold"
                onClick={() => {
                  void cancelBuyerNeed({ data: request.id })
                    .then(() => {
                      toast.success("Pedido cancelado.");
                      reload();
                    })
                    .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se canceló."));
                }}
              >
                Cancelar pedido
              </button>
            ) : null}
          </article>
        ))}
        {data && data.requests.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-5">
            <p className="font-semibold">No tenés consultas todavía.</p>
            <p className="mt-2 text-sm text-muted">Acá vas a encontrar tus consultas y lo que publiques cuando no encuentres un producto.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/" hash="productos" className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">Buscar</Link>
              <Link to="/solicitudes" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold">Publicar lo que necesito</Link>
            </div>
          </div>
        ) : null}
      </div>
    </Shell>
  );
}

function AcceptQuote({ quoteId, totalCents, methods }: { quoteId: string; totalCents: number; methods: string[] }) {
  const [method, setMethod] = useState("");
  const needsChoice = methods.length > 0;
  const chosen = paymentMethodByCode(method);
  return (
    <div className="grid gap-2">
      {needsChoice ? (
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">¿Cómo querés pagar?</legend>
          <p className="text-sm text-muted">
            Solo los medios que este proveedor declaró. CONEX no verifica que pueda cobrar con cada uno. Elegir no confirma el pago.
          </p>
          <PaymentMethodRadios name={`pago-${quoteId}`} codes={methods} value={method} onChange={setMethod} />
          {chosen ? <p className="text-sm">Medio de pago: {chosen.name}</p> : null}
        </fieldset>
      ) : (
        <p className="text-sm text-muted">
          Medios de pago: consultar con el proveedor. Aceptar no elige un medio ni confirma un pago.
        </p>
      )}
      <button
        type="button"
        disabled={needsChoice && !method}
        className="min-h-11 w-fit rounded-full bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-40"
        onClick={() => {
          if (needsChoice && !method) {
            toast.error("Elegí un medio de pago antes de aceptar.");
            return;
          }
          void acceptQuote({
            data: { quoteId, idempotencyKey: crypto.randomUUID(), paymentMethod: needsChoice ? method : null },
          })
            .then((order) => {
              toast.success("Respuesta aceptada. La compra quedó pendiente de pago: no se cobró nada.");
              window.location.href = `/pedidos/${order.orderId}`;
            })
            .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se aceptó."));
        }}
      >
        Aceptar {formatArs(totalCents)}
      </button>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { ConexSelect } from "@/components/cerca/controls";
import { formatArs } from "@/lib/cerca/domain/money";
import { orderStatusLabel } from "@/lib/cerca/domain/labels";
import {
  addDisputeMessage,
  advanceOrder,
  confirmDeliveryCode,
  getOrder,
  openDispute,
  startCheckout,
} from "@/lib/cerca/server/trade";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PaymentMethodInline } from "@/components/cerca/payment-methods";
import { toast } from "sonner";

export const Route = createFileRoute("/pedidos/$orderId")({ component: OrderPage });

const REASONS = [
  ["producto_faltante", "Producto faltante"],
  ["producto_incorrecto", "Producto incorrecto"],
  ["producto_danado", "Producto dañado"],
  ["pedido_incompleto", "Pedido incompleto"],
  ["pedido_no_recibido", "Pedido no recibido"],
  ["problema_entrega", "Problema con la entrega"],
] as const;

function OrderPage() {
  const { orderId } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const [order, setOrder] = useState<Awaited<ReturnType<typeof getOrder>> | null>(null);
  const [code, setCode] = useState("");
  const [reason, setReason] = useState<string>(REASONS[0][0]);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  function reload() {
    void getOrder({ data: orderId }).then(setOrder).catch((error: unknown) => {
      toast.error(error instanceof Error ? error.message : "No se pudo abrir el pedido.");
    });
  }

  useEffect(() => {
    if (user) reload();
  }, [user, orderId]);

  if (!isPending && !user) return <RedirectToSignIn />;
  if (!order) return <Shell><p className="text-muted">Cargando pedido…</p></Shell>;

  async function act(action: "supplier_confirm" | "start_preparing" | "mark_ready_for_pickup" | "mark_out_for_delivery" | "cancel" | "buyer_close") {
    try {
      const result = await advanceOrder({ data: { orderId, action } });
      if (result.deliveryCode) {
        setRevealed(result.deliveryCode);
        toast.success("Código generado. Anotalo: no se vuelve a mostrar.");
      }
      if (result.message) toast.message(result.message);
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar.");
    }
  }

  return (
    <Shell>
      <p className="text-sm text-muted">{order.tradeName} · {order.viewer === "buyer" ? "Compra" : "Venta"}</p>
      <h1 className="text-4xl">{orderStatusLabel(order.status)}</h1>
      <p className="mt-2 text-sm text-muted">
        Liquidación: {order.settlementStatus}. CONEX no libera el dinero al validar el código de entrega.
        {order.status === "PAID"
          ? " Mercado Pago aprobó el cobro. Split 1:1 no documenta una liberación: el pedido queda en awaiting_provider. Eso no significa que el dinero ya esté en la cuenta del proveedor."
          : " Completar el pedido no transfiere dinero."}
      </p>
      <ul className="mt-4 grid gap-1">
        {order.items.map((item) => (
          <li key={item.title} className="flex justify-between gap-3">
            <span>
              {item.title} × {item.quantity}
              {item.unit ? ` ${item.unit}` : ""}
              {item.sku ? ` · código ${item.sku}` : ""}
              <span className="mt-1 block text-xs text-muted">Precio unitario al momento de la compra: {formatArs(item.unitPriceCents)}</span>
            </span>
            <span className="tabular-nums">{formatArs(item.lineCents)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-right font-display text-3xl tabular-nums">{formatArs(order.totalCents)}</p>
      {order.economics ? (
        <p className="mt-2 text-sm text-muted">
          Comisión de CONEX congelada en este pedido: {(order.economics.feeBps / 100).toFixed(2)}% ({formatArs(order.economics.marketplaceFeeCents)}).
          {order.economics.processorFeeCents == null || order.economics.supplierNetCents == null
            ? " Mercado Pago no informó la comisión del procesador. No se muestra un neto."
            : ` Comisión de Mercado Pago informada: ${formatArs(order.economics.processorFeeCents)}. Neto del proveedor: ${formatArs(order.economics.supplierNetCents)}.`}
        </p>
      ) : null}
      <section className="mt-4 rounded-2xl border border-line bg-card p-4">
        <h2 className="text-lg font-semibold">Medio de pago</h2>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span>Medio de pago elegido:</span>
          {order.paymentMethod ? <PaymentMethodInline code={order.paymentMethod} /> : <span>{order.payment.methodName}</span>}
        </p>
        <p className="mt-1 text-sm">Estado del pago: {order.payment.stateLabel}</p>
        {order.paymentMethod === "mercadopago" && order.payment.stateLabel === "Pendiente" ? (
          <p className="mt-2 text-sm text-muted">Elegir Mercado Pago no aprueba el pago. Solo cuenta la confirmación de Mercado Pago.</p>
        ) : null}
        {order.paymentMethod === "mercadopago" && order.payment.stateLabel === "Rechazado" ? (
          <p className="mt-2 text-sm text-muted">Mercado Pago no aprobó el cobro. El pedido no quedó pagado.</p>
        ) : null}
        {order.paymentMethod === "mercadopago" && order.payment.confirmed ? (
          <p className="mt-2 text-sm text-muted">Pago aprobado por Mercado Pago.</p>
        ) : null}
        {order.paymentMethod !== "mercadopago" ? (
          <p className="mt-2 text-sm text-muted">CONEX registra la elección. No confirma el pago salvo una respuesta real de Mercado Pago.</p>
        ) : null}
      </section>
      {order.paymentWarning ? <p className="mt-2 text-sm text-muted">{order.paymentWarning}</p> : null}
      {order.refundStatus !== "not_requested" ? (
        <p className="mt-2 text-sm text-muted">Reembolso: {order.refundStatus}. Sin confirmación de Mercado Pago la compra no queda reembolsada.</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {order.viewer === "buyer" && order.status === "PENDING_PAYMENT" && order.mercadoPagoCheckout && order.sellerLinked && order.paymentMissing.length === 0 ? (
          <button
            type="button"
            className="min-h-11 rounded-full bg-copper px-4 text-ink"
            onClick={() => {
              void startCheckout({ data: orderId }).then((result) => {
                if (result.ok && result.redirectUrl) {
                  window.location.href = result.redirectUrl;
                  return;
                }
                const missing = result.missing.length > 0 ? ` Falta: ${result.missing.join(", ")}.` : "";
                toast.message(`${result.message}${missing}`);
              });
            }}
          >
            Pagar con Mercado Pago
          </button>
        ) : null}
        {order.viewer === "buyer" && order.status === "PENDING_PAYMENT" && order.mercadoPagoCheckout && order.paymentMissing.length > 0 ? (
          <p className="text-sm text-muted">Mercado Pago no está configurado. No se inició un cobro. Falta: {order.paymentMissing.join(", ")}.</p>
        ) : null}
        {order.viewer === "buyer" && order.status === "PENDING_PAYMENT" && order.mercadoPagoCheckout && order.paymentMissing.length === 0 && !order.sellerLinked ? (
          <p className="text-sm text-muted">Mercado Pago requiere que el proveedor lo conecte. No se generó un pago.</p>
        ) : null}
        {order.viewer !== "buyer" && order.status === "PAID" ? (
          <button type="button" className="min-h-11 rounded-full bg-ink px-4 text-paper" onClick={() => void act("supplier_confirm")}>Confirmar</button>
        ) : null}
        {order.viewer !== "buyer" && order.status === "CONFIRMED" ? (
          <button type="button" className="min-h-11 rounded-full bg-ink px-4 text-paper" onClick={() => void act("start_preparing")}>Preparar</button>
        ) : null}
        {order.viewer !== "buyer" && order.status === "PREPARING" && order.fulfillment === "delivery" ? (
          <button type="button" className="min-h-11 rounded-full bg-olive px-4 text-ink" onClick={() => void act("mark_out_for_delivery")}>Sale a entrega</button>
        ) : null}
        {order.viewer !== "buyer" && order.status === "PREPARING" && order.fulfillment === "pickup" ? (
          <button type="button" className="min-h-11 rounded-full bg-olive px-4 text-ink" onClick={() => void act("mark_ready_for_pickup")}>Listo para retirar</button>
        ) : null}
        {order.viewer === "buyer" && order.status === "DELIVERED" ? (
          <button type="button" className="min-h-11 rounded-full bg-ink px-4 text-paper" onClick={() => void act("buyer_close")}>Cerrar recepción</button>
        ) : null}
        {(order.status === "PENDING_PAYMENT" || order.status === "PAID" || order.status === "CONFIRMED") ? (
          <button type="button" className="cx-danger min-h-11 rounded-full border border-line px-4" onClick={() => void act("cancel")}>Cancelar</button>
        ) : null}
      </div>

      {revealed ? (
        <p className="mt-4 rounded-card border border-copper bg-foam p-4">
          Código de entrega, visible una sola vez: <strong className="tabular-nums">{revealed}</strong>. Se lo das al comprador en la entrega. Él lo carga. El servidor guarda solo el hash.
        </p>
      ) : null}

      {order.viewer === "buyer" && (order.status === "OUT_FOR_DELIVERY" || order.status === "READY_FOR_PICKUP") ? (
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void confirmDeliveryCode({ data: { orderId, code } })
              .then(() => {
                toast.success("Entrega confirmada. No se liberó dinero.");
                reload();
              })
              .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Código rechazado."));
          }}
        >
          <p className="rounded-2xl bg-sun/40 px-4 py-3 text-sm text-ink">
            Antes de confirmar, conviene grabar la apertura desde el paquete cerrado: etiqueta, embalaje, contenido y número de serie si tiene. No es obligatorio. El código confirma que recibiste el pedido; no cierra un reclamo posterior.
          </p>
          <div className="flex gap-2">
            <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" placeholder="Código de 8 dígitos" className="min-h-12 flex-1 rounded-full border border-line px-4" />
            <button className="min-h-12 rounded-full bg-ink px-4 text-paper">Validar</button>
          </div>
        </form>
      ) : null}

      <section className="mt-8">
        <h2 className="text-2xl">Historial</h2>
        <ol className="mt-2 grid gap-1 text-sm">
          {order.events.map((event) => (
            <li key={event.created_at + event.to_status}>{event.created_at} · {orderStatusLabel(event.to_status)} · {event.actor_kind === "buyer" ? "comprador" : event.actor_kind === "supplier" ? "proveedor" : event.actor_kind} {event.note ? `· ${event.note}` : ""}</li>
          ))}
        </ol>
      </section>

      {order.viewer === "buyer" && order.disputes.length === 0 ? (
        <form
          className="mt-6 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void openDispute({ data: { orderId, reason, description } })
              .then(() => {
                toast.success("Disputa abierta.");
                reload();
              })
              .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se abrió."));
          }}
        >
          <h2 className="text-2xl">Disputa</h2>
          <p className="text-sm text-muted">Las fotos no se pueden adjuntar: falta el almacenamiento de objetos. El motivo y el texto sí quedan guardados.</p>
          <ConexSelect
            value={reason}
            onChange={setReason}
            ariaLabel="Motivo de la disputa"
            options={REASONS.map(([value, label]) => ({ value, label }))}
          />
          <textarea required value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-24 rounded-2xl border border-line px-3 py-2" />
          <button className="min-h-11 rounded-full border border-ink">Abrir disputa</button>
        </form>
      ) : null}

      {order.disputes.map((dispute) => (
        <section key={dispute.id} className="mt-4 rounded-card border border-line p-4">
          <h2 className="text-2xl">Disputa {dispute.status}</h2>
          <p className="text-sm">{dispute.reason}. Reembolso: {dispute.refund_status}.</p>
          <p className="mt-2">{dispute.description}</p>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void addDisputeMessage({ data: { disputeId: dispute.id, body: message } })
                .then(() => {
                  setMessage("");
                  toast.success("Mensaje guardado.");
                })
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se envió."));
            }}
          >
            <input value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-11 flex-1 rounded-full border border-line px-3" />
            <button className="min-h-11 rounded-full bg-ink px-4 text-paper">Enviar</button>
          </form>
        </section>
      ))}
    </Shell>
  );
}

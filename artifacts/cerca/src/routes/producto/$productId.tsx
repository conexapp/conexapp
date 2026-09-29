import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { businessInitials, memberSinceLabel } from "@/lib/cerca/domain/labels";
import { completionShare, publicStandingLabel } from "@/lib/cerca/domain/seller-profile";
import { formatArs } from "@/lib/cerca/domain/money";
import { CategoryGlyph } from "@/components/cerca/category-visual";
import { PaymentMethodChips, PaymentMethodRadios } from "@/components/cerca/payment-methods";
import { ConexSelect, QuantityField } from "@/components/cerca/controls";
import { getBusiness, getListing, getPlatformStatus } from "@/lib/cerca/server/public";
import { buyPublishedListing, createQuoteRequest } from "@/lib/cerca/server/trade";
import { submitReport } from "@/lib/cerca/server/reports";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/producto/$productId")({ component: ProductPage });

type Listing = Awaited<ReturnType<typeof getListing>>;
type Business = Awaited<ReturnType<typeof getBusiness>>;

function ProductPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [listing, setListing] = useState<Listing | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [delivery, setDelivery] = useState(true);
  const [photo, setPhoto] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const [sending, setSending] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyQty, setBuyQty] = useState(1);
  const [buyDelivery, setBuyDelivery] = useState(true);
  const [buyAddress, setBuyAddress] = useState("");
  const [buyMethod, setBuyMethod] = useState("");
  const [buying, setBuying] = useState(false);
  const [paymentsMissing, setPaymentsMissing] = useState<string[] | null>(null);

  useEffect(() => {
    let dead = false;
    setListing(null);
    setBusiness(null);
    setError("");
    setPhoto(0);
    setQuantity(1);
    setAddress("");
    setNotes("");
    setBroken({});
    void getListing({ data: productId })
      .then((next) => {
        if (dead) return;
        setListing(next);
        setDelivery(next.delivery);
        setBuyDelivery(next.delivery);
        setBuyQty(1);
        setBuyMethod("");
      })
      .catch((cause: unknown) => {
        if (!dead) setError(cause instanceof Error ? cause.message : "No se encontró el producto.");
      });
    return () => {
      dead = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!listing) return;
    let dead = false;
    void getBusiness({ data: listing.businessId })
      .then((next) => {
        if (!dead) setBusiness(next);
      })
      .catch(() => {
        if (!dead) setBusiness(null);
      });
    return () => {
      dead = true;
    };
  }, [listing]);

  useEffect(() => {
    if (!listing || !user) return;
    if (new URLSearchParams(window.location.search).get("comprar") === "1") setBuyOpen(true);
  }, [listing, user]);

  useEffect(() => {
    let dead = false;
    void getPlatformStatus()
      .then((status) => {
        if (!dead) setPaymentsMissing(status.payments.missing);
      })
      .catch(() => {
        if (!dead) setPaymentsMissing(null);
      });
    return () => {
      dead = true;
    };
  }, []);

  if (error) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold">Este producto no está publicado</h1>
        <p className="mt-2 max-w-xl text-muted">{error}</p>
        <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink">
          Volver al inicio
        </Link>
      </Shell>
    );
  }

  if (!listing) {
    return (
      <Shell>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]" aria-busy="true" aria-live="polite">
          <div className="aspect-square animate-pulse rounded-2xl bg-paper" />
          <div className="grid content-start gap-3">
            <div className="h-4 w-28 animate-pulse rounded bg-paper" />
            <div className="h-10 w-4/5 animate-pulse rounded bg-paper" />
            <div className="h-8 w-36 animate-pulse rounded bg-paper" />
            <div className="mt-4 h-40 animate-pulse rounded-2xl bg-paper" />
          </div>
          <p className="sr-only">Cargando producto…</p>
        </div>
      </Shell>
    );
  }

  const images = listing.images;
  const photoIndex = images.length === 0 ? 0 : Math.min(photo, images.length - 1);
  const currentImage = images[photoIndex];
  const imageBroken = broken[photoIndex] === true;
  const inStock = listing.stockUnits > 0;
  const canDeliver = listing.delivery;
  const canPickup = listing.pickup;
  const quoteBlocked = !inStock || (!canDeliver && !canPickup);
  const others = (business?.listings ?? []).filter((item) => item.id !== listing.id);
  const place = business
    ? business.approximate
      ? [business.neighborhood, business.city, "ubicación aproximada"].filter((part) => part && part.trim()).join(" · ")
      : [business.addressLine, business.neighborhood, business.city].filter((part) => part && part.trim()).join(" · ")
    : listing.neighborhood
      ? `${listing.neighborhood}, Rosario`
      : null;
  const cityLine = business
    ? [business.city, business.province].filter((part) => part && part.trim()).join(", ")
    : "Rosario, Santa Fe";
  const since = business ? memberSinceLabel(business.createdAt) : null;
  const publishedCount = business?.listings.length ?? 0;
  const standing = business ? publicStandingLabel(business.completedOrders) : null;
  const closedShare = business ? completionShare(business.completedOrders, business.cancelledOrders) : null;
  const facts = [
    listing.brand.trim() ? ["Marca", listing.brand.trim()] : null,
    listing.model.trim() ? ["Modelo", listing.model.trim()] : null,
    ["Categoría", listing.categoryName],
    ["Unidad", listing.unit],
  ].filter((item): item is [string, string] => item !== null);

  return (
    <Shell>
      <nav aria-label="Migas" className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
        <Link to="/" className="min-h-11 inline-flex items-center hover:text-ink">
          Inicio
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          to="/"
          search={{ categoria: listing.categorySlug }}
          className="inline-flex min-h-11 items-center gap-2 font-medium text-ink hover:text-olive"
        >
          <CategoryGlyph slug={listing.categorySlug} />
          <span className="whitespace-normal">{listing.categoryName}</span>
        </Link>
        <span aria-hidden="true" className="hidden sm:inline">
          /
        </span>
        <span className="hidden max-w-xs truncate sm:inline" aria-current="page">
          {listing.name}
        </span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.12fr)_minmax(16.5rem,22rem)]">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {currentImage && !imageBroken ? (
            <img
              src={currentImage}
              alt={listing.name}
              className="aspect-square w-full rounded-2xl bg-paper object-cover"
              onError={() => setBroken((current) => ({ ...current, [photoIndex]: true }))}
            />
          ) : (
            <div className="grid aspect-square place-items-center rounded-2xl bg-paper px-6 text-center text-sm text-muted">
              {images.length === 0 ? "Este producto no tiene fotos." : "No se pudo cargar esta foto."}
            </div>
          )}
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  aria-label={`Foto ${index + 1} de ${images.length}`}
                  aria-pressed={index === photoIndex}
                  onClick={() => setPhoto(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal ${index === photoIndex ? "ring-2 ring-teal" : ""}`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <article className="min-w-0 lg:col-start-2 lg:row-start-1">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <CategoryGlyph slug={listing.categorySlug} />
            <span className="whitespace-normal">{listing.categoryName}</span>
          </p>
          <h1 className="mt-1 text-3xl leading-tight font-semibold text-balance">{listing.name}</h1>
          <p className="mt-4 font-display text-4xl leading-none font-semibold tabular-nums">
            {formatArs(listing.priceCents)}
            <span className="ml-2 text-base font-medium text-muted">/ {listing.unit}</span>
          </p>
          <p className="mt-3 text-sm font-medium">{stockLabel(listing.stockUnits, listing.unit)}</p>
          <p className="mt-1 text-sm text-muted">{deliveryMode(canDeliver, canPickup)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={quoteBlocked}
              className="min-h-11 rounded-full bg-ember px-5 text-sm font-semibold text-ink disabled:opacity-40"
              onClick={() => {
                if (quoteBlocked) return;
                if (!user) {
                  sessionStorage.setItem("conex-after-auth", `/producto/${listing.id}?comprar=1`);
                  void navigate({ to: "/login" });
                  return;
                }
                setBuyOpen(true);
                document.getElementById("comprar")?.scrollIntoView({ block: "nearest" });
              }}
            >
              Comprar
            </button>
            <a
              href="#pedir-cotizacion"
              className="inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-sm font-semibold"
            >
              Consultar producto
            </a>
          </div>
          {quoteBlocked ? (
            <p className="mt-2 text-sm text-muted">
              {!inStock
                ? "Sin stock: no se puede comprar este producto."
                : "Este producto no tiene entrega ni retiro, así que no se puede comprar."}
            </p>
          ) : null}
          {buyOpen ? (
            <form
              id="comprar"
              className="mt-4 grid scroll-mt-28 gap-3 rounded-2xl border border-line bg-card p-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (quoteBlocked || buying) return;
                if (!user) {
                  sessionStorage.setItem("conex-after-auth", `/producto/${listing.id}?comprar=1`);
                  void navigate({ to: "/login" });
                  return;
                }
                const needsMethod = listing.paymentMethods.length > 0;
                if (needsMethod && !buyMethod) {
                  toast.error("Elegí un medio de pago antes de confirmar.");
                  return;
                }
                setBuying(true);
                const ship = buyDelivery && canDeliver;
                void buyPublishedListing({
                  data: {
                    listingId: listing.id,
                    quantity: buyQty,
                    delivery: ship,
                    address: ship ? buyAddress : "",
                    paymentMethod: needsMethod ? buyMethod : null,
                    idempotencyKey: crypto.randomUUID(),
                  },
                })
                  .then((order) => {
                    toast.success("Compra registrada. Quedó pendiente de pago: no se cobró nada.");
                    window.location.href = `/pedidos/${order.orderId}`;
                  })
                  .catch((cause: unknown) => {
                    setBuying(false);
                    toast.error(cause instanceof Error ? cause.message : "No se pudo crear la compra.");
                  });
              }}
            >
              <div>
                <h2 className="text-lg font-semibold">Confirmar compra</h2>
                <p className="mt-1 text-sm text-muted">
                  {listing.businessName}. Precio publicado: {formatArs(listing.priceCents)} / {listing.unit}. Stock: {listing.stockUnits}.
                </p>
              </div>
              <label className="grid gap-1 text-sm" htmlFor="conex-buy-quantity">
                Cantidad
                <QuantityField
                  id="conex-buy-quantity"
                  name="buy-quantity"
                  value={buyQty}
                  min={1}
                  max={Math.max(listing.stockUnits, 1)}
                  disabled={!inStock || buying}
                  onChange={setBuyQty}
                />
              </label>
              {canDeliver && canPickup ? (
                <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="conex-buy-delivery">
                  <input
                    id="conex-buy-delivery"
                    name="buy-delivery"
                    type="checkbox"
                    checked={buyDelivery}
                    onChange={(event) => setBuyDelivery(event.target.checked)}
                  />
                  Quiero entrega
                </label>
              ) : null}
              {buyDelivery && canDeliver ? (
                <label className="grid gap-1 text-sm" htmlFor="conex-buy-address">
                  Dirección en Rosario
                  <input
                    id="conex-buy-address"
                    name="buy-address"
                    required
                    autoComplete="street-address"
                    value={buyAddress}
                    onChange={(event) => setBuyAddress(event.target.value)}
                    className="min-h-11 rounded-2xl border border-line bg-paper px-3"
                  />
                </label>
              ) : (
                <p className="text-sm text-muted">Retiro en el negocio. No hace falta una dirección.</p>
              )}
              {listing.paymentMethods.length > 0 ? (
                <fieldset className="grid gap-2">
                  <legend className="text-sm font-semibold">¿Cómo querés pagar?</legend>
                  <p className="text-sm text-muted">
                    Solo los medios que este proveedor declaró. Elegir no confirma el pago.
                  </p>
                  <PaymentMethodRadios
                    name={`compra-${listing.id}`}
                    codes={listing.paymentMethods}
                    value={buyMethod}
                    onChange={setBuyMethod}
                  />
                  {buyMethod === "mercadopago" ? (
                    <p className="text-sm text-muted">Elegir Mercado Pago no aprueba el pago. Solo cuenta la confirmación de Mercado Pago.</p>
                  ) : null}
                  {buyMethod === "mercadopago" && paymentsMissing && paymentsMissing.length > 0 ? (
                    <p className="text-sm text-muted">Mercado Pago no está configurado. No se inició un cobro.</p>
                  ) : null}
                  {buyMethod === "mercadopago" && business && !business.mercadoPago ? (
                    <p className="text-sm text-muted">Este negocio todavía no conectó Mercado Pago.</p>
                  ) : null}
                </fieldset>
              ) : (
                <p className="text-sm text-muted">
                  Medios de pago: consultar con el proveedor. Confirmar no elige un medio ni confirma un pago.
                </p>
              )}
              <p className="text-sm font-medium">
                Total: {formatArs(listing.priceCents * buyQty + (buyDelivery && canDeliver ? listing.shippingCents : 0))}
              </p>
              <button
                type="submit"
                disabled={quoteBlocked || buying || (listing.paymentMethods.length > 0 && !buyMethod)}
                className="min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink disabled:opacity-40"
              >
                {buying ? "Confirmando…" : "Confirmar compra"}
              </button>
            </form>
          ) : null}
          <section className="mt-5" aria-labelledby="medios-pago">
            <h2 id="medios-pago" className="text-sm font-semibold">
              {listing.paymentMethods.length > 0 ? "Medios de pago aceptados por el proveedor" : "Medios de pago"}
            </h2>
            <div className="mt-2">
              <PaymentMethodChips codes={listing.paymentMethods} />
            </div>
            {listing.paymentMethods.length > 0 ? (
              <p className="mt-2 text-sm text-muted">
                El proveedor indicó que acepta estos medios. CONEX no verifica automáticamente que pueda cobrar con cada uno.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">Este proveedor no declaró medios. CONEX no inventó ninguno.</p>
            )}
            {listing.paymentMethods.includes("mercadopago") && business && !business.mercadoPago ? (
              <p className="mt-2 text-sm text-muted">
                Elegir Mercado Pago no inicia un cobro: este negocio todavía no lo conectó.
              </p>
            ) : null}
          </section>
          {facts.length > 0 ? (
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {facts.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-sm font-medium break-words">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <section className="mt-6">
            <h2 className="text-xl font-semibold">Descripción</h2>
            {listing.description.trim() ? (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">Este producto no tiene descripción.</p>
            )}
          </section>
        </article>

        <section className="min-w-0 rounded-2xl border border-line bg-card p-4 shadow-card lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal/15 font-display text-lg font-semibold text-olive"
            >
              {businessInitials(listing.businessName)}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-olive uppercase">Proveedor</p>
              <h2 className="mt-1 text-2xl font-semibold break-words">{listing.businessName}</h2>
              <p className="mt-1 text-sm font-medium">{standing?.label ?? "Negocio aprobado para publicar"}</p>
              {standing ? <p className="mt-1 text-sm text-muted">{standing.detail}</p> : null}
              <p className="mt-1 text-sm text-muted">{cityLine}</p>
            </div>
          </div>
          {business ? (
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Productos publicados</dt>
                <dd className="font-medium">{publishedCountLabel(publishedCount)}</dd>
              </div>
              {since ? (
                <div>
                  <dt className="text-muted">En CONEX</dt>
                  <dd className="font-medium">{since}</dd>
                </div>
              ) : null}
              {business.completedOrders > 0 ? (
                <div>
                  <dt className="text-muted">Operaciones completadas</dt>
                  <dd className="font-medium">{business.completedOrders}</dd>
                </div>
              ) : null}
              {business.cancelledOrders > 0 ? (
                <div>
                  <dt className="text-muted">Operaciones canceladas</dt>
                  <dd className="font-medium">{business.cancelledOrders}</dd>
                </div>
              ) : null}
              {closedShare ? (
                <div className="sm:col-span-2">
                  <dt className="text-muted">Cierres registrados</dt>
                  <dd className="font-medium">{closedShare}</dd>
                </div>
              ) : null}
              {business.disputeCount > 0 ? (
                <div>
                  <dt className="text-muted">Reclamos registrados</dt>
                  <dd className="font-medium">{business.disputeCount}</dd>
                </div>
              ) : null}
              {business.reviewCount > 0 && business.avgRating !== null ? (
                <div>
                  <dt className="text-muted">Calificación</dt>
                  <dd className="font-medium">
                    {business.avgRating.toLocaleString("es-AR", { maximumFractionDigits: 1 })} / 5 · {business.reviewCount}{" "}
                    {business.reviewCount === 1 ? "reseña" : "reseñas"}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {business ? (
            <p className="mt-3 text-sm text-muted">
              {business.completedOrders > 0 || business.reviewCount > 0
                ? "No hay tiempo de respuesta ni tasa de entrega: CONEX todavía no los registra."
                : "Sin datos suficientes para calificación, operaciones, tiempo de respuesta o entregas."}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">Cargando datos del proveedor…</p>
          )}
          {place ? <p className="mt-3 text-sm break-words text-muted">{place}</p> : <p className="mt-3 text-sm text-muted">Rosario</p>}
          {business?.phone ? <p className="mt-1 text-sm">Teléfono: {business.phone}</p> : null}
          {business?.coverageNote ? <p className="mt-2 text-sm">Zona declarada: {business.coverageNote}</p> : null}
          {business?.minOrderNote ? (
            <p className="mt-1 text-sm">Compra mínima declarada: {business.minOrderNote}. No se exige sola al consultar.</p>
          ) : null}
          {business && (business.sellsWholesale || business.sellsRetail) ? (
            <p className="mt-1 text-sm">
              {[business.sellsWholesale ? "Mayorista" : "", business.sellsRetail ? "Minorista" : ""].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <Link
            to="/negocio/$businessId"
            params={{ businessId: listing.businessId }}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-olive"
          >
            Ver proveedor
          </Link>
        </section>

        <aside className="grid min-w-0 content-start gap-3 lg:sticky lg:top-24 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:self-start">
          <section className="rounded-2xl border border-line bg-card p-4">
            <h2 className="text-lg font-semibold">Entrega</h2>
            <dl className="mt-3 grid gap-3 text-sm">
              {canPickup ? (
                <div>
                  <dt className="font-medium">Retiro en el negocio</dt>
                  <dd className="text-muted">Disponible</dd>
                </div>
              ) : null}
              {canDeliver ? (
                <div>
                  <dt className="font-medium">Entrega</dt>
                  <dd className="text-muted">
                    {listing.shippingCents === 0 ? "Envío sin cargo" : `Envío ${formatArs(listing.shippingCents)}`}
                  </dd>
                </div>
              ) : null}
              {listing.leadTimeHours !== null ? (
                <div>
                  <dt className="font-medium">Tiempo de preparación</dt>
                  <dd className="text-muted">{listing.leadTimeHours} horas</dd>
                </div>
              ) : null}
            </dl>
            {!canDeliver && !canPickup ? (
              <p className="mt-3 text-sm text-muted">Este producto no tiene entrega ni retiro publicados.</p>
            ) : null}
            {place ? <p className="mt-3 text-sm break-words text-muted">{place}</p> : null}
          </section>

          <section className="rounded-2xl border border-line bg-card p-4">
            <h2 className="text-lg font-semibold">Protección de la operación CONEX</h2>
            <p className="mt-2 text-sm text-muted">
              Conocé cómo funciona la protección de tus operaciones y qué hacer ante un inconveniente.
            </p>
            <p className="mt-2 text-sm text-muted">
              La consulta y, si aceptás la respuesta, la compra quedan registradas. El pago que entra en ese registro es el de Mercado Pago desde la compra. CONEX no retiene el dinero ni promete un reembolso automático.
            </p>
            <Link to="/proteccion" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
              Ver protección →
            </Link>
          </section>

          <form
            id="pedir-cotizacion"
            className="grid scroll-mt-28 gap-3 rounded-2xl border border-line bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (quoteBlocked || sending) return;
              if (!user) {
                void navigate({ to: "/login" });
                return;
              }
              setSending(true);
              void createQuoteRequest({
                data: { listingId: listing.id, quantity, notes, address, delivery },
              })
                .then(async () => {
                  toast.success("Tu consulta fue enviada al proveedor.");
                  await navigate({ to: "/cotizaciones" });
                })
                .catch((cause: unknown) => {
                  setSending(false);
                  toast.error(cause instanceof Error ? cause.message : "No pudimos enviar la consulta. Revisá tu conexión e intentá nuevamente.");
                });
            }}
          >
            <div>
              <h2 className="text-lg font-semibold">¿Qué querés consultar?</h2>
              <p className="mt-1 text-sm text-muted">El proveedor recibe tu mensaje. Si aceptás su respuesta, se arma una compra.</p>
            </div>
            <label className="grid gap-1 text-sm" htmlFor="conex-quote-quantity">
              Cantidad
              <span className="text-muted">Cuántas unidades querés.</span>
              <QuantityField
                id="conex-quote-quantity"
                name="quantity"
                value={quantity}
                min={1}
                max={Math.max(listing.stockUnits, 1)}
                disabled={!inStock || sending}
                onChange={setQuantity}
              />
            </label>
            {canDeliver && canPickup ? (
              <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="conex-quote-delivery">
                <input
                  id="conex-quote-delivery"
                  name="delivery"
                  type="checkbox"
                  checked={delivery}
                  onChange={(event) => setDelivery(event.target.checked)}
                />
                Quiero entrega
              </label>
            ) : null}
            {delivery && canDeliver ? (
              <label className="grid gap-1 text-sm" htmlFor="conex-quote-address">
                Dirección en Rosario
                <input
                  id="conex-quote-address"
                  name="address"
                  required
                  autoComplete="street-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="min-h-11 rounded-2xl border border-line bg-paper px-3"
                />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm" htmlFor="conex-quote-notes">
              Mensaje
              <span className="text-muted">Contale al proveedor qué necesitás saber.</span>
              <textarea
                id="conex-quote-notes"
                name="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-20 rounded-2xl border border-line bg-paper px-3 py-2"
              />
            </label>
            {quoteBlocked ? (
              <p className="text-sm text-muted">
                {!inStock ? "Sin stock: no se puede consultar este producto." : "Este producto no tiene entrega ni retiro, así que no se puede consultar."}
              </p>
            ) : null}
            {!user ? <p className="text-sm text-muted">Para enviarla tenés que entrar.</p> : null}
            <button
              type="submit"
              disabled={quoteBlocked || sending}
              className="min-h-11 rounded-full border border-ink px-4 text-sm font-semibold disabled:opacity-40"
            >
              {sending ? "Consultando…" : "Consultar producto"}
            </button>
          </form>
        </aside>
      </div>

      {others.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-semibold">Más productos de este proveedor</h2>
            <Link
              to="/negocio/$businessId"
              params={{ businessId: listing.businessId }}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-olive"
            >
              Ver todos
            </Link>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {others.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  to="/producto/$productId"
                  params={{ productId: item.id }}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="aspect-square w-full object-cover" />
                  ) : (
                    <span className="grid aspect-square place-items-center bg-paper text-sm text-muted">Sin foto</span>
                  )}
                  <span className="flex flex-1 flex-col gap-1 p-3">
                    <span className="line-clamp-2 text-sm font-semibold">{item.name}</span>
                    <span className="font-display text-lg font-semibold tabular-nums">{formatArs(item.priceCents)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {listing.siblings.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            {listing.standardProductName ? `Otras ofertas de ${listing.standardProductName}` : "Otras ofertas"}
          </h2>
          <ul className="mt-3 grid gap-2">
            {listing.siblings.map((sibling) => (
              <li key={sibling.id} className="min-w-0">
                <Link
                  to="/producto/$productId"
                  params={{ productId: sibling.id }}
                  className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm"
                >
                  <span className="font-semibold">{sibling.businessName}</span>
                  <span className="tabular-nums">
                    {formatArs(sibling.priceCents)} · stock {sibling.stockUnits}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form
        className="mt-10 max-w-xl rounded-2xl border border-line p-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!user) {
            void navigate({ to: "/login" });
            return;
          }
          const form = event.currentTarget;
          const reason = String(new FormData(form).get("reason") ?? "");
          const details = String(new FormData(form).get("details") ?? "");
          void submitReport({ data: { targetType: "listing", targetId: listing.id, reason, details } })
            .then(() => {
              toast.success("Reporte enviado. Un administrador lo revisa.");
              form.reset();
            })
            .catch((cause: unknown) => toast.error(cause instanceof Error ? cause.message : "No se envió."));
        }}
      >
        <h2 className="text-base font-semibold">Reportar este producto</h2>
        <p className="mt-1 text-sm text-muted">No se publica. Queda para que un administrador lo revise.</p>
        <label className="mt-3 grid gap-1 text-sm" htmlFor="conex-report-reason">
          Motivo
          <ConexSelect
            id="conex-report-reason"
            name="reason"
            required
            defaultValue="contenido"
            ariaLabel="Motivo"
            options={[
              { value: "contenido", label: "Contenido inadecuado" },
              { value: "engano", label: "Información engañosa" },
              { value: "otro", label: "Otro" },
            ]}
          />
        </label>
        <label className="mt-2 grid gap-1 text-sm" htmlFor="conex-report-details">
          Detalle
          <textarea
            id="conex-report-details"
            name="details"
            placeholder="Opcional"
            className="min-h-20 w-full rounded-2xl border border-line bg-paper px-3 py-2"
          />
        </label>
        <button type="submit" className="mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-semibold">
          {user ? "Enviar reporte" : "Entrá para reportar"}
        </button>
      </form>
    </Shell>
  );
}

function stockLabel(stock: number, unit: string): string {
  if (stock <= 0) return "Sin stock";
  if (unit === "unidad") return stock === 1 ? "En stock · 1 unidad" : `En stock · ${stock} unidades`;
  return `En stock · ${stock} ${unit}`;
}

function publishedCountLabel(count: number): string {
  return count === 1 ? "1 producto publicado" : `${count} productos publicados`;
}

function deliveryMode(delivery: boolean, pickup: boolean): string {
  if (delivery && pickup) return "Entrega y retiro.";
  if (delivery) return "Solo entrega.";
  if (pickup) return "Solo retiro.";
  return "Sin entrega ni retiro publicados.";
}

import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { LocationEditor } from "@/components/cerca/location-editor";
import { listQuoteInbox, submitQuote } from "@/lib/cerca/server/trade";
import { listPublicRequests, type PublicNeed } from "@/lib/cerca/server/public";
import { listMyListings } from "@/lib/cerca/server/listings";
import { parseArsToCents } from "@/lib/cerca/domain/money";
import { formatWhen, quoteStatusLabel, requestStatusLabel } from "@/lib/cerca/domain/labels";
import { createBusiness, getMyAccount, setBusinessPaymentMethods } from "@/lib/cerca/server/account";
import { PaymentMethodToggles } from "@/components/cerca/payment-methods";
import { SellerOnboarding } from "@/components/cerca/seller-onboarding";
import { ConexSelect } from "@/components/cerca/controls";
import { setBusinessCategories } from "@/lib/cerca/server/seller-categories";
import { SellerCategoryPicker } from "@/components/cerca/seller-category-picker";
import { disconnectSellerPayments, listSellerPaymentLinks, startSellerOAuth } from "@/lib/cerca/server/payments";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/panel/")({ component: PanelPage });

function PanelPage() {
  const { user, isPending } = useCurrentUserState();
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [inbox, setInbox] = useState<Awaited<ReturnType<typeof listQuoteInbox>>>([]);
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof listSellerPaymentLinks>> | null>(null);
  const [tradeName, setTradeName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [coverageNote, setCoverageNote] = useState("");
  const [minOrderNote, setMinOrderNote] = useState("");
  const [sellsWholesale, setSellsWholesale] = useState(false);
  const [sellsRetail, setSellsRetail] = useState(false);
  const [editIds, setEditIds] = useState<string[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [publishedCount, setPublishedCount] = useState<number | null>(null);
  const [needs, setNeeds] = useState<PublicNeed[] | null>(null);
  const [needQ, setNeedQ] = useState("");
  const [quoteBusinessId, setQuoteBusinessId] = useState("");
  const [acceptedMethods, setAcceptedMethods] = useState<string[]>([]);

  function reload() {
    void getMyAccount().then((next) => {
      setAccount(next);
      const id = businessId || next.businesses[0]?.id || "";
      if (!businessId && next.businesses[0]) setBusinessId(next.businesses[0].id);
      const current = next.businesses.find((item) => item.id === id);
      setAcceptedMethods(current?.paymentMethods ?? []);
    });
    void listQuoteInbox().then(setInbox).catch(() => setInbox([]));
    void listSellerPaymentLinks().then(setPayments).catch(() => setPayments(null));
    void listMyListings({ data: { status: "published" } })
      .then((rows) => setPublishedCount(rows.length))
      .catch(() => setPublishedCount(null));
    void listPublicRequests({ data: { q: needQ } })
      .then((result) => setNeeds(result.requests))
      .catch(() => setNeeds([]));
  }

  useEffect(() => {
    const current = account?.businesses.find((business) => business.id === businessId);
    setEditIds(current?.categoryIds ?? []);
  }, [account, businessId]);

  useEffect(() => {
    if (user) reload();
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Mi negocio</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {account && account.businesses.length === 0
              ? "Creá tu negocio para empezar a publicar productos."
              : "Tus productos, las consultas que te llegan y lo que otras personas están buscando."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {account?.sellerIntent?.declaresMinor ? (
            <p className="max-w-xs text-sm text-muted">Publicar está bloqueado: declaraste ser menor de edad.</p>
          ) : (
            <Link to="/panel/productos/$listingId" params={{ listingId: "nuevo" }} className="inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink">
              + Publicar producto
            </Link>
          )}
          <a href="#consultas" className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-semibold">
            Ver consultas
          </a>
          <a href="#solicitudes" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold">
            Ver solicitudes
          </a>
        </div>
      </div>
      {account && account.businesses.length > 1 ? (
        <label className="mb-4 grid max-w-md gap-1 text-sm">
          Negocio
          <ConexSelect
            value={businessId}
            onChange={(id) => {
              setBusinessId(id);
              const business = account.businesses.find((item) => item.id === id);
              setAcceptedMethods(business?.paymentMethods ?? []);
            }}
            ariaLabel="Negocio"
            options={account.businesses.map((business) => ({
              value: business.id,
              label: `${business.trade_name} · ${business.status === "active" ? "aprobado" : business.status === "pending_review" ? "en revisión" : business.status === "suspended" ? "suspendido" : business.status}`,
            }))}
          />
        </label>
      ) : null}
      {account && account.businesses.length === 1 ? (
        <p className="mb-4 text-sm">Negocio: <span className="font-semibold">{account.businesses[0]?.trade_name}</span></p>
      ) : null}
      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-card p-4">
          <dt className="text-sm text-muted">Productos publicados</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{publishedCount ?? "—"}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <dt className="text-sm text-muted">Consultas nuevas</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{inbox.filter((item) => !item.quote_id).length}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <dt className="text-sm text-muted">Respuestas enviadas</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{inbox.filter((item) => item.quote_status === "submitted").length}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <dt className="text-sm text-muted">Solicitudes disponibles</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{needs ? needs.length : "—"}</dd>
        </div>
      </dl>
      {account ? (
        <SellerOnboarding
          intent={account.sellerIntent}
          completedOrders={account.completedOrders}
          business={
            account.businesses.find((item) => item.id === (businessId || account.businesses[0]?.id)) ?? null
          }
          onSaved={reload}
        />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="grid gap-2 rounded-card border border-line bg-foam p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void createBusiness({
              data: { tradeName, legalName, phone, address, neighborhood, categoryIds, description, coverageNote, minOrderNote, sellsWholesale, sellsRetail },
            })
              .then((created) => {
                toast.success("Negocio enviado a revisión.");
                setBusinessId(created.id);
                reload();
              })
              .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se creó."));
          }}
        >
          <h2 className="text-2xl">{account && account.businesses.length > 0 ? "Crear otro negocio" : "Crear mi negocio"}</h2>
          {account && account.businesses.length === 0 ? (
            <p className="text-sm text-muted">Completá estos datos. El negocio se revisa antes de aparecer en la búsqueda.</p>
          ) : null}
          <label className="grid gap-1 text-sm">Nombre comercial
            <input required value={tradeName} onChange={(event) => setTradeName(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">Razón social
            <span className="text-muted">Si todavía no tenés, repetí el nombre comercial. No pedimos CUIT acá.</span>
            <input required value={legalName} onChange={(event) => setLegalName(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">Descripción
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20 rounded-2xl border border-line px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">Zona de cobertura
            <input value={coverageNote} onChange={(event) => setCoverageNote(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">Compra mínima, si la tenés
            <input value={minOrderNote} onChange={(event) => setMinOrderNote(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={sellsWholesale} onChange={(event) => setSellsWholesale(event.target.checked)} />
            Vendo mayorista
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={sellsRetail} onChange={(event) => setSellsRetail(event.target.checked)} />
            Vendo minorista
          </label>
          <label className="grid gap-1 text-sm">Teléfono
            <input required value={phone} onChange={(event) => setPhone(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">Dirección
            <input required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Av. Pellegrini 1234" className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">Barrio
            <input required value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <SellerCategoryPicker selected={categoryIds} onChange={setCategoryIds} />
          <button disabled={categoryIds.length === 0} className="min-h-11 rounded-full bg-ember text-ink disabled:opacity-40">
            {categoryIds.length === 0 ? "Elegí al menos una categoría" : "Crear mi negocio"}
          </button>
          <ul className="text-sm text-muted">
            {account?.businesses.map((business) => (
              <li key={business.id}>{business.trade_name} — {business.status === "active" ? "aprobado" : business.status === "pending_review" ? "en revisión" : business.status === "suspended" ? "suspendido" : business.status}</li>
            ))}
          </ul>
        </form>

        <LocationEditor businesses={account?.businesses ?? []} />
        {businessId ? (
          <section className="grid gap-3 rounded-card border border-line bg-foam p-4 lg:col-span-2">
            <SellerCategoryPicker
              selected={editIds}
              onChange={setEditIds}
              title="Categorías de este negocio"
              hint="Podés cambiarlas cuando quieras. No reemplazan la categoría de cada producto."
            />
            <button
              type="button"
              disabled={editIds.length === 0}
              className="min-h-11 rounded-full bg-ink px-4 text-paper disabled:opacity-40"
              onClick={() => {
                void setBusinessCategories({ data: { businessId, categoryIds: editIds } })
                  .then(() => {
                    toast.success("Categorías guardadas.");
                    reload();
                  })
                  .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardaron."));
              }}
            >
              Guardar categorías
            </button>
          </section>
        ) : null}
      </div>

      {businessId ? (
        <section className="mt-8 grid gap-3 rounded-card border border-line bg-foam p-4">
          <h2 className="text-2xl">Medios de pago que acepto</h2>
          <p className="text-sm text-muted">
            Elegí los medios de pago que aceptás para tus productos. El comprador podrá elegir uno de estos medios al realizar una operación.
          </p>
          <p className="text-sm text-muted">
            Los medios de pago disponibles dependen de cada proveedor. CONEX registra el medio elegido. La aceptación y disponibilidad del medio corresponden al proveedor. CONEX no verifica automáticamente que pueda cobrar con cada uno.
          </p>
          <PaymentMethodToggles selected={acceptedMethods} onChange={setAcceptedMethods} />
          <button
            type="button"
            className="min-h-11 w-fit rounded-full bg-ink px-4 text-sm font-semibold text-paper"
            onClick={() => {
              void setBusinessPaymentMethods({ data: { businessId, methods: acceptedMethods } })
                .then(() => {
                  toast.success("Medios de pago guardados. No se confirmó ningún cobro.");
                  reload();
                })
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardaron."));
            }}
          >
            Guardar medios de pago
          </button>
        </section>
      ) : null}

      <section className="mt-8 grid gap-3 rounded-card border border-line bg-foam p-4">
        <h2 className="text-2xl">Mercado Pago</h2>
        <p className="text-sm text-muted">
          Opcional. Sirve si querés cobrar una compra dentro de CONEX. No es obligatorio para publicar ni para responder consultas: el pago también se puede acordar con el comprador.
        </p>
        {payments?.missing.length ? (
          <p className="text-sm">No se puede conectar todavía. Falta: {payments.missing.join(", ")}.</p>
        ) : null}
        {payments?.warning ? <p className="text-sm text-muted">{payments.warning}</p> : null}
        <ul className="grid gap-2">
          {payments?.businesses.map((business) => (
            <li key={business.businessId} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2">
              <span>
                <span className="block font-medium">{business.tradeName}</span>
                <span className="text-sm text-muted">
                  {business.connected
                    ? `Conectado${business.liveMode === false ? " · modo de prueba" : ""}.`
                    : business.status === "refresh_failed"
                      ? "Hay que reconectar. El token no se pudo renovar."
                      : "Sin conectar."}
                </span>
              </span>
              {business.connected ? (
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-line px-4"
                  onClick={() => {
                    void disconnectSellerPayments({ data: business.businessId })
                      .then((result) => {
                        toast.success(result.message);
                        reload();
                      })
                      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se desconectó."));
                  }}
                >
                  Desconectar
                </button>
              ) : (
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-ink px-4 text-paper"
                  onClick={() => {
                    void startSellerOAuth({ data: business.businessId })
                      .then((result) => {
                        if (result.url) {
                          window.location.href = result.url;
                          return;
                        }
                        const missing = result.missing.length ? ` Falta: ${result.missing.join(", ")}.` : "";
                        toast.message(`${result.message}${missing}`);
                      })
                      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se abrió Mercado Pago."));
                  }}
                >
                  Conectar Mercado Pago
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="consultas" className="mt-8 grid scroll-mt-36 gap-3">
        <h2 className="text-2xl">Consultas recibidas</h2>
        <p className="text-sm text-muted">Alguien preguntó por uno de tus productos.</p>
        {inbox.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-4 text-sm">
            <p className="font-semibold">No tenés consultas.</p>
            <p className="mt-1 text-muted">Cuando un comprador pregunte por uno de tus productos, aparecerá acá.</p>
          </div>
        ) : null}
        {inbox.filter((request) => !request.quote_id).length > 0 ? <h3 className="text-lg font-semibold">Nuevas</h3> : null}
        {inbox.filter((request) => !request.quote_id).map((request) => (
          <QuoteReply key={request.id} request={request} onDone={reload} />
        ))}
        {inbox.filter((request) => request.quote_status === "submitted").length > 0 ? <h3 className="text-lg font-semibold">Respuestas enviadas</h3> : null}
        {inbox.filter((request) => request.quote_status === "submitted").map((request) => (
          <QuoteReply key={request.id} request={request} onDone={reload} />
        ))}
        {inbox.filter((request) => request.quote_status === "accepted").length > 0 ? <h3 className="text-lg font-semibold">Respuestas aceptadas</h3> : null}
        {inbox.filter((request) => request.quote_status === "accepted").map((request) => (
          <article key={request.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
            <p className="font-semibold">{request.title}</p>
            <p className="text-muted">Aceptada · cantidad {request.quantity}</p>
          </article>
        ))}
        {inbox.filter((request) => request.quote_id && request.quote_status !== "submitted" && request.quote_status !== "accepted").map((request) => (
          <QuoteReply key={request.id} request={request} onDone={reload} />
        ))}
      </section>

      <section id="solicitudes" className="mt-8 grid scroll-mt-36 gap-3">
        <h2 className="text-2xl">Solicitudes</h2>
        <p className="text-sm text-muted">Alguien publicó que necesita algo y todavía no lo encontró. No está ligado a uno de tus productos.</p>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void listPublicRequests({ data: { q: needQ } }).then((result) => setNeeds(result.requests)).catch(() => setNeeds([]));
          }}
        >
          <label className="grid min-w-0 flex-1 gap-1 text-sm">
            Buscar lo que necesitan
            <input value={needQ} onChange={(event) => setNeedQ(event.target.value)} className="min-h-11 rounded-full border border-line px-4" />
          </label>
          <button className="min-h-11 self-end rounded-full border border-ink px-4 text-sm font-semibold">Filtrar</button>
        </form>
        {needs && needs.length === 0 ? <p className="text-sm text-muted">No hay solicitudes abiertas. Cuando alguien publique lo que necesita, va a aparecer acá.</p> : null}
        {needs?.map((need) => (
          <NeedReply
            key={need.id}
            need={need}
            businesses={(account?.businesses ?? []).filter((business) => business.status === "active" && !demoFlag(business.is_demo))}
            businessId={quoteBusinessId || businessId}
            onBusiness={setQuoteBusinessId}
            onDone={reload}
          />
        ))}
      </section>
    </Shell>
  );
}

function QuoteReply({
  request,
  onDone,
}: {
  request: Awaited<ReturnType<typeof listQuoteInbox>>[number];
  onDone: () => void;
}) {
  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState("0");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <form
      className="grid gap-2 rounded-card border border-line bg-foam p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const unitPriceCents = parseArsToCents(price);
        const shippingCents = parseArsToCents(shipping) ?? (shipping === "0" ? 0 : null);
        if (!unitPriceCents || shippingCents === null || !/^\d+$/.test(hours)) {
          toast.error("Revisá el precio, el envío y las horas.");
          return;
        }
        void submitQuote({
          data: {
            requestId: request.id,
            businessId: request.business_id,
            unitPriceCents,
            quantity: request.quantity,
            shippingCents,
            leadTimeHours: Number(hours),
            notes,
          },
        })
          .then(() => {
            toast.success("Tu respuesta fue enviada al comprador.");
            onDone();
          })
          .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se envió."));
      }}
    >
      <h3 className="text-xl">{request.title}</h3>
      <p className="text-sm text-muted">
        Cantidad pedida: {request.quantity}. {request.delivery_required ? "Prefiere entrega." : "Prefiere retiro."} {request.notes}
        {request.quote_status ? ` · ${quoteStatusLabel(request.quote_status)}` : ""}
      </p>
      <label className="grid gap-1 text-sm">
        Precio unitario
        <span className="text-muted">Precio en pesos por cada unidad. 125000 es $ 125.000.</span>
        <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="125000" className="min-h-11 rounded-2xl border border-line px-3" />
      </label>
      <label className="grid gap-1 text-sm">
        Envío
        <span className="text-muted">Costo de envío en pesos. Si no se cobra, escribí 0. No es un pago dentro de CONEX.</span>
        <input value={shipping} onChange={(event) => setShipping(event.target.value)} placeholder="0" className="min-h-11 rounded-2xl border border-line px-3" />
      </label>
      <label className="grid gap-1 text-sm">
        Tiempo estimado
        <span className="text-muted">Horas hasta tener el pedido listo.</span>
        <input type="number" min={0} value={hours} onChange={(event) => setHours(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
      </label>
      <label className="grid gap-1 text-sm">
        Mensaje al comprador
        <span className="text-muted">Condiciones, disponibilidad o cómo se acuerda el pago. Mercado Pago no es obligatorio.</span>
        <input value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
      </label>
      <button className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper">
        {request.quote_id ? "Actualizar respuesta" : "Enviar respuesta"}
      </button>
    </form>
  );
}

function demoFlag(value: boolean | string | number | undefined): boolean {
  return value === true || value === "t" || value === 1;
}

function NeedReply({
  need,
  businesses,
  businessId,
  onBusiness,
  onDone,
}: {
  need: PublicNeed;
  businesses: Array<{ id: string; trade_name: string }>;
  businessId: string;
  onBusiness: (id: string) => void;
  onDone: () => void;
}) {
  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const selected = businesses.some((business) => business.id === businessId) ? businessId : businesses[0]?.id ?? "";
  return (
    <article className="grid gap-3 rounded-2xl border border-line bg-card p-4">
      <div>
        <h3 className="text-xl font-semibold">{need.title}</h3>
        <p className="mt-1 text-sm text-muted">
          Cantidad: {need.quantity}
          {need.categoryName ? ` · ${need.categoryName}` : ""}
          {` · ${need.city}`}
          {need.delivery ? " · prefiere entrega" : " · prefiere retiro"}
          {` · ${requestStatusLabel(need.status)}`}
          {formatWhen(need.createdAt) ? ` · ${formatWhen(need.createdAt)}` : ""}
        </p>
        {need.notes.trim() ? <p className="mt-2 text-sm">{need.notes}</p> : null}
        <Link to="/solicitud/$requestId" params={{ requestId: need.id }} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
          Ver pedido
        </Link>
      </div>
      {businesses.length === 0 ? (
        <p className="text-sm text-muted">Para responder necesitás un negocio aprobado. Uno en revisión todavía no puede responder.</p>
      ) : (
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const unitPriceCents = parseArsToCents(price);
            const shippingCents = shipping.trim() === "" ? 0 : parseArsToCents(shipping) ?? (shipping === "0" ? 0 : null);
            if (!selected || !unitPriceCents || shippingCents === null || !/^\d+$/.test(hours)) {
              toast.error("Completá negocio, precio, envío y horas.");
              return;
            }
            void submitQuote({
              data: {
                requestId: need.id,
                businessId: selected,
                unitPriceCents,
                quantity: need.quantity,
                shippingCents,
                leadTimeHours: Number(hours),
                notes,
              },
            })
              .then(() => {
                toast.success("Tu respuesta fue enviada. Esta solicitud no arma una compra automática porque no hay un producto publicado del cual reservar stock.");
                onDone();
              })
              .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se envió."));
          }}
        >
          {businesses.length > 1 ? (
            <label className="grid gap-1 text-sm">
              Responder con
              <ConexSelect
                value={selected}
                onChange={onBusiness}
                ariaLabel="Responder con"
                options={businesses.map((business) => ({ value: business.id, label: business.trade_name }))}
              />
            </label>
          ) : (
            <p className="text-sm">Esta respuesta sale de {businesses[0]?.trade_name}.</p>
          )}
          <label className="grid gap-1 text-sm">
            Precio unitario
            <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="125000" className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            Envío
            <span className="text-muted">0 si no cobrás envío.</span>
            <input value={shipping} onChange={(event) => setShipping(event.target.value)} placeholder="0" className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            Tiempo estimado en horas
            <input type="number" min={0} value={hours} onChange={(event) => setHours(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            Mensaje al comprador
            <input value={notes} onChange={(event) => setNotes(event.target.value)} className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <button className="min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink">Enviar propuesta</button>
        </form>
      )}
    </article>
  );
}

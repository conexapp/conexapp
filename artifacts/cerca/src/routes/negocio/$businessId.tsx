import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { ConexSelect } from "@/components/cerca/controls";
import { MarketMap } from "@/components/cerca/market-map";
import { businessInitials, memberSinceLabel } from "@/lib/cerca/domain/labels";
import { completionShare, publicStandingLabel } from "@/lib/cerca/domain/seller-profile";
import { formatArs } from "@/lib/cerca/domain/money";
import { getBusiness } from "@/lib/cerca/server/public";
import { getMyAccount } from "@/lib/cerca/server/account";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/negocio/$businessId")({ component: BusinessPage });

function BusinessPage() {
  const { businessId } = Route.useParams();
  const { user } = useCurrentUserState();
  const [business, setBusiness] = useState<Awaited<ReturnType<typeof getBusiness>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [owns, setOwns] = useState(false);
  const [catalogQ, setCatalogQ] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    void getBusiness({ data: businessId })
      .then((next) => {
        setBusiness(next);
        document.title = `${next.tradeName} — CONEX`;
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se encontró."))
      .finally(() => setLoading(false));
  }, [businessId]);

  useEffect(() => {
    if (!user || !business) return;
    void getMyAccount()
      .then((account) => setOwns(account.businesses.some((item) => item.id === business.id)))
      .catch(() => setOwns(false));
  }, [user, business]);

  const catalogCategories = [...new Set((business?.listings ?? []).map((item) => item.categoryName).filter((name): name is string => Boolean(name)))];
  const visibleListings = (business?.listings ?? []).filter((item) => {
    const text = catalogQ.trim().toLocaleLowerCase("es");
    const matchesText = !text || `${item.name} ${item.brand}`.toLocaleLowerCase("es").includes(text);
    const matchesCategory = !catalogCategory || item.categoryName === catalogCategory;
    return matchesText && matchesCategory;
  });
  const since = business ? memberSinceLabel(business.createdAt) : null;
  const standing = business ? publicStandingLabel(business.completedOrders) : null;
  const closedShare = business ? completionShare(business.completedOrders, business.cancelledOrders) : null;
  const place = business
    ? business.approximate
      ? [business.neighborhood, business.city, business.province, "ubicación aproximada"].filter((part) => part && part.trim()).join(" · ")
      : [business.addressLine, business.neighborhood, business.city, business.province].filter((part) => part && part.trim()).join(" · ")
    : "";

  return (
    <Shell>
      {loading ? <p className="text-sm text-muted">Cargando el negocio…</p> : null}
      {error ? <p className="rounded-2xl bg-card p-4 text-sm">{error}</p> : null}
      {business ? (
        <div className="grid gap-6">
          <header className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
            <div className="min-w-0 rounded-2xl border border-line bg-card p-4 shadow-card">
              <div className="flex min-w-0 items-start gap-3">
                <span aria-hidden="true" className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-teal/15 font-display text-xl font-semibold text-olive">
                  {businessInitials(business.tradeName)}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-olive uppercase">Proveedor</p>
                  <h1 className="mt-1 text-3xl font-semibold break-words sm:text-4xl">{business.tradeName}</h1>
                  <p className="mt-2 text-sm font-medium">{standing?.label}</p>
                  {standing ? <p className="mt-1 text-sm text-muted">{standing.detail}</p> : null}
                  <p className="mt-1 text-sm text-muted">{business.city}, {business.province}</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm text-muted">{business.description || "Este negocio todavía no escribió una descripción."}</p>
              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted">Productos publicados</dt>
                  <dd className="font-medium">{business.listings.length === 1 ? "1 producto publicado" : `${business.listings.length} productos publicados`}</dd>
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
                      {business.avgRating.toLocaleString("es-AR", { maximumFractionDigits: 1 })} / 5 · {business.reviewCount}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-3 text-sm text-muted">
                {business.completedOrders > 0 || business.reviewCount > 0
                  ? "No hay tiempo de respuesta ni tasa de entrega: CONEX todavía no los registra."
                  : "Sin datos suficientes para calificación, operaciones, tiempo de respuesta o entregas."}
              </p>
              {place ? <p className="mt-3 text-sm break-words">{place}</p> : null}
              {business.isDemo ? <p className="mt-1 text-sm text-muted">Ejemplo de desarrollo</p> : null}
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {business.offersPickup ? <span className="rounded-full bg-paper px-3 py-1">Retiro en el negocio</span> : null}
                {business.offersDelivery ? <span className="rounded-full bg-paper px-3 py-1">Entrega</span> : null}
                {business.mercadoPago ? <span className="rounded-full bg-paper px-3 py-1">Mercado Pago conectado</span> : null}
              </div>
              {catalogCategories.length > 0 ? (
                <p className="mt-3 text-sm text-muted">Categorías: {catalogCategories.join(" · ")}</p>
              ) : null}
              {business.phone ? <p className="mt-3 text-sm">Teléfono: {business.phone}</p> : null}
              {business.coverageNote ? <p className="mt-2 text-sm">Zona declarada: {business.coverageNote}</p> : null}
              {business.minOrderNote ? <p className="mt-1 text-sm">Compra mínima declarada: {business.minOrderNote}. No se exige sola al consultar.</p> : null}
              {business.sellsWholesale || business.sellsRetail ? (
                <p className="mt-1 text-sm">{[business.sellsWholesale ? "Mayorista" : "", business.sellsRetail ? "Minorista" : ""].filter(Boolean).join(" · ")}</p>
              ) : null}
              <p className="mt-3 text-sm text-muted">Para consultar un producto, abrilo y enviá tu mensaje.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#catalogo" className="inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink">
                  Ver productos
                </a>
                {owns ? (
                  <Link to="/panel" className="inline-flex min-h-11 items-center text-sm font-semibold text-olive">
                    Editar mi negocio
                  </Link>
                ) : null}
              </div>
            </div>
            {business.lat !== null && business.lng !== null ? (
              <MarketMap
                points={[{ id: business.id, lat: business.lat, lng: business.lng, label: business.tradeName, place: business.neighborhood }]}
                selectedId={null}
                onSelect={() => undefined}
              />
            ) : (
              <p className="rounded-2xl bg-card p-4 text-sm text-muted">Este negocio todavía no publicó su ubicación.</p>
            )}
          </header>
          <section id="catalogo" className="scroll-mt-36">
            <h2 className="text-2xl font-semibold">Productos de {business.tradeName}</h2>
            <p className="mt-1 text-sm text-muted">Para consultar uno, abrilo y enviá tu mensaje.</p>
            {business.listings.length === 0 ? (
              <div className="mt-3 rounded-2xl bg-card p-5 shadow-card">
                <p className="font-semibold">Este negocio todavía no publicó productos.</p>
                {owns ? (
                  <Link to="/panel/productos/$listingId" params={{ listingId: "nuevo" }} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
                    Publicar producto
                  </Link>
                ) : null}
              </div>
            ) : (
              <>
                <form className="mt-4 grid gap-2 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
                  <label className="grid gap-1 text-sm">
                    Buscar en este negocio
                    <input value={catalogQ} onChange={(event) => setCatalogQ(event.target.value)} placeholder="Nombre o marca" className="min-h-11 rounded-full border border-line bg-card px-4" />
                  </label>
                  {catalogCategories.length > 1 ? (
                    <label className="grid gap-1 text-sm">
                      Categoría del catálogo
                      <ConexSelect
                        value={catalogCategory}
                        onChange={setCatalogCategory}
                        ariaLabel="Categoría del catálogo"
                        placeholder="Todas"
                        options={[{ value: "", label: "Todas" }, ...catalogCategories.map((name) => ({ value: name, label: name }))]}
                      />
                    </label>
                  ) : null}
                </form>
                {visibleListings.length === 0 ? (
                  <p className="mt-4 text-sm text-muted">Ningún producto de este proveedor coincide con esa búsqueda.</p>
                ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {visibleListings.map((listing) => (
                  <article key={listing.id} className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
                    <Link to="/producto/$productId" params={{ productId: listing.id }} className="block aspect-square bg-paper">
                      {listing.imageUrl ? (
                        <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="grid h-full place-items-center text-sm text-muted">Sin foto</span>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold">{listing.name}</h3>
                      <p className="font-display text-xl font-semibold tabular-nums">{formatArs(listing.priceCents)} <span className="text-xs font-medium text-muted">/ {listing.unit}</span></p>
                      <p className="text-xs text-muted">{listing.stockUnits > 0 ? `Stock ${listing.stockUnits}` : "Sin stock"}{listing.categoryName ? ` · ${listing.categoryName}` : ""}</p>
                      <Link
                        to="/producto/$productId"
                        params={{ productId: listing.id }}
                        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-ember text-sm font-semibold text-ink"
                      >
                        Ver producto
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
                )}
              </>
            )}
          </section>
        </div>
      ) : null}
    </Shell>
  );
}

import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Search, SlidersHorizontal, Store, Truck } from "lucide-react";
import { Shell } from "@/components/cerca/shell";
import { AllCategoriesGlyph, CategoryCard, CategoryGlyph, browseCategories, categoryIcon } from "@/components/cerca/category-visual";
import { getBusiness, getPlatformStatus, listMapBusinesses, listPublicBusinesses, listPublicRequests, searchMarketplace, type DirectoryBusiness, type ListingHit, type PublicNeed, type SearchResult } from "@/lib/cerca/server/public";
import { formatWhen, requestStatusLabel } from "@/lib/cerca/domain/labels";
import { MarketMap, validMapPoint, type MapPoint } from "@/components/cerca/market-map";
import { ConexSelect } from "@/components/cerca/controls";
import { formatArs, parseArsToCents } from "@/lib/cerca/domain/money";
import { loadDevelopmentSeed } from "@/lib/cerca/server/account";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

type HomeSearch = { q?: string; categoria?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    q: typeof search.q === "string" && search.q.length > 0 ? search.q.slice(0, 80) : undefined,
    categoria:
      typeof search.categoria === "string" && search.categoria.length > 0
        ? search.categoria.slice(0, 80)
        : undefined,
  }),
  component: Home,
});

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [q, setQ] = useState(search.q ?? "");
  const [category, setCategory] = useState(search.categoria ?? "");
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "distance">("price_asc");
  const [delivery, setDelivery] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [directory, setDirectory] = useState<DirectoryBusiness[]>([]);
  const [needs, setNeeds] = useState<PublicNeed[]>([]);
  const [demoAllowed, setDemoAllowed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [mapDraft, setMapDraft] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [mapCategory, setMapCategory] = useState("");
  const [onlyWithProducts, setOnlyWithProducts] = useState(false);
  const [mapRows, setMapRows] = useState<Awaited<ReturnType<typeof listMapBusinesses>>>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapSelected, setMapSelected] = useState<string | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);
  const [spots, setSpots] = useState<Record<string, { lat: number; lng: number } | null>>({});
  const [loading, setLoading] = useState(true);

  async function execute(nextQ: string, nextCategory: string) {
    setLoading(true);
    const filtered = Boolean(nextQ || nextCategory);
    try {
      const [data, businesses, openNeeds] = await Promise.all([
        searchMarketplace({
          data: {
            q: nextQ,
            category: nextCategory,
            sort,
            delivery,
            pickup,
            inStock: true,
            maxPriceCents: maxPrice ? parseArsToCents(maxPrice) : null,
            maxDistanceKm: maxKm ? Number(maxKm) : null,
          },
        }),
        filtered ? listPublicBusinesses({ data: { q: nextQ, category: nextCategory } }) : Promise.resolve([]),
        filtered ? listPublicRequests({ data: { q: nextQ, category: nextCategory } }).then((payload) => payload.requests) : Promise.resolve([]),
      ]);
      setResult(data);
      setDirectory(businesses);
      setNeeds(openNeeds);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo buscar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void getPlatformStatus().then((status) => setDemoAllowed(status.demoSeedAllowed));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setMapLoading(true);
    void listMapBusinesses({ data: { q: mapQuery, category: mapCategory, onlyWithProducts } })
      .then((rows) => {
        if (!cancelled) setMapRows(rows);
      })
      .catch(() => {
        if (!cancelled) setMapRows([]);
      })
      .finally(() => {
        if (!cancelled) setMapLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mapQuery, mapCategory, onlyWithProducts]);

  useEffect(() => {
    const nextQ = search.q ?? "";
    const nextCategory = search.categoria ?? "";
    setQ(nextQ);
    setCategory(nextCategory);
    void execute(nextQ, nextCategory);
    // Los filtros locales se aplican con el botón. La URL solo cambia texto y categoría.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.q, search.categoria]);

  const suppliers = useMemo(() => {
    const seen = new Map<
      string,
      {
        id: string;
        name: string;
        neighborhood: string | null;
        distanceKm: number | null;
        verified: boolean;
        count: number;
        lat: number | null;
        lng: number | null;
        categories: string[];
      }
    >();
    for (const listing of result?.listings ?? []) {
      const current = seen.get(listing.businessId);
      if (!current) {
        seen.set(listing.businessId, {
          id: listing.businessId,
          name: listing.businessName,
          neighborhood: listing.neighborhood,
          distanceKm: listing.distanceKm,
          verified: listing.verified,
          count: 1,
          lat: listing.lat,
          lng: listing.lng,
          categories: [listing.categoryName],
        });
      } else {
        current.count += 1;
        if (!current.categories.includes(listing.categoryName)) current.categories.push(listing.categoryName);
        if (current.lat === null && listing.lat !== null) current.lat = listing.lat;
        if (current.lng === null && listing.lng !== null) current.lng = listing.lng;
      }
    }
    return [...seen.values()];
  }, [result]);

  const points = useMemo<MapPoint[]>(() => {
    const next: MapPoint[] = [];
    for (const supplier of suppliers) {
      const override = Object.prototype.hasOwnProperty.call(spots, supplier.id) ? spots[supplier.id] : undefined;
      const spot = override === undefined ? validMapPoint(supplier.lat, supplier.lng) : override;
      if (!spot) continue;
      next.push({
        id: supplier.id,
        lat: spot.lat,
        lng: spot.lng,
        label: supplier.name,
        place: supplier.neighborhood?.trim() ? supplier.neighborhood.trim() : null,
        distanceKm: supplier.distanceKm,
        categories: supplier.categories,
      });
    }
    return next;
  }, [suppliers, spots]);

  useEffect(() => {
    setSpots({});
    setPlaceLabel(null);
  }, [result]);

  useEffect(() => {
    if (selected && !suppliers.some((supplier) => supplier.id === selected)) {
      setSelected(null);
      setPlaceLabel(null);
    }
  }, [selected, suppliers]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    void getBusiness({ data: selected })
      .then((business) => {
        if (cancelled) return;
        const spot = validMapPoint(business.lat, business.lng);
        setSpots((current) => ({ ...current, [selected]: spot }));
        const parts = [business.addressLine, business.neighborhood, business.city]
          .map((part) => (typeof part === "string" ? part.trim() : ""))
          .filter((part) => part.length > 0);
        setPlaceLabel(parts.length > 0 ? parts.join(" · ") : null);
        if (!spot) setSelected(null);
      })
      .catch(() => {
        if (!cancelled) setPlaceLabel(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, result]);

  const listings = result?.listings ?? [];
  const activeCategoryName = result?.categories.find((item) => item.slug === category)?.name;

  return (
    <Shell>
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-olive">CONEX · Rosario</p>
        <h1 className="mt-2 text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
          Todo lo que necesitás, cerca tuyo.
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted md:text-lg">
          Buscá productos, proveedores o lo que necesitás.
        </p>
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({
              to: "/",
              search: { q: q.trim() || undefined, categoria: category || undefined },
              hash: "productos",
            });
          }}
        >
          <label className="grid gap-2" htmlFor="conex-home-search">
            <span className="text-sm font-semibold">¿Qué estás buscando?</span>
            <span className="flex min-h-14 items-center gap-3 rounded-full border border-line bg-card px-4 shadow-card focus-within:border-teal sm:min-h-16 sm:px-5">
              <Search className="size-5 shrink-0 text-teal" aria-hidden />
              <input
                id="conex-home-search"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Buscar productos, proveedores o servicios"
                className="min-w-0 flex-1 bg-transparent text-base outline-none"
              />
            </span>
          </label>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button type="submit" className="min-h-12 rounded-full bg-ember px-5 text-sm font-semibold text-ink">
              Buscar
            </button>
            <Link
              to="/solicitudes"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-ink bg-card px-5 text-sm font-semibold"
            >
              Publicar lo que necesito
            </Link>
            <Link
              to="/panel"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-paper"
            >
              Tengo un negocio
            </Link>
          </div>
        </form>
        <Link
          to="/"
          hash="mapa"
          search={{ q: q.trim() || undefined, categoria: category || undefined }}
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-olive"
        >
          Ver proveedores en el mapa
        </Link>
      </section>

      <section className="mt-14" aria-labelledby="categorias-titulo">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="categorias-titulo" className="text-2xl font-semibold">Explorá por categoría</h2>
            <p className="mt-1 text-sm text-muted">Elegí una categoría para ver productos y proveedores.</p>
          </div>
          <Link to="/categorias" className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-olive">
            Ver todas
          </Link>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-line bg-card lg:max-w-md">
          <li className="border-b border-line">
            <button
              type="button"
              aria-pressed={!category}
              onClick={() => {
                void navigate({
                  to: "/",
                  search: { q: q.trim() || undefined, categoria: undefined },
                  hash: "productos",
                });
              }}
              className={`flex min-h-11 w-full items-center gap-3 border-l-2 px-3 py-2 text-left text-sm leading-snug font-semibold whitespace-normal transition hover:bg-paper ${!category ? "border-teal bg-teal/10" : "border-transparent"}`}
            >
              <span className={!category ? "text-teal" : "text-ink"}>
                <AllCategoriesGlyph />
              </span>
              <span className="min-w-0 flex-1">Todas las categorías</span>
            </button>
          </li>
          {browseCategories(result?.categories ?? []).map((item) => (
            <li key={item.id} className="border-b border-line last:border-b-0">
              <CategoryCard
                slug={item.slug}
                name={item.name}
                icon={item.icon}
                active={category === item.slug}
                onSelect={() => {
                  const next = category === item.slug ? undefined : item.slug;
                  void navigate({
                    to: "/",
                    search: { q: q.trim() || undefined, categoria: next },
                    hash: "productos",
                  });
                }}
              />
            </li>
          ))}
        </ul>
      </section>

      <section id="mapa" className="mt-14 scroll-mt-36">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Encontrá proveedores cerca tuyo</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            El mapa muestra Rosario. Los negocios aprobados con ubicación aparecen acá.
          </p>
        </div>
        <MarketMap
          tall
          popup
          points={mapRows.map((row) => ({
            id: row.id,
            lat: row.lat,
            lng: row.lng,
            label: row.name,
            place: row.place,
            categories: row.category ? [row.category] : [],
            productCount: row.products,
          }))}
          selectedId={mapSelected}
          onSelect={setMapSelected}
          emptyNote={
            mapLoading
              ? "Cargando proveedores…"
              : "Todavía no hay proveedores ubicados en esta zona."
          }
        />
        <form
          className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            setMapQuery(mapDraft.trim());
          }}
        >
          <input
            value={mapDraft}
            onChange={(event) => setMapDraft(event.target.value)}
            placeholder="Buscar un negocio en el mapa"
            aria-label="Buscar un negocio en el mapa"
            className="min-h-11 rounded-full border border-line bg-card px-4 text-sm"
          />
          <ConexSelect
            value={mapCategory}
            onChange={setMapCategory}
            ariaLabel="Categoría del mapa"
            placeholder="Todas las categorías"
            options={[
              { value: "", label: "Todas las categorías", icon: <AllCategoriesGlyph /> },
              ...(result?.categories ?? [])
                .filter((item) => !item.parentId)
                .map((item) => ({
                  value: item.slug,
                  label: item.name,
                  icon: <CategoryGlyph slug={item.slug} icon={item.icon} />,
                })),
            ]}
          />
          <button className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper">Buscar en el mapa</button>
        </form>
        <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyWithProducts} onChange={(event) => setOnlyWithProducts(event.target.checked)} />
          Solo negocios con productos publicados
        </label>
      </section>

      <section id="productos" className="mt-14 scroll-mt-36">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">{search.q || category ? "Productos" : "Productos que podés encontrar"}</h2>
            <p className="mt-1 text-sm text-muted">
              {activeCategoryName ? activeCategoryName : "De proveedores de Rosario"}
              {search.q ? ` · “${search.q}”` : ""}
            </p>
          </div>
          {search.categoria ? (
            <button
              type="button"
              className="cx-chip"
              onClick={() => void navigate({ to: "/", search: { q: search.q }, hash: "productos" })}
            >
              {activeCategoryName ?? "Categoría"}
              <span aria-hidden="true">×</span>
              <span className="sr-only">Quitar categoría</span>
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtros
          </button>
        </div>
        {filtersOpen ? (
          <form
            className="mb-4 grid gap-2 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-6"
            onSubmit={(event) => {
              event.preventDefault();
              void navigate({
                to: "/",
                search: { q: q.trim() || undefined, categoria: category || undefined },
                hash: "productos",
              });
              void execute(q.trim(), category);
            }}
          >
            <ConexSelect
              value={category}
              onChange={setCategory}
              ariaLabel="Categoría"
              placeholder="Todas las categorías"
              options={[
                { value: "", label: "Todas las categorías", icon: <AllCategoriesGlyph /> },
                ...(result?.categories ?? []).map((item) => {
                  const parent = item.parentId ? result?.categories.find((candidate) => candidate.id === item.parentId) : undefined;
                  return {
                    value: item.slug,
                    label: item.name,
                    icon: <CategoryGlyph slug={item.slug} icon={item.icon} parentIcon={parent?.icon} />,
                  };
                }),
              ]}
            />
            <ConexSelect
              value={sort}
              onChange={(next) => setSort(next as typeof sort)}
              ariaLabel="Orden"
              options={[
                { value: "price_asc", label: "Menor precio" },
                { value: "price_desc", label: "Mayor precio" },
                { value: "distance", label: "Más cerca del centro" },
              ]}
            />
            <input
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Precio máximo"
              aria-label="Precio máximo"
              className="min-h-11 rounded-full border border-line bg-paper px-3 text-sm"
            />
            <input
              value={maxKm}
              onChange={(event) => setMaxKm(event.target.value)}
              placeholder="Km máx."
              aria-label="Distancia máxima"
              className="min-h-11 rounded-full border border-line bg-paper px-3 text-sm"
            />
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm">
              <input type="checkbox" checked={delivery} onChange={(event) => setDelivery(event.target.checked)} />
              Entrega
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm">
              <input type="checkbox" checked={pickup} onChange={(event) => setPickup(event.target.checked)} />
              Retiro
            </label>
            <button type="submit" className="min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper sm:col-span-2 lg:col-span-1">
              Aplicar
            </button>
          </form>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        ) : null}

        {!loading && listings.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card px-5 py-8">
            <p className="font-display text-2xl font-semibold">
              {search.q || category
                ? directory.length > 0
                  ? "Encontramos proveedores que pueden ayudarte."
                  : "No encontramos exactamente lo que buscás."
                : "Todavía no hay productos para mostrar."}
            </p>
            <p className="mt-2 max-w-xl text-sm text-muted">
              {search.q || category
                ? directory.length > 0
                  ? "No hay un producto con ese nombre, pero estos negocios pueden responderte."
                  : "¿No encontraste lo que buscabas? Publicá lo que necesitás y dejá que los proveedores te respondan."
                : "Cuando los proveedores publiquen sus productos, van a aparecer acá."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {search.q || category ? (
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold"
                  onClick={() => {
                    setQ("");
                    setCategory("");
                    void navigate({ to: "/", search: {}, hash: "productos" });
                  }}
                >
                  Limpiar búsqueda
                </button>
              ) : null}
              <Link to="/solicitudes" className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
                Publicar lo que necesito
              </Link>
            </div>
            {demoAllowed && user ? (
              <button
                type="button"
                className="mt-4 text-sm text-muted underline-offset-2 hover:underline"
                onClick={() => {
                  void loadDevelopmentSeed()
                    .then(() => {
                      toast.success("Ejemplos guardados como desarrollo. No aparecen en la búsqueda pública.");
                      return execute(q, category);
                    })
                    .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se pudo cargar."));
                }}
              >
                Cargar ejemplos de desarrollo
              </button>
            ) : null}
          </div>
        ) : null}

        {!loading && listings.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : null}
      </section>

      {(result?.comparisons.length ?? 0) > 0 ? (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Mismo producto, varios proveedores</h2>
          <p className="mt-1 text-sm text-muted">Solo se agrupan si cada proveedor usó la misma ancla de catálogo.</p>
          <div className="mt-4 grid gap-3">
            {result?.comparisons.map((group) => (
              <article key={group.standardProductId} className="rounded-2xl border border-line bg-card p-4">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {listings
                    .filter((listing) => group.listingIds.includes(listing.id))
                    .map((listing) => (
                      <Link
                        key={listing.id}
                        to="/producto/$productId"
                        params={{ productId: listing.id }}
                        className="w-56 shrink-0 rounded-2xl bg-paper p-3"
                      >
                        <p className="text-sm font-semibold">{listing.businessName}</p>
                        <p className="mt-2 font-display text-2xl tabular-nums">{formatArs(listing.priceCents)}</p>
                        <p className="text-xs text-muted">/ {listing.unit}</p>
                      </Link>
                    ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && (search.q || category) ? (
        <section id="proveedores" className="mt-14 scroll-mt-36">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Proveedores</h2>
              <p className="mt-1 text-sm text-muted">Negocios de Rosario relacionados con esta búsqueda.</p>
            </div>
            <Link to="/proveedores" search={{ q: search.q, categoria: category || undefined }} className="text-sm font-semibold text-olive">
              Ver directorio
            </Link>
          </div>
          {directory.length === 0 ? (
            <p className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">No hay proveedores para esta búsqueda.</p>
          ) : (
            <div className="grid gap-3">
              {directory.map((business) => (
                <article key={business.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{business.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {business.place}
                      {business.verified ? " · negocio aprobado" : ""}
                      {` · ${business.products} ${business.products === 1 ? "producto" : "productos"}`}
                    </p>
                  </div>
                  <Link to="/negocio/$businessId" params={{ businessId: business.id }} className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-semibold">
                    Ver proveedor
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {!loading && (search.q || category) && needs.length > 0 ? (
        <section id="solicitudes-resultado" className="mt-14 scroll-mt-36">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Lo que otros están buscando</h2>
              <p className="mt-1 text-sm text-muted">Pedidos públicos, sin nombre ni contacto.</p>
            </div>
            <Link to="/solicitudes" search={{ q: search.q, categoria: category || undefined }} className="text-sm font-semibold text-olive">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-3">
            {needs.map((need) => (
              <article key={need.id} className="rounded-2xl border border-line bg-card p-4">
                <p className="font-semibold">{need.title}</p>
                <p className="mt-1 text-sm text-muted">
                  Cantidad: {need.quantity}
                  {need.categoryName ? ` · ${need.categoryName}` : ""}
                  {` · ${need.city}`}
                  {` · ${requestStatusLabel(need.status)}`}
                  {formatWhen(need.createdAt) ? ` · ${formatWhen(need.createdAt)}` : ""}
                </p>
                <Link to="/solicitud/$requestId" params={{ requestId: need.id }} className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
                  Ver pedido
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !(search.q || category) && suppliers.length > 0 ? (
        <section id="proveedores" className="mt-14 scroll-mt-36">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Proveedores con productos</h2>
            <p className="mt-1 text-sm text-muted">Negocios que ya publicaron algo.</p>
          </div>
          <div className="grid gap-3">
            {suppliers.map((supplier) => {
              const located = points.some((point) => point.id === supplier.id);
              const active = selected === supplier.id;
              return (
                <article
                  key={supplier.id}
                  className={`flex flex-col gap-2 rounded-2xl border bg-card p-4 ${active ? "border-teal" : "border-line"}`}
                >
                  <button
                    type="button"
                    disabled={!located}
                    onClick={() => setSelected(supplier.id)}
                    className="flex items-start gap-3 text-left disabled:cursor-default"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-olive">
                      <Store className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold">{supplier.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {supplier.neighborhood ? supplier.neighborhood : null}
                        {supplier.neighborhood && supplier.distanceKm !== null ? " · " : ""}
                        {supplier.distanceKm !== null ? `${supplier.distanceKm} km` : ""}
                        {!located ? `${supplier.neighborhood || supplier.distanceKm !== null ? " · " : ""}sin ubicación en el mapa` : ""}
                      </span>
                      <span className="mt-1 block text-sm">
                        {supplier.count} {supplier.count === 1 ? "producto" : "productos"}
                        {supplier.verified ? " · negocio aprobado" : ""}
                      </span>
                    </span>
                  </button>
                  <Link
                    to="/negocio/$businessId"
                    params={{ businessId: supplier.id }}
                    className="inline-flex min-h-11 items-center self-start rounded-full bg-paper px-4 text-sm font-semibold"
                  >
                    Ver proveedor
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-14 overflow-hidden rounded-3xl bg-ink text-paper">
        <div className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <h2 className="text-2xl font-semibold">¿Tenés un negocio?</h2>
            <p className="mt-2 max-w-xl text-sm text-paper/80">
              Publicá tus productos y conectá con compradores de Rosario. El negocio se revisa antes de aparecer en el mapa y en la búsqueda.
            </p>
          </div>
          <Link to="/panel" className="inline-flex min-h-12 items-center justify-center rounded-full bg-sun px-5 text-sm font-semibold text-ink">
            Crear mi negocio
          </Link>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="confianza-titulo">
        <h2 id="confianza-titulo" className="text-2xl font-semibold">Por qué CONEX</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-2xl border border-line bg-card p-5">
            <BadgeCheck className="size-5 text-teal" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold">Negocios revisados</h3>
            <p className="mt-2 text-sm text-muted">Un negocio nuevo queda en revisión hasta que se aprueba. Recién entonces puede publicar y aparecer.</p>
          </article>
          <article className="rounded-2xl border border-line bg-card p-5">
            <Truck className="size-5 text-teal" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold">Consultá y comprá</h3>
            <p className="mt-2 text-sm text-muted">Consultás un producto o publicás lo que necesitás. Si aceptás una respuesta sobre un producto, se arma una compra con ese proveedor.</p>
            <Link to="/solicitudes" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
              Publicar lo que necesito
            </Link>
          </article>
          <article className="rounded-2xl border border-line bg-card p-5">
            <Store className="size-5 text-teal" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold">Protección</h3>
            <p className="mt-2 text-sm text-muted">Si algo no corresponde, se puede reportar. La protección sigue lo que quedó registrado en la compra.</p>
            <Link to="/proteccion" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
              Cómo te protege
            </Link>
          </article>
        </div>
      </section>
    </Shell>
  );
}

function ProductCard({ listing }: { listing: ListingHit }) {
  const Icon = categoryIcon(listing.categorySlug);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition hover:-translate-y-0.5">
      <Link
        to="/producto/$productId"
        params={{ productId: listing.id }}
        aria-label={`Ver ${listing.name}`}
        className="relative block aspect-square bg-paper"
      >
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-olive">
            <Icon className="size-10" aria-hidden />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs leading-snug text-muted">{listing.brand || listing.categoryName}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
          <Link to="/producto/$productId" params={{ productId: listing.id }}>
            {listing.name}
          </Link>
        </h3>
        <p className="mt-1 font-display text-lg leading-none font-semibold tabular-nums">{formatArs(listing.priceCents)}</p>
        <p className="text-xs text-muted">/ {listing.unit}{listing.stockUnits > 0 ? ` · stock ${listing.stockUnits}` : ""}</p>
        <p className="mt-1 truncate text-sm">{listing.businessName}</p>
        <p className="truncate text-xs text-muted">
          {listing.neighborhood ?? "Rosario"}
          {listing.distanceKm !== null ? ` · ${listing.distanceKm} km` : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {listing.delivery ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sun px-2 py-1 text-xs font-medium text-ink">
              <Truck className="size-3" aria-hidden />
              Entrega
            </span>
          ) : null}
          {listing.pickup ? (
            <span className="rounded-full bg-paper px-2 py-1 text-xs font-medium">Retiro</span>
          ) : null}
          {listing.verified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-1 text-xs font-medium text-olive">
              <BadgeCheck className="size-3" aria-hidden />
              Negocio aprobado
            </span>
          ) : null}
        </div>
        <Link
          to="/producto/$productId"
          params={{ productId: listing.id }}
          className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full border border-line text-sm font-semibold"
        >
          Ver producto
        </Link>
      </div>
    </article>
  );
}

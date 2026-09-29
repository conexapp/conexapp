import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ClipboardList, Search, ShoppingBag, Store } from "lucide-react";
import { Shell } from "@/components/cerca/shell";
import { AllCategoriesGlyph, CategoryGlyph, categoryRowClass } from "@/components/cerca/category-visual";
import { categoryChildren, categoryMatchesQuery, categoryRoots } from "@/lib/cerca/domain/category-tree";
import { formatArs } from "@/lib/cerca/domain/money";
import {
  listPublicBusinesses,
  listPublicRequests,
  searchMarketplace,
  type DirectoryBusiness,
  type ListingHit,
  type PublicNeed,
  type SearchResult,
} from "@/lib/cerca/server/public";

type Category = SearchResult["categories"][number];
type CategorySearch = { categoria?: string };

export const Route = createFileRoute("/categorias")({
  validateSearch: (search: Record<string, unknown>): CategorySearch => ({
    categoria:
      typeof search.categoria === "string" && search.categoria.length > 0
        ? search.categoria.slice(0, 80)
        : undefined,
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const search = Route.useSearch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ListingHit[] | null>(null);
  const [providers, setProviders] = useState<DirectoryBusiness[] | null>(null);
  const [needs, setNeeds] = useState<PublicNeed[] | null>(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);

  function loadTree() {
    setReady(false);
    setLoadError("");
    void searchMarketplace({ data: {} })
      .then((result) => {
        setCategories(result.categories);
        setLoadError("");
      })
      .catch((error: unknown) => {
        setCategories([]);
        setLoadError(error instanceof Error ? error.message : "No se pudieron cargar las categorías.");
      })
      .finally(() => setReady(true));
  }

  useEffect(() => {
    loadTree();
  }, []);

  const selected = search.categoria ? categories.find((category) => category.slug === search.categoria) ?? null : null;
  const missing = ready && !loadError && Boolean(search.categoria) && !selected;
  const parent = selected?.parentId ? categories.find((category) => category.id === selected.parentId) ?? null : null;
  const children = selected ? categoryChildren(categories, selected.id) : [];
  const roots = categoryRoots(categories);
  const featured = roots.filter((category) => category.featured);
  const others = roots.filter((category) => !category.featured);
  const needle = query.trim();
  const matches = needle
    ? categories.filter((category) => categoryMatchesQuery(category, needle))
    : [];

  useEffect(() => {
    if (!selected) {
      setProducts(null);
      setProviders(null);
      setNeeds(null);
      setDetailError("");
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError("");
    setProducts(null);
    setProviders(null);
    setNeeds(null);
    void Promise.all([
      searchMarketplace({ data: { category: selected.slug, inStock: true } }),
      listPublicBusinesses({ data: { category: selected.slug } }),
      listPublicRequests({ data: { category: selected.slug } }),
    ])
      .then(([market, businesses, requests]) => {
        if (cancelled) return;
        setProducts(market.listings);
        setProviders(businesses);
        setNeeds(requests.requests);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setDetailError(error instanceof Error ? error.message : "No se pudo leer esta categoría.");
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    setQuery("");
  }, [search.categoria]);

  return (
    <Shell>
      <div className="w-full lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="mb-4 hidden min-w-0 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
          <h2 className="mb-2 text-sm font-semibold">Categorías</h2>
          <CategoryList>
            <li className="border-b border-line">
              <Link
                to="/categorias"
                search={{ categoria: undefined }}
                aria-current={!selected ? "page" : undefined}
                className={categoryRowClass(!selected)}
              >
                <span className={!selected ? "text-teal" : "text-ink"}>
                  <AllCategoriesGlyph />
                </span>
                <span className="min-w-0 flex-1 font-semibold">Todas las categorías</span>
              </Link>
            </li>
            {roots.map((category) => {
              const active = selected?.id === category.id || parent?.id === category.id;
              return (
                <CategoryRow
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                  active={active}
                  to="/categorias"
                  search={{ categoria: category.slug }}
                />
              );
            })}
          </CategoryList>
        </aside>
        <div className="min-w-0">
        {!selected || needle ? (
          <>
            <p className="text-sm font-semibold text-olive">CONEX</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Categorías</h1>
            <p className="mt-2 max-w-xl text-sm text-muted md:text-base">
              Explorá productos y proveedores por categoría.
            </p>
          </>
        ) : null}
        <CategorySearch query={query} onChange={setQuery} />
        {!ready ? <CategorySkeleton /> : null}
        {ready && loadError ? <LoadError message={loadError} onRetry={loadTree} /> : null}
        {missing && !needle ? (
          <EmptyNote title="No encontramos esa categoría." body="Probá con otro término o volvé al listado." />
        ) : null}
        {ready && !loadError && needle ? (
          matches.length > 0 ? (
            <section className="mt-4" aria-labelledby="resultado-categorias">
              <h2 id="resultado-categorias" className="mb-2 text-sm font-semibold text-muted">
                Categorías y subcategorías
              </h2>
              <CategoryList>
                {matches.map((category) => {
                  const owner = category.parentId ? categories.find((item) => item.id === category.parentId) : null;
                  return (
                    <CategoryRow
                      key={category.id}
                      name={category.name}
                      hint={owner ? owner.name : "Categoría"}
                      slug={category.slug}
                      icon={category.icon}
                      parentIcon={owner?.icon}
                      to="/categorias"
                      search={{ categoria: category.slug }}
                    />
                  );
                })}
              </CategoryList>
            </section>
          ) : (
            <EmptyNote title="No encontramos esa categoría." body="Probá con otro término." />
          )
        ) : null}
        {ready && !loadError && !needle && selected ? (
          <CategoryExplorer
            category={selected}
            parent={parent}
            children={children}
            products={products}
            providers={providers}
            needs={needs}
            loading={detailLoading}
            error={detailError}
          />
        ) : null}
        {ready && !loadError && !needle && !selected && !missing && roots.length === 0 ? (
          <EmptyNote title="Todavía no hay categorías activas." body="Cuando se publiquen en el catálogo, van a aparecer acá." />
        ) : null}
        {ready && !loadError && !needle && !selected && featured.length > 0 ? (
          <section className="mt-5 lg:hidden" aria-labelledby="todas-categorias">
            <h2 id="todas-categorias" className="mb-2 text-sm font-semibold">
              Todas las categorías
            </h2>
            <CategoryList>
              {featured.map((category) => (
                <CategoryRow
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                  to="/categorias"
                  search={{ categoria: category.slug }}
                />
              ))}
            </CategoryList>
          </section>
        ) : null}
        {ready && !loadError && !needle && !selected && others.length > 0 ? (
          <section className="mt-6 lg:hidden" aria-labelledby="otras-categorias">
            <h2 id="otras-categorias" className="mb-2 text-sm font-semibold">
              Otras categorías
            </h2>
            <CategoryList>
              {others.map((category) => (
                <CategoryRow
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                  icon={category.icon}
                  to="/categorias"
                  search={{ categoria: category.slug }}
                />
              ))}
            </CategoryList>
          </section>
        ) : null}
        </div>
      </div>
    </Shell>
  );
}

function CategoryExplorer({
  category,
  parent,
  children,
  products,
  providers,
  needs,
  loading,
  error,
}: {
  category: Category;
  parent: Category | null;
  children: Category[];
  products: ListingHit[] | null;
  providers: DirectoryBusiness[] | null;
  needs: PublicNeed[] | null;
  loading: boolean;
  error: string;
}) {
  const back = parent
    ? { label: parent.name, search: { categoria: parent.slug } }
    : { label: "Todas las categorías", search: { categoria: undefined } };
  const parentIcon = parent?.icon ?? category.icon;

  return (
    <div>
      <nav aria-label="Migas" className="mb-3 hidden flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted md:flex">
        <Link to="/categorias" search={{ categoria: undefined }} className="inline-flex min-h-11 items-center hover:text-ink">
          Categorías
        </Link>
        {parent ? (
          <>
            <span aria-hidden="true">/</span>
            <Link
              to="/categorias"
              search={{ categoria: parent.slug }}
              className="inline-flex min-h-11 items-center hover:text-ink"
            >
              {parent.name}
            </Link>
          </>
        ) : null}
        <span aria-hidden="true">/</span>
        <span className="font-medium text-ink" aria-current="page">
          {category.name}
        </span>
      </nav>
      <Link
        to="/categorias"
        search={back.search}
        className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-olive md:hidden"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {back.label}
      </Link>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">{category.name}</h1>
      <p className="mt-2 text-sm text-muted md:text-base">
        {children.length > 0 ? "Elegí una subcategoría." : "Esta categoría no tiene subcategorías. Podés ver sus productos o sus proveedores."}
      </p>

      {children.length > 0 ? (
        <section className="mt-4" aria-labelledby="subcategorias">
          <h2 id="subcategorias" className="sr-only">
            Subcategorías
          </h2>
          <CategoryList>
            {children.map((child) => (
              <CategoryRow
                key={child.id}
                name={child.name}
                slug={child.slug}
                icon={child.icon}
                parentIcon={parentIcon}
                to="/categorias"
                search={{ categoria: child.slug }}
              />
            ))}
          </CategoryList>
        </section>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <ActionLink
          to="/"
          search={{ categoria: category.slug, q: undefined }}
          hash="productos"
          icon={<ShoppingBag className="size-5" aria-hidden />}
          label="Ver productos de esta categoría"
        />
        <ActionLink
          to="/proveedores"
          search={{ categoria: category.slug, q: undefined }}
          icon={<Store className="size-5" aria-hidden />}
          label="Ver proveedores de esta categoría"
        />
        <ActionLink
          to="/solicitudes"
          search={{ categoria: category.slug, q: undefined }}
          icon={<ClipboardList className="size-5" aria-hidden />}
          label="Ver solicitudes de esta categoría"
        />
      </div>

      {loading ? <p className="mt-4 text-sm text-muted">Buscando productos de esta categoría…</p> : null}
      {error ? <p className="mt-4 rounded-2xl border border-line bg-card p-4 text-sm">{error}</p> : null}

      {!loading && !error && products && products.length === 0 ? (
        <EmptyNote
          title="Todavía no hay productos en esta categoría."
          body="Explorá otras categorías o buscá directamente lo que necesitás."
        />
      ) : null}
      {!loading && !error && providers && providers.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-line bg-card px-4 py-3 text-sm">
          Todavía no hay proveedores publicados en esta categoría.
        </p>
      ) : null}

      {!loading && products && products.length > 0 ? (
        <section className="mt-5" aria-labelledby="productos-categoria">
          <h2 id="productos-categoria" className="text-lg font-semibold">
            Productos publicados
          </h2>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-card">
            {products.slice(0, 4).map((listing) => (
              <li key={listing.id} className="border-b border-line last:border-b-0">
                <Link
                  to="/producto/$productId"
                  params={{ productId: listing.id }}
                  className="flex min-h-16 items-center gap-3 px-3 py-3 outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-inset"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{listing.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {formatArs(listing.priceCents)} · {listing.businessName}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!loading && providers && providers.length > 0 ? (
        <section className="mt-5" aria-labelledby="proveedores-categoria">
          <h2 id="proveedores-categoria" className="text-lg font-semibold">
            Proveedores publicados
          </h2>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-card">
            {providers.slice(0, 4).map((business) => (
              <li key={business.id} className="border-b border-line last:border-b-0">
                <Link
                  to="/negocio/$businessId"
                  params={{ businessId: business.id }}
                  className="flex min-h-16 items-center gap-3 px-3 py-3 outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-inset"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{business.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">{business.place}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!loading && needs && needs.length > 0 ? (
        <section className="mt-5" aria-labelledby="solicitudes-categoria">
          <h2 id="solicitudes-categoria" className="text-lg font-semibold">
            Solicitudes abiertas
          </h2>
          <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-card">
            {needs.slice(0, 3).map((need) => (
              <li key={need.id} className="border-b border-line last:border-b-0">
                <Link
                  to="/solicitud/$requestId"
                  params={{ requestId: need.id }}
                  className="flex min-h-16 items-center gap-3 px-3 py-3 outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-inset"
                >
                  <span className="min-w-0 flex-1 font-semibold">{need.title}</span>
                  <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function CategorySearch({ query, onChange }: { query: string; onChange: (value: string) => void }) {
  return (
    <form className="mt-4" role="search" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="conex-category-search" className="flex min-h-14 items-center gap-3 rounded-full border border-line bg-card px-4 shadow-card focus-within:border-teal">
        <Search className="size-5 shrink-0 text-teal" aria-hidden />
        <span className="sr-only">Buscar una categoría</span>
        <input
          id="conex-category-search"
          name="categoria"
          type="search"
          value={query}
          autoComplete="off"
          placeholder="Buscar una categoría"
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base outline-none"
        />
      </label>
    </form>
  );
}

function CategoryList({ children }: { children: ReactNode }) {
  return <ul className="overflow-hidden rounded-2xl border border-line bg-card">{children}</ul>;
}

function CategoryRow({
  name,
  hint,
  slug,
  icon,
  parentIcon,
  active = false,
  to,
  search,
}: {
  name: string;
  hint?: string;
  slug: string;
  icon?: string | null;
  parentIcon?: string | null;
  active?: boolean;
  to: "/categorias";
  search: { categoria: string };
}) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        to={to}
        search={search}
        aria-current={active ? "page" : undefined}
        aria-label={hint ? `${name}, ${hint}` : name}
        className={categoryRowClass(active)}
      >
        <span className={active ? "text-teal" : "text-ink"}>
          <CategoryGlyph slug={slug} icon={icon} parentIcon={parentIcon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block leading-snug">{name}</span>
          {hint ? <span className="mt-0.5 block text-sm font-normal text-muted">{hint}</span> : null}
        </span>
        <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
      </Link>
    </li>
  );
}

function ActionLink({
  to,
  search,
  hash,
  icon,
  label,
}: {
  to: "/" | "/proveedores" | "/solicitudes";
  search: { categoria: string; q: undefined };
  hash?: "productos";
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      hash={hash}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-card px-3 py-3 text-sm font-semibold outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal active:bg-teal/10"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sun text-ink">{icon}</span>
      <span className="min-w-0 flex-1 leading-snug">{label}</span>
      <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
    </Link>
  );
}

function CategorySkeleton() {
  return (
    <ul className="mt-5 overflow-hidden rounded-2xl border border-line bg-card" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <li key={index} className="h-16 animate-pulse border-b border-line bg-paper/60 last:border-b-0" />
      ))}
    </ul>
  );
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-5 rounded-2xl border border-line bg-card p-4">
      <p className="font-semibold">No se pudieron cargar las categorías.</p>
      <p className="mt-1 text-sm text-muted">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
        Reintentar
      </button>
    </div>
  );
}

function EmptyNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-line bg-card px-4 py-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      <Link to="/" search={{ q: undefined, categoria: undefined }} hash="productos" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive">
        Buscar en CONEX
      </Link>
    </div>
  );
}

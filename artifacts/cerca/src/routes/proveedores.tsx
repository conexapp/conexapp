import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Store } from "lucide-react";
import { AllCategoriesGlyph, CategoryGlyph } from "@/components/cerca/category-visual";
import { Shell } from "@/components/cerca/shell";
import { ConexSelect } from "@/components/cerca/controls";
import { listPublicBusinesses, searchMarketplace, type DirectoryBusiness, type PublicCategory } from "@/lib/cerca/server/public";

type ProvidersSearch = { q?: string; categoria?: string };

export const Route = createFileRoute("/proveedores")({
  validateSearch: (search: Record<string, unknown>): ProvidersSearch => ({
    q: typeof search.q === "string" && search.q.length > 0 ? search.q.slice(0, 80) : undefined,
    categoria: typeof search.categoria === "string" && search.categoria.length > 0 ? search.categoria.slice(0, 80) : undefined,
  }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [category, setCategory] = useState(search.categoria ?? "");
  const [rows, setRows] = useState<DirectoryBusiness[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    setQ(search.q ?? "");
    setCategory(search.categoria ?? "");
    setLoadError("");
    void listPublicBusinesses({ data: { q: search.q ?? "", category: search.categoria ?? "" } })
      .then(setRows)
      .catch((error: unknown) => {
        setRows([]);
        setLoadError(error instanceof Error ? error.message : "No se pudieron cargar los proveedores.");
      });
  }, [search.q, search.categoria]);

  useEffect(() => {
    void searchMarketplace({ data: {} })
      .then((result) =>
        setCategories(
          result.categories.map((item) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            parentId: item.parentId,
            icon: item.icon,
          })),
        ),
      )
      .catch(() => setCategories([]));
  }, []);

  return (
    <Shell>
      <p className="text-sm font-semibold text-olive">Proveedores · Rosario</p>
      <h1 className="mt-1 text-4xl font-semibold">Encontrá proveedores</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Negocios de Rosario. Si un negocio está en revisión o suspendido, no aparece acá.
      </p>
      <form
        className="mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          void navigate({
            to: "/proveedores",
            search: { q: q.trim() || undefined, categoria: category || undefined },
          });
        }}
      >
        <label className="grid gap-1 text-sm">
          Buscar proveedor
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Ej.: ferretería, taladro"
            className="min-h-11 rounded-full border border-line bg-card px-4"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Categoría
          <ConexSelect
            value={category}
            onChange={setCategory}
            ariaLabel="Categoría"
            placeholder="Todas"
            options={[
              { value: "", label: "Todas", icon: <AllCategoriesGlyph /> },
              ...categories
                .filter((item) => !item.parentId)
                .map((item) => ({
                  value: item.slug,
                  label: item.name,
                  icon: <CategoryGlyph slug={item.slug} icon={item.icon} />,
                })),
            ]}
          />
        </label>
        <button className="min-h-11 self-end rounded-full bg-ink px-4 text-sm font-semibold text-paper">Buscar proveedores</button>
      </form>

      {loadError ? <p className="mt-4 text-sm" role="alert">{loadError}</p> : null}
      {rows === null ? <p className="mt-6 text-sm text-muted">Cargando proveedores…</p> : null}
      {rows && rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line bg-card p-5">
          <p className="font-display text-2xl font-semibold">Todavía no hay proveedores para mostrar.</p>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Cuando un negocio se aprueba, aparece en este directorio. Si vendés en Rosario, podés crear el tuyo.
          </p>
          <Link to="/panel" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
            Crear mi negocio
          </Link>
        </div>
      ) : null}
      {rows && rows.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {rows.map((business) => (
            <article key={business.id} className="grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-teal/10 text-olive">
                <Store className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">{business.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {business.verified ? (
                    <span className="inline-flex items-center gap-1 font-medium text-olive">
                      <BadgeCheck className="size-4" aria-hidden /> Negocio aprobado
                    </span>
                  ) : (
                    "Sin marca de aprobación administrativa"
                  )}
                  {business.categories.length > 0 ? ` · ${business.categories.join(" · ")}` : ""}
                </p>
                <p className="mt-1 text-sm">{business.place}</p>
                {business.description.trim() ? <p className="mt-2 line-clamp-2 text-sm text-muted">{business.description}</p> : null}
                <p className="mt-2 text-sm">
                  {business.products} {business.products === 1 ? "producto publicado" : "productos publicados"}
                </p>
              </div>
              <Link
                to="/negocio/$businessId"
                params={{ businessId: business.id }}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ember px-4 text-sm font-semibold text-ink"
              >
                Ver proveedor
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}

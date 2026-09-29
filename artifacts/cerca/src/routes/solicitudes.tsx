import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AllCategoriesGlyph, CategoryGlyph } from "@/components/cerca/category-visual";
import { Shell } from "@/components/cerca/shell";
import { ConexSelect } from "@/components/cerca/controls";
import { createBuyerNeed } from "@/lib/cerca/server/trade";
import { listPublicRequests, type PublicCategory, type PublicNeed } from "@/lib/cerca/server/public";
import { formatWhen, requestStatusLabel } from "@/lib/cerca/domain/labels";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

type NeedsSearch = { q?: string; categoria?: string };

export const Route = createFileRoute("/solicitudes")({
  validateSearch: (search: Record<string, unknown>): NeedsSearch => ({
    q: typeof search.q === "string" && search.q.length > 0 ? search.q.slice(0, 80) : undefined,
    categoria: typeof search.categoria === "string" && search.categoria.length > 0 ? search.categoria.slice(0, 80) : undefined,
  }),
  component: NeedsPage,
});

function NeedsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const [q, setQ] = useState(search.q ?? "");
  const [filterCategory, setFilterCategory] = useState(search.categoria ?? "");
  const [requests, setRequests] = useState<PublicNeed[] | null>(null);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [delivery, setDelivery] = useState(true);
  const [error, setError] = useState("");

  function load(nextQ: string, nextCategory: string) {
    void listPublicRequests({ data: { q: nextQ, category: nextCategory } })
      .then((result) => {
        setRequests(result.requests);
        setCategories(result.categories);
      })
      .catch(() => setRequests([]));
  }

  useEffect(() => {
    setQ(search.q ?? "");
    setFilterCategory(search.categoria ?? "");
    load(search.q ?? "", search.categoria ?? "");
  }, [search.q, search.categoria]);

  function publish(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!user) {
      void navigate({ to: "/login" });
      return;
    }
    const amount = Number(quantity);
    if (!title.trim()) {
      setError("Escribí qué necesitás conseguir.");
      return;
    }
    if (!Number.isInteger(amount) || amount < 1) {
      setError("Indicá cuántas unidades necesitás.");
      return;
    }
    if (!categoryId) {
      setError("Elegí una categoría para que los proveedores puedan encontrarla.");
      return;
    }
    void createBuyerNeed({
      data: { title: title.trim(), notes, quantity: amount, categoryId, delivery },
    })
      .then(async (created) => {
        toast.success("Tu solicitud fue publicada. Los proveedores podrán responder.");
        setTitle("");
        setQuantity("");
        setNotes("");
        await navigate({ to: "/solicitud/$requestId", params: { requestId: created.id } });
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se publicó."));
  }

  const roots = categories.filter((item) => !item.parentId);
  const leaves = categories.filter((item) => item.parentId);

  return (
    <Shell>
      <p className="text-sm font-semibold text-olive">Rosario</p>
      <h1 className="mt-1 text-4xl font-semibold">Publicar lo que necesito</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        ¿No encontraste lo que buscabas? Publicá lo que necesitás y dejá que los proveedores te respondan. No se muestra tu nombre, teléfono ni dirección.
      </p>

      <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-card p-4 md:p-5" onSubmit={publish}>
        <label className="grid gap-1 text-sm" htmlFor="conex-need-title">
          <span className="font-semibold">¿Qué necesitás?</span>
          <span id="conex-need-title-hint" className="text-muted">Ejemplo: necesito 50 remeras personalizadas.</span>
          <input
            id="conex-need-title"
            required
            maxLength={140}
            value={title}
            aria-describedby="conex-need-title-hint"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Necesito 50 remeras personalizadas"
            className="min-h-11 rounded-2xl border border-line bg-paper px-3"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm" htmlFor="conex-need-qty">
            <span className="font-semibold">Cantidad</span>
            <span id="conex-need-qty-hint" className="text-muted">Indicá cuántas unidades necesitás.</span>
            <input
              id="conex-need-qty"
              required
              inputMode="numeric"
              min={1}
              value={quantity}
              aria-describedby="conex-need-qty-hint"
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="50"
              className="min-h-11 rounded-2xl border border-line bg-paper px-3"
            />
          </label>
          <label className="grid gap-1 text-sm" htmlFor="conex-need-category">
            <span className="font-semibold">Categoría</span>
            <span id="conex-need-category-hint" className="text-muted">Elegí dónde se encuentra lo que buscás.</span>
            <ConexSelect
              id="conex-need-category"
              value={categoryId}
              describedBy="conex-need-category-hint"
              required
              placeholder="Elegí una categoría"
              onChange={setCategoryId}
              options={roots.flatMap((root) => {
                const children = leaves.filter((item) => item.parentId === root.id);
                const rootOption = {
                  value: root.id,
                  label: root.name,
                  icon: <CategoryGlyph slug={root.slug} icon={root.icon} />,
                };
                if (children.length === 0) return [rootOption];
                return [
                  { ...rootOption, group: root.name },
                  ...children.map((child) => ({
                    value: child.id,
                    label: child.name,
                    group: root.name,
                    icon: <CategoryGlyph slug={child.slug} icon={child.icon} parentIcon={root.icon} />,
                  })),
                ];
              })}
            />
          </label>
        </div>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold">Zona</legend>
          <p id="conex-need-mode-hint" className="text-sm text-muted">La zona es Rosario. Marcá si preferís que te lo envíen.</p>
          <label className="flex min-h-11 items-center gap-2 text-sm" htmlFor="conex-need-delivery">
            <input id="conex-need-delivery" type="checkbox" checked={delivery} aria-describedby="conex-need-mode-hint" onChange={(event) => setDelivery(event.target.checked)} />
            Prefiero entrega en Rosario
          </label>
          {!delivery ? <p className="text-sm text-muted">Si no marcás entrega, los proveedores entienden que preferís retirar.</p> : null}
        </fieldset>
        <label className="grid gap-1 text-sm" htmlFor="conex-need-notes">
          <span className="font-semibold">Detalles <span className="font-normal text-muted">(opcional)</span></span>
          <span id="conex-need-notes-hint" className="text-muted">Contale al proveedor qué necesitás. No escribas teléfono ni dirección: esta nota es pública.</span>
          <textarea
            id="conex-need-notes"
            maxLength={1000}
            value={notes}
            aria-describedby="conex-need-notes-hint"
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-24 rounded-2xl border border-line bg-paper px-3 py-2"
          />
        </label>
        <p className="text-sm text-muted">Queda visible 14 días. No hace falta dejar teléfono ni dirección.</p>
        {error ? <p role="alert" className="text-sm font-medium">{error}</p> : null}
        <button className="min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink">
          {user ? "Publicar lo que necesito" : "Entrá para publicar"}
        </button>
      </form>

      <section className="mt-10" aria-labelledby="solicitudes-lista">
        <h2 id="solicitudes-lista" className="text-2xl font-semibold">Lo que otros están buscando</h2>
        <form
          className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({
              to: "/solicitudes",
              search: { q: q.trim() || undefined, categoria: filterCategory || undefined },
            });
          }}
        >
          <label className="grid gap-1 text-sm">
            Buscar
            <input value={q} onChange={(event) => setQ(event.target.value)} className="min-h-11 rounded-full border border-line bg-card px-4" />
          </label>
          <label className="grid gap-1 text-sm">
            Categoría
            <ConexSelect
              value={filterCategory}
              onChange={setFilterCategory}
              ariaLabel="Categoría"
              placeholder="Todas"
              options={[
                { value: "", label: "Todas", icon: <AllCategoriesGlyph /> },
                ...categories.map((item) => {
                  const parent = item.parentId ? categories.find((candidate) => candidate.id === item.parentId) : undefined;
                  return {
                    value: item.slug,
                    label: item.name,
                    icon: <CategoryGlyph slug={item.slug} icon={item.icon} parentIcon={parent?.icon} />,
                  };
                }),
              ]}
            />
          </label>
          <button className="min-h-11 self-end rounded-full border border-ink px-4 text-sm font-semibold">Filtrar</button>
        </form>
        {requests === null ? <p className="mt-4 text-sm text-muted">Cargando…</p> : null}
        {requests && requests.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-card p-5">
            <p className="font-semibold">Todavía no hay pedidos publicados.</p>
            <p className="mt-2 text-sm text-muted">Cuando alguien publique lo que necesita, va a aparecer en esta lista.</p>
          </div>
        ) : null}
        <div className="mt-4 grid gap-3">
          {requests?.map((request) => (
            <article key={request.id} className="rounded-2xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl font-semibold">{request.title}</h3>
                <span className="text-sm text-muted">{requestStatusLabel(request.status)}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                Cantidad: {request.quantity}
                {request.categoryName ? ` · ${request.categoryName}` : ""}
                {` · ${request.city}`}
                {request.delivery ? " · prefiere entrega" : " · prefiere retiro"}
              </p>
              {request.notes.trim() ? <p className="mt-2 line-clamp-3 text-sm">{request.notes}</p> : null}
              <p className="mt-2 text-xs text-muted">{formatWhen(request.createdAt)}</p>
              <Link
                to="/solicitud/$requestId"
                params={{ requestId: request.id }}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive"
              >
                Ver pedido
              </Link>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}

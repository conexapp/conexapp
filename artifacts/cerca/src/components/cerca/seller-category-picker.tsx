import { useEffect, useId, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { CategoryGlyph, categoryRowClass } from "@/components/cerca/category-visual";
import {
  childrenOf,
  featuredTaxa,
  otherRoots,
  searchSellerTaxonomy,
  type SellerTaxon,
} from "@/lib/cerca/domain/seller-categories";
import { listSellerTaxonomy } from "@/lib/cerca/server/seller-categories";

export function SellerCategoryPicker({
  selected,
  onChange,
  title = "¿Qué tipo de productos vendés?",
  hint = "Seleccioná una o varias categorías que representen los productos que ofrecés.",
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  title?: string;
  hint?: string;
}) {
  const titleId = useId();
  const [categories, setCategories] = useState<SellerTaxon[]>([]);
  const [limit, setLimit] = useState(10);
  const [otherOpen, setOtherOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listSellerTaxonomy()
      .then((result) => {
        if (cancelled) return;
        setCategories(result.categories);
        setLimit(result.limit);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el catálogo de categorías.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!otherOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOtherOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [otherOpen]);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
      setNotice(null);
      return;
    }
    if (selected.length >= limit) {
      setNotice(`Podés elegir hasta ${limit} categorías. Ese tope se cambia en la configuración de la plataforma.`);
      return;
    }
    setNotice(null);
    onChange([...selected, id]);
  }

  const featured = featuredTaxa(categories);
  const extras = otherRoots(categories);
  const hits = searchSellerTaxonomy(categories, query);
  const byId = new Map(categories.map((category) => [category.id, category]));
  const featuredIds = new Set(featured.map((category) => category.id));
  const otherSelected = selected.some((id) => !featuredIds.has(id));
  const atLimit = selected.length >= limit;

  return (
    <div className="grid gap-3">
      <div>
        <h2 className="text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted">{hint}</p>
        <p className="mt-1 text-sm font-medium text-ink">
          {selected.length} de {limit}
        </p>
        <p className="text-sm text-muted">Elegir un rubro no te impide publicar un producto de otro.</p>
      </div>
      {error ? <p className="rounded-2xl bg-sun/40 px-3 py-2 text-sm">{error}</p> : null}
      {categories.length === 0 && !error ? <div className="h-40 animate-pulse rounded-2xl bg-card" /> : null}
      <ul className="overflow-hidden rounded-2xl border border-line bg-card">
        {featured.map((category) => (
          <li key={category.id} className="border-b border-line last:border-b-0">
            <CategoryChoice category={category} selected={selected.includes(category.id)} disabled={atLimit} onToggle={toggle} />
          </li>
        ))}
        <li>
          <button
            type="button"
            aria-pressed={otherOpen || otherSelected}
            onClick={() => setOtherOpen(true)}
            className={categoryRowClass(otherSelected)}
          >
            <Search className={`size-4 shrink-0 ${otherSelected ? "text-teal" : "text-ink"}`} aria-hidden />
            <span className="min-w-0 flex-1 font-semibold leading-snug">Otro</span>
            {otherSelected ? <Check className="size-4 shrink-0 text-teal" aria-hidden /> : null}
          </button>
        </li>
      </ul>
      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const category = byId.get(id);
            const parent = category?.parentId ? byId.get(category.parentId) : undefined;
            const label = parent ? `${parent.name} → ${category?.name ?? id}` : (category?.name ?? id);
            return (
              <li key={id}>
                <button type="button" onClick={() => toggle(id)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sun px-3 text-sm font-semibold">
                  <Check className="size-4" aria-hidden />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {notice ? <p className="text-sm text-muted">{notice}</p> : null}
      {otherOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onClick={() => setOtherOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-foam shadow-card sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
              <div>
                <h3 id={titleId} className="text-lg font-semibold">Buscá qué vendés</h3>
                <p className="text-sm text-muted">También encuentra subcategorías de las 10 principales.</p>
              </div>
              <button type="button" onClick={() => setOtherOpen(false)} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-paper" aria-label="Cerrar">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="px-4 py-3">
              <label className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-3">
                <Search className="size-4 text-teal" aria-hidden />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar categoría..."
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </label>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
              {query.trim().length >= 2 ? (
                <ul className="grid gap-1">
                  {hits.length === 0 ? <li className="py-6 text-center text-sm text-muted">No hay categorías con ese texto.</li> : null}
                  {hits.map((hit) => {
                    const category = byId.get(hit.id);
                    const parent = category?.parentId ? byId.get(category.parentId) : undefined;
                    return (
                    <li key={hit.id}>
                      <ChoiceRow
                        title={hit.parentName ? `${hit.parentName} → ${hit.name}` : hit.name}
                        icon={category?.icon}
                        parentIcon={parent?.icon}
                        slug={hit.id}
                        selected={selected.includes(hit.id)}
                        disabled={atLimit && !selected.includes(hit.id)}
                        onClick={() => toggle(hit.id)}
                      />
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="grid gap-4">
                  {extras.map((root) => (
                    <section key={root.id}>
                      <ChoiceRow title={root.name} icon={root.icon} slug={root.id} selected={selected.includes(root.id)} disabled={atLimit && !selected.includes(root.id)} onClick={() => toggle(root.id)} />
                      <ul className="mt-1 grid gap-1 pl-3">
                        {childrenOf(categories, root.id).map((child) => (
                          <li key={child.id}>
                            <ChoiceRow
                              title={child.name}
                              icon={child.icon}
                              parentIcon={root.icon}
                              slug={child.id}
                              selected={selected.includes(child.id)}
                              disabled={atLimit && !selected.includes(child.id)}
                              onClick={() => toggle(child.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t border-line p-3">
              <button type="button" onClick={() => setOtherOpen(false)} className="min-h-11 w-full rounded-full bg-ink text-sm font-semibold text-paper">
                Listo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CategoryChoice({
  category,
  selected,
  disabled,
  onToggle,
}: {
  category: SellerTaxon;
  selected: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
}) {
  const IconWrap = (
    <span className={selected ? "text-teal" : "text-ink"}>
      <CategoryGlyph slug={category.id} icon={category.icon} />
    </span>
  );
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={!selected && disabled}
      onClick={() => onToggle(category.id)}
      className={`${categoryRowClass(selected)} disabled:opacity-50`}
    >
      {IconWrap}
      <span className="min-w-0 flex-1 leading-snug">{category.name}</span>
      {selected ? <Check className="size-4 shrink-0 text-teal" aria-hidden /> : null}
    </button>
  );
}

function ChoiceRow({
  title,
  selected,
  disabled,
  onClick,
  icon,
  parentIcon,
  slug,
}: {
  title: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  icon?: string | null;
  parentIcon?: string | null;
  slug?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`${categoryRowClass(selected)} disabled:opacity-50`}
    >
      <span className={selected ? "text-teal" : "text-ink"}>
        <CategoryGlyph slug={slug ?? ""} icon={icon} parentIcon={parentIcon} />
      </span>
      <span className="min-w-0 flex-1 leading-snug">{title}</span>
      {selected ? <Check className="size-4 shrink-0 text-teal" aria-hidden /> : null}
    </button>
  );
}

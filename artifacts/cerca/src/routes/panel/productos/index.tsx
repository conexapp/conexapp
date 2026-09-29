import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { formatArs } from "@/lib/cerca/domain/money";
import { listMyListings } from "@/lib/cerca/server/listings";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/panel/productos/")({ component: ProductsPage });

const FILTERS = [
  ["all", "Todos"],
  ["published", "Publicados"],
  ["paused", "Pausados"],
  ["out_of_stock", "Sin stock"],
  ["draft", "Borradores"],
  ["archived", "Archivados"],
] as const;

function ProductsPage() {
  const { user, isPending } = useCurrentUserState();
  const [status, setStatus] = useState<(typeof FILTERS)[number][0]>("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listMyListings>>>([]);

  function reload(nextStatus = status, nextQ = q) {
    void listMyListings({ data: { status: nextStatus, q: nextQ } })
      .then(setRows)
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se pudo listar."));
  }

  useEffect(() => {
    if (user) reload();
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Proveedor</p>
          <h1 className="text-4xl">Mis productos</h1>
        </div>
        <Link to="/panel/productos/$listingId" params={{ listingId: "nuevo" }} className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-paper">
          Publicar producto
        </Link>
      </div>
      <form
        className="mb-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          reload();
        }}
      >
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar en tus productos" aria-label="Buscar en tus productos" className="min-h-11 flex-1 rounded-full border border-line bg-foam px-4" />
        <button className="min-h-11 rounded-full border border-ink px-4">Buscar</button>
      </form>
      <div className="mb-4 flex gap-2 overflow-x-auto text-sm">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`min-h-10 shrink-0 rounded-full px-3 ${status === value ? "bg-ink text-paper" : "border border-line"}`}
            onClick={() => {
              setStatus(value);
              reload(value, q);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="grid gap-2">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-line bg-card p-4 text-sm">
            <p className="font-semibold">{status === "all" || status === "published" ? "No tenés productos publicados todavía." : "No hay productos en este filtro."}</p>
            {status === "all" || status === "published" ? (
              <Link to="/panel/productos/$listingId" params={{ listingId: "nuevo" }} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
                Publicar producto
              </Link>
            ) : null}
          </li>
        ) : null}
        {rows.map((row) => (
          <li key={row.id}>
            <Link to="/panel/productos/$listingId" params={{ listingId: row.id }} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-card border border-line bg-foam p-3">
              {row.image_key ? (
                <img src={`/api/media/${row.image_key}`} alt="" className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-xl bg-paper text-xs text-muted">Sin foto</span>
              )}
              <span>
                <span className="block font-medium">{row.name}</span>
                <span className="text-sm text-muted">{row.trade_name}{row.brand ? ` · ${row.brand}` : ""} · {listingStatusLabel(row.status)} · stock {row.stock_units}</span>
              </span>
              <span className="tabular-nums">{formatArs(Number(row.price_cents))}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

function listingStatusLabel(status: string): string {
  switch (status) {
    case "published":
      return "Publicado";
    case "paused":
      return "Pausado";
    case "draft":
      return "Borrador";
    case "archived":
      return "Archivado";
    case "out_of_stock":
      return "Sin stock";
    default:
      return status;
  }
}

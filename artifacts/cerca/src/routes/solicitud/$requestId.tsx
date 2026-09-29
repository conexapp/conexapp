import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { getPublicRequest, type PublicNeed } from "@/lib/cerca/server/public";
import { formatWhen, requestStatusLabel } from "@/lib/cerca/domain/labels";

export const Route = createFileRoute("/solicitud/$requestId")({ component: RequestPage });

function RequestPage() {
  const { requestId } = Route.useParams();
  const [request, setRequest] = useState<PublicNeed | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    void getPublicRequest({ data: requestId })
      .then((next) => {
        setRequest(next);
        document.title = `${next.title} — CONEX`;
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "No se encontró."));
  }, [requestId]);

  return (
    <Shell>
      <nav className="mb-4 text-sm text-muted">
        <Link to="/solicitudes" className="inline-flex min-h-11 items-center hover:text-ink">Lo que buscan</Link>
      </nav>
      {error ? <p className="rounded-2xl bg-card p-4 text-sm">{error}</p> : null}
      {!request && !error ? <p className="text-sm text-muted">Cargando…</p> : null}
      {request ? (
        <article className="max-w-3xl">
          <p className="text-sm font-semibold text-olive">Alguien busca esto · {request.city}</p>
          <h1 className="mt-2 text-4xl font-semibold">{request.title}</h1>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-muted">Cantidad</dt>
              <dd className="mt-1 text-lg font-semibold">{request.quantity}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-muted">Categoría</dt>
              <dd className="mt-1 text-lg font-semibold">{request.categoryName ?? "Sin categoría"}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-muted">Zona</dt>
              <dd className="mt-1 text-lg font-semibold">{request.city}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-muted">Estado</dt>
              <dd className="mt-1 text-lg font-semibold">{requestStatusLabel(request.status)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm">
            {request.delivery ? "El comprador prefiere entrega." : "El comprador prefiere retiro."}
            {formatWhen(request.createdAt) ? ` Publicada el ${formatWhen(request.createdAt)}.` : ""}
          </p>
          <section className="mt-6">
            <h2 className="text-xl font-semibold">Descripción</h2>
            {request.notes.trim() ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{request.notes}</p>
            ) : (
              <p className="mt-2 text-sm text-muted">El comprador no agregó una descripción.</p>
            )}
          </section>
          <p className="mt-6 rounded-2xl bg-paper p-4 text-sm">
            Proveedores interesados pueden enviar una propuesta desde Mi negocio. No se publica el nombre ni el contacto de quien lo pidió.
          </p>
          <Link to="/panel" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
            Enviar propuesta
          </Link>
        </article>
      ) : null}
    </Shell>
  );
}

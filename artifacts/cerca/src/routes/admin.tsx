import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { adminOverview, resolveDispute, reviewBusiness, setDefaultCommission } from "@/lib/cerca/server/admin";
import { listReports, resolveReport } from "@/lib/cerca/server/reports";
import { getPlatformStatus } from "@/lib/cerca/server/public";
import { claimAdminIfNone, getMyAccount } from "@/lib/cerca/server/account";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [overview, setOverview] = useState<Awaited<ReturnType<typeof adminOverview>> | null>(null);
  const [reports, setReports] = useState<Awaited<ReturnType<typeof listReports>>>([]);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof getPlatformStatus>> | null>(null);
  const [bps, setBps] = useState("300");
  const [disputeId, setDisputeId] = useState("");
  const [note, setNote] = useState("");

  function reload() {
    void getMyAccount().then(setAccount);
    void getPlatformStatus().then(setStatus);
    void adminOverview().then(setOverview).catch(() => setOverview(null));
    void listReports().then(setReports).catch(() => setReports([]));
  }

  useEffect(() => {
    if (user) reload();
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <Shell>
      <h1 className="text-4xl">Administración</h1>
      {account?.canClaimAdmin ? (
        <button
          type="button"
          className="mt-4 min-h-11 rounded-full bg-copper px-4 text-ink"
          onClick={() => {
            void claimAdminIfNone()
              .then(() => {
                toast.success("Quedaste como administrador. Hacelo apenas haya un operador real.");
                reload();
              })
              .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se reclamó."));
          }}
        >
          Reclamar administración
        </button>
      ) : null}
      {account && !account.canClaimAdmin && account.platformRole !== "admin" ? (
        <p className="mt-4 max-w-2xl text-sm text-muted">
          El alta del primer administrador no es automática. En producción hace falta CERCA_BOOTSTRAP_ADMIN_EMAIL, con ese email ya verificado, y solo mientras no exista otro admin.
          {status?.adminBootstrap === "dev_claim" ? " En este preview, sin esa variable, el primer usuario todavía puede reclamarla." : ""}
        </p>
      ) : null}
      {account && account.platformRole !== "admin" ? (
        <p className="mt-4 text-sm text-muted">Tu rol es {account.platformRole}. Esta pantalla no muestra datos de otros usuarios.</p>
      ) : null}

      {status ? (
        <section className="mt-6 rounded-card border border-line bg-foam p-4 text-sm">
          <h2 className="text-2xl">Integraciones</h2>
          <p className="mt-2">Base: {status.database === "embedded_preview" ? "Postgres embebido de desarrollo" : "Postgres"}.</p>
          <p>Pagos: {status.payments.configured ? "configurado" : `falta ${status.payments.missing.join(", ")}`}.</p>
          <p>Email: {status.email.configured ? "configurado" : `falta ${status.email.missing.join(", ")}`}.</p>
          <p>
            Mapa: OpenStreetMap ({status.maps.id}). Las teselas oficiales alcanzan para esta preview. Con tráfico real
            conviene un proveedor dedicado. No se usa CARTO ni Google Maps.
          </p>
          <p>{status.storage.note}</p>
        </section>
      ) : null}

      {overview ? (
        <section className="mt-6 grid gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Metric label="Usuarios" value={overview.metrics.users} />
            <Metric label="Negocios reales" value={overview.metrics.businesses} />
            <Metric label="En revisión" value={overview.metrics.pending} />
            <Metric label="Pedidos" value={overview.metrics.orders} />
          </div>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void setDefaultCommission({ data: Number(bps) })
                .then(() => {
                  toast.success("La comisión nueva queda para pedidos futuros. Los ya creados no cambian.");
                  reload();
                })
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardó."));
            }}
          >
            <label className="text-sm">Comisión global (basis points, 300 = 3%)</label>
            <input value={bps} onChange={(event) => setBps(event.target.value)} className="min-h-11 w-28 rounded-full border border-line px-3" />
            <button className="min-h-11 rounded-full bg-ink px-4 text-paper">Guardar</button>
          </form>
          <ul className="grid gap-2">
            {overview.businesses.map((business) => (
              <li key={business.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2">
                <span>
                  {business.trade_name}
                  <span className="ml-2 text-sm text-muted">{business.status}{business.is_demo ? " · ejemplo" : ""} · {business.owner_email}</span>
                </span>
                {business.is_demo ? null : (
                  <span className="flex gap-2">
                    <button type="button" className="min-h-10 rounded-full bg-olive px-3 text-ink" onClick={() => void reviewBusiness({ data: { businessId: business.id, decision: "active" } }).then(reload)}>Publicar</button>
                    <button type="button" className="cx-danger min-h-10 rounded-full border border-line px-3" onClick={() => void reviewBusiness({ data: { businessId: business.id, decision: "suspended" } }).then(reload)}>Suspender</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <form
            className="grid gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void resolveDispute({ data: { disputeId, outcome: "buyer", note } })
                .then((result) => toast.message(result.message))
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se resolvió."));
            }}
          >
            <h2 className="text-2xl">Resolver disputa a favor del comprador</h2>
            <input value={disputeId} onChange={(event) => setDisputeId(event.target.value)} placeholder="Id de la disputa" className="min-h-11 rounded-2xl border border-line px-3" />
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Fundamento" className="min-h-20 rounded-2xl border border-line px-3 py-2" />
            <button className="min-h-11 rounded-full border border-ink">Registrar resolución sin reembolso automático</button>
          </form>
          <section className="grid gap-2">
            <h2 className="text-2xl">Reportes</h2>
            {reports.length === 0 ? (
              <p className="text-sm text-muted">No hay reportes. El listado queda vacío hasta que un usuario envíe uno.</p>
            ) : null}
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-line px-3 py-2">
                <p className="text-sm font-medium">
                  {report.target_type} · {report.reason} · {report.status}
                </p>
                <p className="text-sm text-muted">{report.details || "Sin detalle."}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="min-h-10 rounded-full border border-line px-3 text-sm"
                    onClick={() =>
                      void resolveReport({ data: { id: report.id, status: "in_review" } })
                        .then(reload)
                        .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se actualizó."))
                    }
                  >
                    En revisión
                  </button>
                  <button
                    type="button"
                    className="min-h-10 rounded-full bg-olive px-3 text-sm"
                    onClick={() =>
                      void resolveReport({ data: { id: report.id, status: "resolved" } })
                        .then(reload)
                        .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se actualizó."))
                    }
                  >
                    Resuelto
                  </button>
                  <button
                    type="button"
                    className="min-h-10 rounded-full border border-line px-3 text-sm"
                    onClick={() =>
                      void resolveReport({ data: { id: report.id, status: "dismissed" } })
                        .then(reload)
                        .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se actualizó."))
                    }
                  >
                    Descartado
                  </button>
                </div>
              </article>
            ))}
          </section>
        </section>
      ) : null}
    </Shell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-line bg-foam p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}

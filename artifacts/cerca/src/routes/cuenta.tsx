import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { getMyAccount, listNotifications, updateMyPhone } from "@/lib/cerca/server/account";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/cuenta")({ component: AccountPage });

function accountKind(account: Awaited<ReturnType<typeof getMyAccount>>) {
  if (account.platformRole === "admin") return "Administración";
  if (account.businesses.length > 0) return "Proveedor";
  return "Comprador";
}

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getMyAccount>> | null>(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listNotifications>>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    void getMyAccount().then((next) => {
      setAccount(next);
      setPhone(next.phone);
    });
    void listNotifications().then(setNotes);
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <Shell>
      <h1 className="text-4xl font-semibold">Mi cuenta</h1>
      {account ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
          <form
            className="grid gap-3 rounded-2xl border border-line bg-card p-5"
            onSubmit={(event) => {
              event.preventDefault();
              setSaving(true);
              void updateMyPhone({ data: phone })
                .then(() => toast.success("Teléfono guardado."))
                .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardó."))
                .finally(() => setSaving(false));
            }}
          >
            <p className="text-sm font-semibold text-olive">{accountKind(account)}</p>
            <p className="text-2xl font-semibold">{account.name || "Sin nombre"}</p>
            <p className="text-sm text-muted">{account.email}</p>
            <p className="text-sm text-muted">
              Email {account.emailVerified ? "confirmado" : "pendiente de confirmación"}.
            </p>
            <label className="grid gap-1 text-sm">
              Teléfono
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Ej. 341 555-0000"
                className="min-h-12 rounded-2xl border border-line px-3"
                autoComplete="tel"
              />
            </label>
            <button disabled={saving} className="min-h-11 rounded-full bg-ink text-paper disabled:opacity-60">
              {saving ? "Guardando…" : "Guardar teléfono"}
            </button>
            <p className="text-sm text-muted">
              {account.businesses.length > 0
                ? "Acá vas a encontrar tus consultas, lo que pediste y tus compras."
                : "Acá vas a encontrar tus consultas y lo que publiques. Para vender, creá tu negocio."}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link to="/cotizaciones" className="inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium">
                Mis consultas
              </Link>
              <Link to="/solicitudes" className="inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium">
                Lo que necesito
              </Link>
              <Link to="/pedidos" className="inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium">
                Mis compras
              </Link>
              <Link to="/panel" className="inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium">
                {account.businesses.length > 0 ? "Mi negocio" : "Crear mi negocio"}
              </Link>
              <Link to="/proteccion" className="inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium">
                Protección
              </Link>
            </div>
          </form>
          <section className="grid gap-2">
            <h2 className="text-2xl">Avisos</h2>
            {notes.length === 0 ? (
              <p className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">
                No hay avisos. Cuando un proveedor responda, el aviso aparece acá.
              </p>
            ) : null}
            {notes.map((note) => (
              <article key={note.id} className="rounded-2xl border border-line bg-card px-3 py-2">
                <p className="font-medium">{note.title}</p>
                <p className="text-sm text-muted">{note.body}</p>
                <p className="text-xs text-muted">Email: {note.email_status}</p>
              </article>
            ))}
          </section>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">Cargando cuenta…</p>
      )}
    </Shell>
  );
}

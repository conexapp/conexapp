import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { Shell } from "@/components/cerca/shell";
import { getDevMailbox } from "@/lib/cerca/server/mailbox";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

type Mode = "in" | "up" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const [links, setLinks] = useState<Array<{ kind: string; url: string }>>([]);

  async function loadMailbox() {
    try {
      const rows = await getDevMailbox({ data: email });
      setLinks(rows.map((row) => ({ kind: row.kind, url: row.url })));
      if (rows.length === 0) toast.message("Todavía no hay un enlace en el buzón de desarrollo.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No hay buzón de desarrollo.");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setNotice("");
    try {
      if (mode === "forgot") {
        const result = await authClient.requestPasswordReset({
          email,
          redirectTo: `${window.location.origin}/restablecer`,
        });
        if (result.error) {
          toast.error(result.error.message ?? "No se pudo pedir el enlace.");
          return;
        }
        setNotice("Si la cuenta existe, hay un enlace para elegir una contraseña nueva. Vence en una hora y sirve una sola vez.");
        return;
      }
      const result =
        mode === "up"
          ? await authClient.signUp.email({ email, password, name, callbackURL: "/" })
          : await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (result.error) {
        const message = result.error.message ?? "No se pudo entrar.";
        if (/verif/i.test(message)) {
          setNotice("Tenés que confirmar el email antes de entrar. El enlace vence y no se puede reutilizar.");
          return;
        }
        toast.error(message);
        return;
      }
      if (mode === "up") {
        setNotice("Creá la cuenta y confirmá el email. Hasta entonces no hay sesión, y el rol no se asigna solo.");
        setMode("in");
        return;
      }
      const next = sessionStorage.getItem("conex-after-auth");
      sessionStorage.removeItem("conex-after-auth");
      if (next && /^\/producto\/[A-Za-z0-9-]+$/.test(next.split("?")[0] ?? "") && (next.endsWith("?comprar=1") || !next.includes("?"))) {
        window.location.assign(next);
        return;
      }
      await navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo entrar.");
    } finally {
      setPending(false);
    }
  }

  async function resend() {
    const result = await authClient.sendVerificationEmail({ email, callbackURL: "/" });
    if (result.error) toast.error(result.error.message ?? "No se reenvió.");
    else setNotice("Si la cuenta existe, generamos otro enlace de confirmación.");
  }

  return (
    <Shell>
      <div className="mx-auto grid max-w-md gap-4">
        <h1 className="text-4xl">{mode === "up" ? "Crear cuenta" : mode === "forgot" ? "Recuperar contraseña" : "Entrar"}</h1>
        <p className="text-sm text-muted">
          La cuenta queda en la base. Un usuario nuevo no es administrador. En producción el correo sale por Resend; sin eso, este preview guarda el enlace en un buzón local.
        </p>
        <form id="conex-auth-form" onSubmit={submit} className="grid gap-3" autoComplete="on">
          {mode === "up" ? (
            <label className="grid gap-1 text-sm">
              Nombre
              <input
                id="conex-auth-name"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-12 rounded-2xl border border-line bg-foam px-4"
              />
            </label>
          ) : null}
          <label className="grid gap-1 text-sm">
            Email
            <input
              id="conex-auth-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 rounded-2xl border border-line bg-foam px-4"
            />
          </label>
          {mode !== "forgot" ? (
            <label className="grid gap-1 text-sm">
              Contraseña
              <input
                id="conex-auth-password"
                name="password"
                type="password"
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-12 rounded-2xl border border-line bg-foam px-4"
              />
            </label>
          ) : null}
          <button disabled={pending} className="min-h-12 rounded-full bg-ink text-paper disabled:opacity-60">
            {pending ? "Guardando…" : mode === "up" ? "Crear cuenta" : mode === "forgot" ? "Pedir enlace" : "Entrar"}
          </button>
        </form>
        {notice ? <p className="text-sm">{notice}</p> : null}
        <div className="flex flex-wrap gap-3 text-sm">
          <button type="button" className="text-olive" onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "Ya tengo cuenta" : "Crear una cuenta"}
          </button>
          <button type="button" className="text-olive" onClick={() => setMode("forgot")}>Olvidé la contraseña</button>
          {mode !== "forgot" ? (
            <button type="button" className="text-olive" onClick={() => void resend()}>Reenviar confirmación</button>
          ) : null}
          <button type="button" className="text-olive" onClick={() => void loadMailbox()}>Buzón de desarrollo</button>
        </div>
        {links.length > 0 ? (
          <ul className="grid gap-2 text-sm">
            {links.map((link) => (
              <li key={link.url}>
                <a className="break-all text-olive" href={link.url}>{link.kind === "reset" ? "Elegir contraseña" : "Confirmar email"}</a>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="grid gap-2">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              className="min-h-12 rounded-full border border-line"
              onClick={() => signIn(provider.providerId, { callbackURL: "/" })}
            >
              Continuar con {provider.label}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

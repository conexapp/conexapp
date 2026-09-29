import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth/client";
import { Shell } from "@/components/cerca/shell";
import { toast } from "sonner";

export const Route = createFileRoute("/restablecer")({ component: ResetPage });

function ResetPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) {
      toast.error("El enlace no trae un token. Pedí uno nuevo.");
      return;
    }
    setPending(true);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        toast.error(result.error.message ?? "No se cambió la contraseña.");
        return;
      }
      toast.success("Contraseña actualizada. El enlace ya no sirve.");
      await navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se cambió la contraseña.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <form onSubmit={submit} className="mx-auto grid max-w-md gap-3">
        <h1 className="text-4xl">Nueva contraseña</h1>
        <p className="text-sm text-muted">El enlace vence a la hora y se consume al usarlo. Las sesiones anteriores se cierran.</p>
        <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nueva contraseña" className="min-h-12 rounded-2xl border border-line bg-foam px-4" />
        <button disabled={pending} className="min-h-12 rounded-full bg-ink text-paper disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </Shell>
  );
}

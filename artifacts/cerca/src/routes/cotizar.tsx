import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";

export const Route = createFileRoute("/cotizar")({ component: CotizarPage });

function CotizarPage() {
  return (
    <Shell>
      <h1 className="text-4xl">Buscá, pedí o vendé</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Si ya viste un producto, consultalo en esa página. Si no lo encontrás, publicá lo que necesitás para que los proveedores te respondan. Si tenés un negocio, publicá tus productos.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/" hash="productos" className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">Buscar</Link>
        <Link to="/solicitudes" className="inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-semibold">Publicar lo que necesito</Link>
        <Link to="/panel" className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold">Tengo un negocio</Link>
      </div>
    </Shell>
  );
}

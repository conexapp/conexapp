import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { formatArs } from "@/lib/cerca/domain/money";
import { orderStatusLabel } from "@/lib/cerca/domain/labels";
import { listOrders } from "@/lib/cerca/server/trade";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { toast } from "sonner";

export const Route = createFileRoute("/pedidos/")({ component: OrdersPage });

function OrdersPage() {
  const { user, isPending } = useCurrentUserState();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof listOrders>>>([]);

  useEffect(() => {
    if (!user) return;
    void listOrders()
      .then(setOrders)
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se pudieron leer los pedidos."));
  }, [user]);

  if (!isPending && !user) return <RedirectToSignIn />;

  return (
    <Shell>
      <h1 className="mb-4 text-4xl">Mis compras</h1>
      <ul className="grid gap-2">
        {orders.map((order) => (
          <li key={order.id}>
            <Link to="/pedidos/$orderId" params={{ orderId: order.id }} className="flex items-center justify-between rounded-card border border-line bg-foam px-4 py-3">
              <span>
                <span className="block font-medium">{order.trade_name}</span>
                <span className="text-sm text-muted">{order.role === "buyer" ? "Compra" : "Venta"} · {orderStatusLabel(order.status)}</span>
              </span>
              <span className="tabular-nums">{formatArs(Number(order.total_cents))}</span>
            </Link>
          </li>
        ))}
      </ul>
      {orders.length === 0 ? <p className="text-sm text-muted">Todavía no tenés compras. Cuando aceptes una respuesta de un proveedor, la compra aparece acá.</p> : null}
    </Shell>
  );
}

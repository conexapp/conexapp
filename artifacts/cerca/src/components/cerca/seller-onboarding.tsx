import { useEffect, useState } from "react";
import {
  LEGAL_REVIEW,
  SELLER_ACTIVITIES,
  SELLER_CHANNELS,
  SELLER_GOALS,
  SELLER_SIZES,
  UNAVAILABLE_VERIFICATION,
  activityLabel,
  channelLabel,
  goalLabel,
  panelLead,
  sellerStanding,
  sizeLabel,
  type SellerIntent,
} from "@/lib/cerca/domain/seller-profile";
import { saveSellerIntent, updateBusinessCommercial } from "@/lib/cerca/server/account";
import { toast } from "sonner";

type BusinessCommercial = {
  id: string;
  trade_name: string;
  status: string;
  description: string;
  coverage_note: string;
  min_order_note: string;
  sells_wholesale: boolean | null;
  sells_retail: boolean | null;
};

export function SellerOnboarding({
  intent,
  business,
  completedOrders,
  onSaved,
}: {
  intent: SellerIntent | null;
  business: BusinessCommercial | null;
  completedOrders: number;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<SellerIntent>(intent ?? emptyIntent());
  const [coverage, setCoverage] = useState(business?.coverage_note ?? "");
  const [minOrder, setMinOrder] = useState(business?.min_order_note ?? "");
  const [description, setDescription] = useState(business?.description ?? "");
  const [wholesale, setWholesale] = useState(business?.sells_wholesale === true);
  const [retail, setRetail] = useState(business?.sells_retail === true);

  useEffect(() => {
    setDraft(intent ?? emptyIntent());
  }, [intent]);

  useEffect(() => {
    setCoverage(business?.coverage_note ?? "");
    setMinOrder(business?.min_order_note ?? "");
    setDescription(business?.description ?? "");
    setWholesale(business?.sells_wholesale === true);
    setRetail(business?.sells_retail === true);
  }, [business]);

  const standing = sellerStanding({
    intent,
    businessStatus: business?.status ?? null,
    completedOrders,
  });

  function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  }

  return (
    <section className="mb-6 grid gap-4">
      <div className="rounded-2xl border border-line bg-card p-4">
        <p className="text-xs font-semibold tracking-wide text-olive uppercase">Estado</p>
        <h2 className="mt-1 text-2xl">{standing.label}</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{standing.detail}</p>
        <p className="mt-2 max-w-2xl text-sm">{panelLead(intent)}</p>
        <p className="mt-3 text-sm text-muted">Todavía no se otorgan: {UNAVAILABLE_VERIFICATION.join(" · ")}.</p>
      </div>

      <form
        className="grid gap-3 rounded-2xl border border-line bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void saveSellerIntent({ data: draft })
            .then(() => {
              toast.success("Declaración guardada.");
              onSaved();
            })
            .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardó."));
        }}
      >
        <h2 className="text-2xl">Qué querés hacer</h2>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">En CONEX</legend>
          <div className="flex flex-wrap gap-2">
            {SELLER_GOALS.map((goal) => (
              <label key={goal} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm">
                <input type="radio" name="conex-seller-goal" checked={draft.goal === goal} onChange={() => setDraft({ ...draft, goal })} />
                {goalLabel(goal)}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-1 text-sm">
          Qué tipo de productos
          <input
            value={draft.productKinds}
            onChange={(event) => setDraft({ ...draft, productKinds: event.target.value })}
            className="min-h-11 rounded-2xl border border-line px-3"
            placeholder="Por ejemplo, herramientas"
          />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Cómo trabajás</legend>
          <div className="flex flex-wrap gap-2">
            {SELLER_ACTIVITIES.map((id) => (
              <label key={id} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.activities.includes(id)}
                  onChange={() => setDraft({ ...draft, activities: toggle(draft.activities, id) })}
                />
                {activityLabel(id)}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">A quién le vendés</legend>
          <div className="flex flex-wrap gap-2">
            {SELLER_CHANNELS.map((id) => (
              <label key={id} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.channels.includes(id)}
                  onChange={() => setDraft({ ...draft, channels: toggle(draft.channels, id) })}
                />
                {channelLabel(id)}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Tamaño de hoy</legend>
          <div className="flex flex-wrap gap-2">
            {SELLER_SIZES.map((size) => (
              <label key={size} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm">
                <input type="radio" name="conex-seller-size" checked={draft.size === size} onChange={() => setDraft({ ...draft, size })} />
                {sizeLabel(size)}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.ships} onChange={(event) => setDraft({ ...draft, ships: event.target.checked })} />
          Hago envíos
        </label>
        <label className="grid gap-1 text-sm">
          Qué buscás en CONEX
          <textarea
            value={draft.seeking}
            onChange={(event) => setDraft({ ...draft, seeking: event.target.value })}
            className="min-h-20 rounded-2xl border border-line px-3 py-2"
          />
        </label>
        <label className="flex min-h-11 items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={draft.declaresMinor}
            onChange={(event) => setDraft({ ...draft, declaresMinor: event.target.checked })}
          />
          <span>Soy menor de 18 años. Si lo marcás, no vas a poder publicar ni cobrar. No hace falta el documento de un adulto.</span>
        </label>
        <button className="min-h-11 justify-self-start rounded-full bg-ember px-4 text-sm font-semibold text-ink">Guardar declaración</button>
      </form>

      {business ? (
        <form
          className="grid gap-3 rounded-2xl border border-line bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void updateBusinessCommercial({
              data: { businessId: business.id, description, coverageNote: coverage, minOrderNote: minOrder, sellsWholesale: wholesale, sellsRetail: retail },
            })
              .then(() => {
                toast.success("Datos comerciales guardados.");
                onSaved();
              })
              .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardó."));
          }}
        >
          <h2 className="text-2xl">Datos comerciales de {business.trade_name}</h2>
          <p className="text-sm text-muted">Sin CUIT ni documentos. La compra mínima es una nota: no se cobra sola.</p>
          <label className="grid gap-1 text-sm">
            Descripción
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-20 rounded-2xl border border-line px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm">
            Zona de cobertura
            <input value={coverage} onChange={(event) => setCoverage(event.target.value)} placeholder="Por ejemplo, Rosario centro" className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="grid gap-1 text-sm">
            Compra mínima, si la tenés
            <input value={minOrder} onChange={(event) => setMinOrder(event.target.value)} placeholder="Por ejemplo, 10 unidades" className="min-h-11 rounded-2xl border border-line px-3" />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={wholesale} onChange={(event) => setWholesale(event.target.checked)} />
            Vendo mayorista
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={retail} onChange={(event) => setRetail(event.target.checked)} />
            Vendo minorista
          </label>
          <button className="min-h-11 justify-self-start rounded-full bg-ink px-4 text-sm font-semibold text-paper">Guardar datos comerciales</button>
        </form>
      ) : null}

      <div className="rounded-2xl border border-line bg-card p-4 text-sm">
        <h2 className="text-xl">Lo que esta cuenta todavía no hace</h2>
        <ul className="mt-3 grid gap-2 text-muted">
          <li>No hay chat aparte. La consulta y la respuesta quedan en CONEX, con precio, cantidad, envío y plazo.</li>
          <li>No hay cotización de varios productos ni descuentos armados.</li>
          <li>No hay carga por Excel, CRM, automatizaciones ni un plan pago.</li>
          <li>No hay reputación de estrellas ni porcentajes si no hubo operaciones.</li>
          <li>No hay sanciones automáticas ni detección de operaciones por fuera.</li>
        </ul>
      </div>

      <div className="rounded-2xl border border-line bg-paper p-4 text-sm">
        <h2 className="text-xl">Antes de pedirte más datos</h2>
        <p className="mt-2 text-muted">Esto tiene que revisarlo un abogado, un contador o un especialista en datos. Por eso no está en el formulario.</p>
        <ul className="mt-3 grid gap-3">
          {LEGAL_REVIEW.map((item) => (
            <li key={item.topic}>
              <p className="font-semibold">{item.topic}</p>
              <p className="text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function emptyIntent(): SellerIntent {
  return {
    goal: "vender",
    productKinds: "",
    activities: [],
    channels: [],
    size: "empezando",
    ships: false,
    seeking: "",
    declaresMinor: false,
  };
}

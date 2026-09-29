import { useEffect, useRef, useState } from "react";
import { MarketMap, validMapPoint } from "@/components/cerca/market-map";
import { ConexSelect } from "@/components/cerca/controls";
import { geocodeRosario, setBusinessLocation } from "@/lib/cerca/server/account";
import { toast } from "sonner";

type Business = {
  id: string;
  trade_name: string;
  lat: number | null;
  lng: number | null;
  address_line: string | null;
  neighborhood: string | null;
  location_visibility: string | null;
};

export function LocationEditor({ businesses }: { businesses: Business[] }) {
  const [businessId, setBusinessId] = useState(businesses[0]?.id ?? "");
  const current = businesses.find((business) => business.id === businessId) ?? null;
  const [query, setQuery] = useState(current?.address_line ?? "");
  const [neighborhood, setNeighborhood] = useState(current?.neighborhood ?? "");
  const [hits, setHits] = useState<Array<{ label: string; lat: number; lng: number }>>([]);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(
    validMapPoint(current?.lat ?? null, current?.lng ?? null),
  );
  const [approximate, setApproximate] = useState(current?.location_visibility === "approximate");
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState("");
  const [placed, setPlaced] = useState(current?.lat !== null && current?.lng !== null);
  const applied = useRef("");

  useEffect(() => {
    if (!businessId && businesses[0]) setBusinessId(businesses[0].id);
  }, [businesses, businessId]);

  useEffect(() => {
    const next = businesses.find((business) => business.id === businessId);
    if (!next) return;
    const signature = [
      next.id,
      next.lat,
      next.lng,
      next.address_line,
      next.neighborhood,
      next.location_visibility,
    ].join("|");
    if (applied.current === signature) return;
    applied.current = signature;
    setQuery(next.address_line ?? "");
    setNeighborhood(next.neighborhood ?? "");
    setPin(validMapPoint(next.lat, next.lng));
    setApproximate(next.location_visibility === "approximate");
    setPlaced(next.lat !== null && next.lng !== null);
    setHits([]);
    setSearchNote("");
  }, [businessId, businesses]);

  if (businesses.length === 0) {
    return (
      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="text-2xl font-semibold">Ubicación de tu negocio</h2>
        <p className="mt-2 text-sm text-muted">Primero creá el negocio. Después marcás dónde está en Rosario.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 rounded-2xl bg-card p-4 shadow-card">
      <div>
        <h2 className="text-2xl font-semibold">Ubicación de tu negocio</h2>
        <p className="mt-1 text-sm text-muted">
          Escribí la dirección, elegí un resultado o tocá el mapa. No se guarda un punto hasta que confirmes.
        </p>
      </div>
      <label className="grid gap-1 text-sm">
        Negocio
        <ConexSelect
          value={businessId}
          onChange={setBusinessId}
          ariaLabel="Negocio"
          options={businesses.map((business) => ({ value: business.id, label: business.trade_name }))}
        />
      </label>
      <form
        className="grid gap-2 sm:grid-cols-[1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setSearching(true);
          setSearchNote("");
          void geocodeRosario({ data: { query } })
            .then((result) => {
              setHits(result.results);
              if (!result.ok) {
                setSearchNote(result.message);
                toast.message(result.message);
              } else if (result.results[0]) {
                setPin({ lat: result.results[0].lat, lng: result.results[0].lng });
                setPlaced(true);
                setSearchNote("");
              }
            })
            .catch((error: unknown) => {
              const message = error instanceof Error ? error.message : "No se pudo buscar.";
              setSearchNote(message);
              toast.error(message);
            })
            .finally(() => setSearching(false));
        }}
      >
        <label className="grid gap-1 text-sm">
          Dirección
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Av. Pellegrini 1234, Rosario"
            className="min-h-11 rounded-2xl border border-line bg-paper px-3"
          />
        </label>
        <button className="min-h-11 self-end rounded-full bg-teal px-4 text-sm font-semibold text-ink" disabled={searching}>
          {searching ? "Buscando…" : "Buscar"}
        </button>
      </form>
      {searchNote ? <p className="text-sm text-muted">{searchNote}</p> : null}
      {hits.length > 0 ? (
        <ul className="grid gap-1">
          {hits.map((hit) => (
            <li key={`${hit.lat}-${hit.lng}-${hit.label}`}>
              <button
                type="button"
                className="w-full rounded-2xl border border-line px-3 py-2 text-left text-sm"
                onClick={() => {
                  setPin({ lat: hit.lat, lng: hit.lng });
                  setPlaced(true);
                  setQuery(hit.label);
                }}
              >
                {hit.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <label className="grid gap-1 text-sm">
        Barrio
        <input
          value={neighborhood}
          onChange={(event) => setNeighborhood(event.target.value)}
          placeholder="Barrio"
          className="min-h-11 rounded-2xl border border-line bg-paper px-3"
        />
      </label>
      <MarketMap
        tall
        points={pin ? [{ id: "pin", lat: pin.lat, lng: pin.lng, label: "Tu negocio" }] : []}
        selectedId={pin ? "pin" : null}
        onSelect={() => undefined}
        onPick={(lat, lng) => {
          setPin({ lat, lng });
          setPlaced(true);
        }}
        emptyNote={placed ? null : "Tocá el mapa para marcar tu negocio en Rosario."}
      />
      <label className="flex min-h-11 items-center justify-between gap-3 text-sm">
        <span>Mostrar ubicación aproximada. Los compradores no ven la dirección exacta.</span>
        <input className="cx-switch" type="checkbox" role="switch" checked={approximate} onChange={(event) => setApproximate(event.target.checked)} />
      </label>
      <button
        type="button"
        className="min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink disabled:opacity-40"
        disabled={!pin || !placed}
        onClick={() => {
          if (!pin) return;
          void setBusinessLocation({
            data: {
              businessId,
              lat: pin.lat,
              lng: pin.lng,
              delivery: true,
              pickup: true,
              address: query,
              neighborhood,
              visibility: approximate ? "approximate" : "exact",
            },
          })
            .then(() => toast.success("Ubicación guardada."))
            .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "No se guardó la ubicación."));
        }}
      >
        Confirmar ubicación
      </button>
    </section>
  );
}

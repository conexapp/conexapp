import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LocateFixed, X } from "lucide-react";
import { ROSARIO } from "@/lib/cerca/domain/geo";
import { activeMapTiles } from "@/lib/cerca/maps";
import "leaflet/dist/leaflet.css";

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  place?: string | null;
  distanceKm?: number | null;
  categories?: string[];
  productCount?: number | null;
};

export function validMapPoint(lat: number | null, lng: number | null): { lat: number; lng: number } | null {
  if (lat === null || lng === null) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

const ROSARIO_ZOOM = 13;

export function MarketMap({
  points,
  selectedId,
  onSelect,
  popup = false,
  detailPlace = null,
  emptyNote = null,
  tall = false,
  onPick = null,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  popup?: boolean;
  detailPlace?: string | null;
  emptyNote?: string | null;
  tall?: boolean;
  onPick?: ((lat: number, lng: number) => void) | null;
}) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  const onPickRef = useRef(onPick);
  const focused = useRef<{ id: string; lat: number; lng: number } | null>(null);
  const [ready, setReady] = useState(false);
  onSelectRef.current = onSelect;
  onPickRef.current = onPick;

  useEffect(() => {
    const nodeEl = node.current;
    if (!nodeEl) return;
    let removed = false;
    let map: import("leaflet").Map | null = null;
    const redraw = () => {
      const current = mapRef.current;
      const parent = node.current?.parentElement;
      if (node.current && parent && parent.clientHeight > 0) {
        node.current.style.height = `${parent.clientHeight}px`;
        node.current.style.width = `${parent.clientWidth}px`;
      }
      current?.invalidateSize();
    };
    void (async () => {
      const L = await import("leaflet");
      if (removed || !node.current || mapRef.current) return;
      const host = node.current as HTMLDivElement & { _leaflet_id?: number };
      if (host._leaflet_id) return;
      const tiles = activeMapTiles();
      redraw();
      map = L.map(host, {
        scrollWheelZoom: false,
        zoomControl: true,
      }).setView([ROSARIO.lat, ROSARIO.lng], ROSARIO_ZOOM);
      L.tileLayer(tiles.url, {
        attribution: tiles.attribution,
        maxZoom: tiles.maxZoom,
      }).addTo(map);
      const layer = L.layerGroup().addTo(map);
      map.on("click", (event) => {
        if (onPickRef.current) {
          onPickRef.current(event.latlng.lat, event.latlng.lng);
          return;
        }
        onSelectRef.current(null);
      });
      mapRef.current = map;
      layerRef.current = layer;
      redraw();
      window.setTimeout(redraw, 50);
      window.setTimeout(redraw, 400);
      if (!removed) setReady(true);
    })();
    const observer = new ResizeObserver(() => redraw());
    observer.observe(nodeEl);
    if (nodeEl.parentElement) observer.observe(nodeEl.parentElement);
    window.addEventListener("resize", redraw);
    return () => {
      removed = true;
      observer.disconnect();
      window.removeEventListener("resize", redraw);
      map?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setReady(false);
    };
  }, []);

  const markerKey = points
    .map((point) => `${point.id}:${point.lat}:${point.lng}:${point.label}:${point.id === selectedId ? 1 : 0}`)
    .join("|");
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!ready || !map || !layer) return;
    let dead = false;
    const currentPoints = pointsRef.current;
    void (async () => {
      const L = await import("leaflet");
      if (dead) return;
      layer.clearLayers();
      for (const point of currentPoints) {
        const spot = validMapPoint(point.lat, point.lng);
        if (!spot) continue;
        const selected = point.id === selectedId;
        const icon = L.divIcon({
          className: "cerca-pin-wrap",
          html: `<span class="cerca-pin${selected ? " is-selected" : ""}"></span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([spot.lat, spot.lng], {
          icon,
          title: point.label,
          draggable: Boolean(onPickRef.current),
        });
        marker.on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          onSelectRef.current(point.id);
        });
        marker.on("dragend", () => {
          const next = marker.getLatLng();
          onPickRef.current?.(next.lat, next.lng);
        });
        marker.addTo(layer);
      }
      const selected = currentPoints.find((point) => point.id === selectedId);
      const spot = selected ? validMapPoint(selected.lat, selected.lng) : null;
      if (selected && spot) {
        const previous = focused.current;
        if (!previous || previous.id !== selected.id || previous.lat !== spot.lat || previous.lng !== spot.lng) {
          map.panTo([spot.lat, spot.lng]);
        }
        focused.current = { id: selected.id, lat: spot.lat, lng: spot.lng };
      } else {
        focused.current = null;
      }
    })();
    return () => {
      dead = true;
    };
  }, [markerKey, ready, selectedId]);

  const selected = points.find((point) => point.id === selectedId) ?? null;
  const place = detailPlace ?? selected?.place ?? null;

  function recenter() {
    mapRef.current?.setView([ROSARIO.lat, ROSARIO.lng], ROSARIO_ZOOM);
  }

  return (
    <div className={`cerca-map relative w-full overflow-hidden rounded-2xl bg-[#e7eef2] ${tall ? "cerca-map-tall" : ""}`}>
      <div ref={node} className="cerca-map-canvas" role="application" aria-label="Mapa de Rosario" />
      <button
        type="button"
        onClick={recenter}
        className="absolute top-3 right-3 z-[500] inline-flex min-h-11 items-center gap-1 rounded-full bg-card px-3 text-sm font-semibold text-ink shadow-card"
      >
        <LocateFixed className="size-4 text-olive" aria-hidden />
        Rosario
      </button>
      {points.length === 0 && emptyNote ? (
        <p className="pointer-events-none absolute top-16 right-3 left-3 z-[500] max-w-md rounded-2xl bg-card/95 px-3 py-2 text-sm text-ink shadow-card">
          {emptyNote}
        </p>
      ) : null}
      {popup && selected ? (
        <div className="absolute inset-x-3 bottom-12 z-[500] rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">{selected.label}</p>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => onSelect(null)}
              className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-paper"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          {selected.categories && selected.categories.length > 0 ? (
            <p className="mt-1 text-sm">{selected.categories.join(" · ")}</p>
          ) : null}
          {typeof selected.productCount === "number" ? (
            <p className="mt-1 text-sm">
              {selected.productCount} {selected.productCount === 1 ? "producto" : "productos"}
            </p>
          ) : null}
          {place ? <p className="mt-1 text-sm text-muted">{place}</p> : null}
          <Link
            to="/negocio/$businessId"
            params={{ businessId: selected.id }}
            className="mt-2 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink"
          >
            Ver negocio
          </Link>
        </div>
      ) : null}
    </div>
  );
}

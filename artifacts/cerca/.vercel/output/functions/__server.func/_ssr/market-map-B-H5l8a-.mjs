import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { k as LocateFixed, t as X } from "../_libs/lucide-react.mjs";
import { t as ROSARIO } from "./geo-BwvVDJHB.mjs";
import { t as activeMapTiles } from "./maps-PjfEszOE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/market-map-B-H5l8a-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function validMapPoint(lat, lng) {
	if (lat === null || lng === null) return null;
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
	return {
		lat,
		lng
	};
}
var ROSARIO_ZOOM = 13;
function MarketMap({ points, selectedId, onSelect, popup = false, detailPlace = null, emptyNote = null, tall = false, onPick = null }) {
	const node = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const layerRef = (0, import_react.useRef)(null);
	const onSelectRef = (0, import_react.useRef)(onSelect);
	const onPickRef = (0, import_react.useRef)(onPick);
	const focused = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	onSelectRef.current = onSelect;
	onPickRef.current = onPick;
	(0, import_react.useEffect)(() => {
		const nodeEl = node.current;
		if (!nodeEl) return;
		let removed = false;
		let map = null;
		const redraw = () => {
			const current = mapRef.current;
			const parent = node.current?.parentElement;
			if (node.current && parent && parent.clientHeight > 0) {
				node.current.style.height = `${parent.clientHeight}px`;
				node.current.style.width = `${parent.clientWidth}px`;
			}
			current?.invalidateSize();
		};
		(async () => {
			const L = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
			if (removed || !node.current || mapRef.current) return;
			const host = node.current;
			if (host._leaflet_id) return;
			const tiles = activeMapTiles();
			redraw();
			map = L.map(host, {
				scrollWheelZoom: false,
				zoomControl: true
			}).setView([ROSARIO.lat, ROSARIO.lng], ROSARIO_ZOOM);
			L.tileLayer(tiles.url, {
				attribution: tiles.attribution,
				maxZoom: tiles.maxZoom
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
	const markerKey = points.map((point) => `${point.id}:${point.lat}:${point.lng}:${point.label}:${point.id === selectedId ? 1 : 0}`).join("|");
	const pointsRef = (0, import_react.useRef)(points);
	pointsRef.current = points;
	(0, import_react.useEffect)(() => {
		const map = mapRef.current;
		const layer = layerRef.current;
		if (!ready || !map || !layer) return;
		let dead = false;
		const currentPoints = pointsRef.current;
		(async () => {
			const L = await import("../_libs/leaflet.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
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
					iconAnchor: [14, 14]
				});
				const marker = L.marker([spot.lat, spot.lng], {
					icon,
					title: point.label,
					draggable: Boolean(onPickRef.current)
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
				if (!previous || previous.id !== selected.id || previous.lat !== spot.lat || previous.lng !== spot.lng) map.panTo([spot.lat, spot.lng]);
				focused.current = {
					id: selected.id,
					lat: spot.lat,
					lng: spot.lng
				};
			} else focused.current = null;
		})();
		return () => {
			dead = true;
		};
	}, [
		markerKey,
		ready,
		selectedId
	]);
	const selected = points.find((point) => point.id === selectedId) ?? null;
	const place = detailPlace ?? selected?.place ?? null;
	function recenter() {
		mapRef.current?.setView([ROSARIO.lat, ROSARIO.lng], ROSARIO_ZOOM);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `cerca-map relative w-full overflow-hidden rounded-2xl bg-[#e7eef2] ${tall ? "cerca-map-tall" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: node,
				className: "cerca-map-canvas",
				role: "application",
				"aria-label": "Mapa de Rosario"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: recenter,
				className: "absolute top-3 right-3 z-[500] inline-flex min-h-11 items-center gap-1 rounded-full bg-card px-3 text-sm font-semibold text-ink shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, {
					className: "size-4 text-olive",
					"aria-hidden": true
				}), "Rosario"]
			}),
			points.length === 0 && emptyNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pointer-events-none absolute top-16 right-3 left-3 z-[500] max-w-md rounded-2xl bg-card/95 px-3 py-2 text-sm text-ink shadow-card",
				children: emptyNote
			}) : null,
			popup && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-3 bottom-12 z-[500] rounded-2xl bg-card p-3 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: selected.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Cerrar",
							onClick: () => onSelect(null),
							className: "grid size-11 shrink-0 place-items-center rounded-full hover:bg-paper",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
								className: "size-4",
								"aria-hidden": true
							})
						})]
					}),
					selected.categories && selected.categories.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: selected.categories.join(" · ")
					}) : null,
					typeof selected.productCount === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm",
						children: [
							selected.productCount,
							" ",
							selected.productCount === 1 ? "producto" : "productos"
						]
					}) : null,
					place ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: place
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/negocio/$businessId",
						params: { businessId: selected.id },
						className: "mt-2 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
						children: "Ver negocio"
					})
				]
			}) : null
		]
	});
}
//#endregion
export { validMapPoint as n, MarketMap as t };

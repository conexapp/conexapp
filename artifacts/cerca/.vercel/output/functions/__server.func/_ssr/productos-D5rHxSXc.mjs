import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as RedirectToSignIn, o as Shell, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { t as formatArs } from "./money-DSc2EJ_o.mjs";
import { o as listMyListings } from "./listings-CqC7257q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/productos-D5rHxSXc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	["all", "Todos"],
	["published", "Publicados"],
	["paused", "Pausados"],
	["out_of_stock", "Sin stock"],
	["draft", "Borradores"],
	["archived", "Archivados"]
];
function ProductsPage() {
	const { user, isPending } = useCurrentUserState();
	const [status, setStatus] = (0, import_react.useState)("all");
	const [q, setQ] = (0, import_react.useState)("");
	const [rows, setRows] = (0, import_react.useState)([]);
	function reload(nextStatus = status, nextQ = q) {
		listMyListings({ data: {
			status: nextStatus,
			q: nextQ
		} }).then(setRows).catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo listar."));
	}
	(0, import_react.useEffect)(() => {
		if (user) reload();
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Proveedor"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl",
				children: "Mis productos"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/panel/productos/$listingId",
				params: { listingId: "nuevo" },
				className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-paper",
				children: "Publicar producto"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mb-4 flex flex-col gap-2 sm:flex-row",
			onSubmit: (event) => {
				event.preventDefault();
				reload();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (event) => setQ(event.target.value),
				placeholder: "Buscar en tus productos",
				"aria-label": "Buscar en tus productos",
				className: "min-h-11 flex-1 rounded-full border border-line bg-foam px-4"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "min-h-11 rounded-full border border-ink px-4",
				children: "Buscar"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2 overflow-x-auto text-sm",
			children: FILTERS.map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `min-h-10 shrink-0 rounded-full px-3 ${status === value ? "bg-ink text-paper" : "border border-line"}`,
				onClick: () => {
					setStatus(value);
					reload(value, q);
				},
				children: label
			}, value))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid gap-2",
			children: [rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-2xl border border-line bg-card p-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: status === "all" || status === "published" ? "No tenés productos publicados todavía." : "No hay productos en este filtro."
				}), status === "all" || status === "published" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel/productos/$listingId",
					params: { listingId: "nuevo" },
					className: "mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
					children: "Publicar producto"
				}) : null]
			}) : null, rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/panel/productos/$listingId",
				params: { listingId: row.id },
				className: "grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-card border border-line bg-foam p-3",
				children: [
					row.image_key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: `/api/media/${row.image_key}`,
						alt: "",
						className: "h-16 w-16 rounded-xl object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid h-16 w-16 place-items-center rounded-xl bg-paper text-xs text-muted",
						children: "Sin foto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-medium",
						children: row.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-muted",
						children: [
							row.trade_name,
							row.brand ? ` · ${row.brand}` : "",
							" · ",
							listingStatusLabel(row.status),
							" · stock ",
							row.stock_units
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatArs(Number(row.price_cents))
					})
				]
			}) }, row.id))]
		})
	] });
}
function listingStatusLabel(status) {
	switch (status) {
		case "published": return "Publicado";
		case "paused": return "Pausado";
		case "draft": return "Borrador";
		case "archived": return "Archivado";
		case "out_of_stock": return "Sin stock";
		default: return status;
	}
}
//#endregion
export { ProductsPage as component };

import { o as __toESM } from "../_runtime.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { it as BadgeCheck, l as Store } from "../_libs/lucide-react.mjs";
import { l as Route$16 } from "./router-CvWFEIdL.mjs";
import { o as Shell } from "./shell-CbJDficC.mjs";
import { c as searchMarketplace, o as listPublicBusinesses } from "./public-CpGTpZb5.mjs";
import { t as ConexSelect } from "./controls-DMCQZUQt.mjs";
import { r as CategoryGlyph, t as AllCategoriesGlyph } from "./category-visual-BUjo7Qjd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proveedores-DSrC0MEp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProvidersPage() {
	const search = Route$16.useSearch();
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)(search.q ?? "");
	const [category, setCategory] = (0, import_react.useState)(search.categoria ?? "");
	const [rows, setRows] = (0, import_react.useState)(null);
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [categories, setCategories] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		setQ(search.q ?? "");
		setCategory(search.categoria ?? "");
		setLoadError("");
		listPublicBusinesses({ data: {
			q: search.q ?? "",
			category: search.categoria ?? ""
		} }).then(setRows).catch((error) => {
			setRows([]);
			setLoadError(error instanceof Error ? error.message : "No se pudieron cargar los proveedores.");
		});
	}, [search.q, search.categoria]);
	(0, import_react.useEffect)(() => {
		searchMarketplace({ data: {} }).then((result) => setCategories(result.categories.map((item) => ({
			id: item.id,
			slug: item.slug,
			name: item.name,
			parentId: item.parentId,
			icon: item.icon
		})))).catch(() => setCategories([]));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-olive",
			children: "Proveedores · Rosario"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-4xl font-semibold",
			children: "Encontrá proveedores"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-2xl text-sm text-muted",
			children: "Negocios de Rosario. Si un negocio está en revisión o suspendido, no aparece acá."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto]",
			onSubmit: (event) => {
				event.preventDefault();
				navigate({
					to: "/proveedores",
					search: {
						q: q.trim() || void 0,
						categoria: category || void 0
					}
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Buscar proveedor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: q,
						onChange: (event) => setQ(event.target.value),
						placeholder: "Ej.: ferretería, taladro",
						className: "min-h-11 rounded-full border border-line bg-card px-4"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Categoría", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
						value: category,
						onChange: setCategory,
						ariaLabel: "Categoría",
						placeholder: "Todas",
						options: [{
							value: "",
							label: "Todas",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllCategoriesGlyph, {})
						}, ...categories.filter((item) => !item.parentId).map((item) => ({
							value: item.slug,
							label: item.name,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
								slug: item.slug,
								icon: item.icon
							})
						}))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 self-end rounded-full bg-ink px-4 text-sm font-semibold text-paper",
					children: "Buscar proveedores"
				})
			]
		}),
		loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm",
			role: "alert",
			children: loadError
		}) : null,
		rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: "Cargando proveedores…"
		}) : null,
		rows && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-2xl border border-line bg-card p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-semibold",
					children: "Todavía no hay proveedores para mostrar."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Cuando un negocio se aprueba, aparece en este directorio. Si vendés en Rosario, podés crear el tuyo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel",
					className: "mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
					children: "Crear mi negocio"
				})
			]
		}) : null,
		rows && rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3",
			children: rows.map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 place-items-center rounded-2xl bg-teal/10 text-olive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
							className: "size-5",
							"aria-hidden": true
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: business.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [business.verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 font-medium text-olive",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
										className: "size-4",
										"aria-hidden": true
									}), " Negocio aprobado"]
								}) : "Sin marca de aprobación administrativa", business.categories.length > 0 ? ` · ${business.categories.join(" · ")}` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm",
								children: business.place
							}),
							business.description.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-2 text-sm text-muted",
								children: business.description
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm",
								children: [
									business.products,
									" ",
									business.products === 1 ? "producto publicado" : "productos publicados"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/negocio/$businessId",
						params: { businessId: business.id },
						className: "inline-flex min-h-11 items-center justify-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
						children: "Ver proveedor"
					})
				]
			}, business.id))
		}) : null
	] });
}
//#endregion
export { ProvidersPage as component };

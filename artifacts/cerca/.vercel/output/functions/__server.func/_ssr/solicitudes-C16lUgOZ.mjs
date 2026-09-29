import { o as __toESM } from "../_runtime.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as Route$14 } from "./router-CvWFEIdL.mjs";
import { o as Shell, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { s as listPublicRequests } from "./public-CpGTpZb5.mjs";
import { n as formatWhen, o as requestStatusLabel } from "./labels-BJ2JP56X.mjs";
import { t as ConexSelect } from "./controls-DMCQZUQt.mjs";
import { r as CategoryGlyph, t as AllCategoriesGlyph } from "./category-visual-BUjo7Qjd.mjs";
import { s as createBuyerNeed } from "./trade-DBj1viCc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/solicitudes-C16lUgOZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NeedsPage() {
	const search = Route$14.useSearch();
	const navigate = useNavigate();
	const { user } = useCurrentUserState();
	const [q, setQ] = (0, import_react.useState)(search.q ?? "");
	const [filterCategory, setFilterCategory] = (0, import_react.useState)(search.categoria ?? "");
	const [requests, setRequests] = (0, import_react.useState)(null);
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [title, setTitle] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)("");
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [delivery, setDelivery] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)("");
	function load(nextQ, nextCategory) {
		listPublicRequests({ data: {
			q: nextQ,
			category: nextCategory
		} }).then((result) => {
			setRequests(result.requests);
			setCategories(result.categories);
		}).catch(() => setRequests([]));
	}
	(0, import_react.useEffect)(() => {
		setQ(search.q ?? "");
		setFilterCategory(search.categoria ?? "");
		load(search.q ?? "", search.categoria ?? "");
	}, [search.q, search.categoria]);
	function publish(event) {
		event.preventDefault();
		setError("");
		if (!user) {
			navigate({ to: "/login" });
			return;
		}
		const amount = Number(quantity);
		if (!title.trim()) {
			setError("Escribí qué necesitás conseguir.");
			return;
		}
		if (!Number.isInteger(amount) || amount < 1) {
			setError("Indicá cuántas unidades necesitás.");
			return;
		}
		if (!categoryId) {
			setError("Elegí una categoría para que los proveedores puedan encontrarla.");
			return;
		}
		createBuyerNeed({ data: {
			title: title.trim(),
			notes,
			quantity: amount,
			categoryId,
			delivery
		} }).then(async (created) => {
			toast.success("Tu solicitud fue publicada. Los proveedores podrán responder.");
			setTitle("");
			setQuantity("");
			setNotes("");
			await navigate({
				to: "/solicitud/$requestId",
				params: { requestId: created.id }
			});
		}).catch((cause) => setError(cause instanceof Error ? cause.message : "No se publicó."));
	}
	const roots = categories.filter((item) => !item.parentId);
	const leaves = categories.filter((item) => item.parentId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-olive",
			children: "Rosario"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-4xl font-semibold",
			children: "Publicar lo que necesito"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-2xl text-sm text-muted",
			children: "¿No encontraste lo que buscabas? Publicá lo que necesitás y dejá que los proveedores te respondan. No se muestra tu nombre, teléfono ni dirección."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-6 grid gap-4 rounded-2xl border border-line bg-card p-4 md:p-5",
			onSubmit: publish,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					htmlFor: "conex-need-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "¿Qué necesitás?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							id: "conex-need-title-hint",
							className: "text-muted",
							children: "Ejemplo: necesito 50 remeras personalizadas."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "conex-need-title",
							required: true,
							maxLength: 140,
							value: title,
							"aria-describedby": "conex-need-title-hint",
							onChange: (event) => setTitle(event.target.value),
							placeholder: "Necesito 50 remeras personalizadas",
							className: "min-h-11 rounded-2xl border border-line bg-paper px-3"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						htmlFor: "conex-need-qty",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Cantidad"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								id: "conex-need-qty-hint",
								className: "text-muted",
								children: "Indicá cuántas unidades necesitás."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "conex-need-qty",
								required: true,
								inputMode: "numeric",
								min: 1,
								value: quantity,
								"aria-describedby": "conex-need-qty-hint",
								onChange: (event) => setQuantity(event.target.value),
								placeholder: "50",
								className: "min-h-11 rounded-2xl border border-line bg-paper px-3"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						htmlFor: "conex-need-category",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "Categoría"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								id: "conex-need-category-hint",
								className: "text-muted",
								children: "Elegí dónde se encuentra lo que buscás."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
								id: "conex-need-category",
								value: categoryId,
								describedBy: "conex-need-category-hint",
								required: true,
								placeholder: "Elegí una categoría",
								onChange: setCategoryId,
								options: roots.flatMap((root) => {
									const children = leaves.filter((item) => item.parentId === root.id);
									const rootOption = {
										value: root.id,
										label: root.name,
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
											slug: root.slug,
											icon: root.icon
										})
									};
									if (children.length === 0) return [rootOption];
									return [{
										...rootOption,
										group: root.name
									}, ...children.map((child) => ({
										value: child.id,
										label: child.name,
										group: root.name,
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
											slug: child.slug,
											icon: child.icon,
											parentIcon: root.icon
										})
									}))];
								})
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-sm font-semibold",
							children: "Zona"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "conex-need-mode-hint",
							className: "text-sm text-muted",
							children: "La zona es Rosario. Marcá si preferís que te lo envíen."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							htmlFor: "conex-need-delivery",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "conex-need-delivery",
								type: "checkbox",
								checked: delivery,
								"aria-describedby": "conex-need-mode-hint",
								onChange: (event) => setDelivery(event.target.checked)
							}), "Prefiero entrega en Rosario"]
						}),
						!delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Si no marcás entrega, los proveedores entienden que preferís retirar."
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					htmlFor: "conex-need-notes",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							children: ["Detalles ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal text-muted",
								children: "(opcional)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							id: "conex-need-notes-hint",
							className: "text-muted",
							children: "Contale al proveedor qué necesitás. No escribas teléfono ni dirección: esta nota es pública."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							id: "conex-need-notes",
							maxLength: 1e3,
							value: notes,
							"aria-describedby": "conex-need-notes-hint",
							onChange: (event) => setNotes(event.target.value),
							className: "min-h-24 rounded-2xl border border-line bg-paper px-3 py-2"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Queda visible 14 días. No hace falta dejar teléfono ni dirección."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "text-sm font-medium",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink",
					children: user ? "Publicar lo que necesito" : "Entrá para publicar"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			"aria-labelledby": "solicitudes-lista",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "solicitudes-lista",
					className: "text-2xl font-semibold",
					children: "Lo que otros están buscando"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_14rem_auto]",
					onSubmit: (event) => {
						event.preventDefault();
						navigate({
							to: "/solicitudes",
							search: {
								q: q.trim() || void 0,
								categoria: filterCategory || void 0
							}
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Buscar", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: q,
								onChange: (event) => setQ(event.target.value),
								className: "min-h-11 rounded-full border border-line bg-card px-4"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Categoría", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
								value: filterCategory,
								onChange: setFilterCategory,
								ariaLabel: "Categoría",
								placeholder: "Todas",
								options: [{
									value: "",
									label: "Todas",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllCategoriesGlyph, {})
								}, ...categories.map((item) => {
									const parent = item.parentId ? categories.find((candidate) => candidate.id === item.parentId) : void 0;
									return {
										value: item.slug,
										label: item.name,
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
											slug: item.slug,
											icon: item.icon,
											parentIcon: parent?.icon
										})
									};
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 self-end rounded-full border border-ink px-4 text-sm font-semibold",
							children: "Filtrar"
						})
					]
				}),
				requests === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Cargando…"
				}) : null,
				requests && requests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-2xl border border-line bg-card p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Todavía no hay pedidos publicados."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Cuando alguien publique lo que necesita, va a aparecer en esta lista."
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3",
					children: requests?.map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-xl font-semibold",
									children: request.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: requestStatusLabel(request.status)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"Cantidad: ",
									request.quantity,
									request.categoryName ? ` · ${request.categoryName}` : "",
									` · ${request.city}`,
									request.delivery ? " · prefiere entrega" : " · prefiere retiro"
								]
							}),
							request.notes.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 line-clamp-3 text-sm",
								children: request.notes
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: formatWhen(request.createdAt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/solicitud/$requestId",
								params: { requestId: request.id },
								className: "mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
								children: "Ver pedido"
							})
						]
					}, request.id))
				})
			]
		})
	] });
}
//#endregion
export { NeedsPage as component };

import { o as __toESM } from "./_runtime.mjs";
import { m as publicStandingLabel, u as completionShare } from "./_ssr/seller-profile-B9jvPmNx.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { o as Route$11 } from "./_ssr/router-CvWFEIdL.mjs";
import { d as getMyAccount, o as Shell, y as useCurrentUserState } from "./_ssr/shell-CbJDficC.mjs";
import { t as getBusiness } from "./_ssr/public-CpGTpZb5.mjs";
import { t as formatArs } from "./_ssr/money-DSc2EJ_o.mjs";
import { r as memberSinceLabel, t as businessInitials } from "./_ssr/labels-BJ2JP56X.mjs";
import { t as MarketMap } from "./_ssr/market-map-B-H5l8a-.mjs";
import { t as ConexSelect } from "./_ssr/controls-DMCQZUQt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_businessId-C36_hG49.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BusinessPage() {
	const { businessId } = Route$11.useParams();
	const { user } = useCurrentUserState();
	const [business, setBusiness] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [owns, setOwns] = (0, import_react.useState)(false);
	const [catalogQ, setCatalogQ] = (0, import_react.useState)("");
	const [catalogCategory, setCatalogCategory] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setLoading(true);
		setError("");
		getBusiness({ data: businessId }).then((next) => {
			setBusiness(next);
			document.title = `${next.tradeName} — CONEX`;
		}).catch((cause) => setError(cause instanceof Error ? cause.message : "No se encontró.")).finally(() => setLoading(false));
	}, [businessId]);
	(0, import_react.useEffect)(() => {
		if (!user || !business) return;
		getMyAccount().then((account) => setOwns(account.businesses.some((item) => item.id === business.id))).catch(() => setOwns(false));
	}, [user, business]);
	const catalogCategories = [...new Set((business?.listings ?? []).map((item) => item.categoryName).filter((name) => Boolean(name)))];
	const visibleListings = (business?.listings ?? []).filter((item) => {
		const text = catalogQ.trim().toLocaleLowerCase("es");
		const matchesText = !text || `${item.name} ${item.brand}`.toLocaleLowerCase("es").includes(text);
		const matchesCategory = !catalogCategory || item.categoryName === catalogCategory;
		return matchesText && matchesCategory;
	});
	const since = business ? memberSinceLabel(business.createdAt) : null;
	const standing = business ? publicStandingLabel(business.completedOrders) : null;
	const closedShare = business ? completionShare(business.completedOrders, business.cancelledOrders) : null;
	const place = business ? business.approximate ? [
		business.neighborhood,
		business.city,
		business.province,
		"ubicación aproximada"
	].filter((part) => part && part.trim()).join(" · ") : [
		business.addressLine,
		business.neighborhood,
		business.city,
		business.province
	].filter((part) => part && part.trim()).join(" · ") : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Cargando el negocio…"
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-2xl bg-card p-4 text-sm",
			children: error
		}) : null,
		business ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-2xl border border-line bg-card p-4 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								className: "grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-teal/15 font-display text-xl font-semibold text-olive",
								children: businessInitials(business.tradeName)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold tracking-wide text-olive uppercase",
										children: "Proveedor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-1 text-3xl font-semibold break-words sm:text-4xl",
										children: business.tradeName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm font-medium",
										children: standing?.label
									}),
									standing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: standing.detail
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-sm text-muted",
										children: [
											business.city,
											", ",
											business.province
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-2xl text-sm text-muted",
							children: business.description || "Este negocio todavía no escribió una descripción."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid gap-2 text-sm sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Productos publicados"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: business.listings.length === 1 ? "1 producto publicado" : `${business.listings.length} productos publicados`
								})] }),
								since ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "En CONEX"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: since
								})] }) : null,
								business.completedOrders > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Operaciones completadas"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: business.completedOrders
								})] }) : null,
								business.cancelledOrders > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Operaciones canceladas"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: business.cancelledOrders
								})] }) : null,
								closedShare ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-muted",
										children: "Cierres registrados"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "font-medium",
										children: closedShare
									})]
								}) : null,
								business.disputeCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Reclamos registrados"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: business.disputeCount
								})] }) : null,
								business.reviewCount > 0 && business.avgRating !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Calificación"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "font-medium",
									children: [
										business.avgRating.toLocaleString("es-AR", { maximumFractionDigits: 1 }),
										" / 5 · ",
										business.reviewCount
									]
								})] }) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: business.completedOrders > 0 || business.reviewCount > 0 ? "No hay tiempo de respuesta ni tasa de entrega: CONEX todavía no los registra." : "Sin datos suficientes para calificación, operaciones, tiempo de respuesta o entregas."
						}),
						place ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm break-words",
							children: place
						}) : null,
						business.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Ejemplo de desarrollo"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2 text-sm",
							children: [
								business.offersPickup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-paper px-3 py-1",
									children: "Retiro en el negocio"
								}) : null,
								business.offersDelivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-paper px-3 py-1",
									children: "Entrega"
								}) : null,
								business.mercadoPago ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-paper px-3 py-1",
									children: "Mercado Pago conectado"
								}) : null
							]
						}),
						catalogCategories.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted",
							children: ["Categorías: ", catalogCategories.join(" · ")]
						}) : null,
						business.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm",
							children: ["Teléfono: ", business.phone]
						}) : null,
						business.coverageNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm",
							children: ["Zona declarada: ", business.coverageNote]
						}) : null,
						business.minOrderNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [
								"Compra mínima declarada: ",
								business.minOrderNote,
								". No se exige sola al consultar."
							]
						}) : null,
						business.sellsWholesale || business.sellsRetail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: [business.sellsWholesale ? "Mayorista" : "", business.sellsRetail ? "Minorista" : ""].filter(Boolean).join(" · ")
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "Para consultar un producto, abrilo y enviá tu mensaje."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#catalogo",
								className: "inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
								children: "Ver productos"
							}), owns ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/panel",
								className: "inline-flex min-h-11 items-center text-sm font-semibold text-olive",
								children: "Editar mi negocio"
							}) : null]
						})
					]
				}), business.lat !== null && business.lng !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketMap, {
					points: [{
						id: business.id,
						lat: business.lat,
						lng: business.lng,
						label: business.tradeName,
						place: business.neighborhood
					}],
					selectedId: null,
					onSelect: () => void 0
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl bg-card p-4 text-sm text-muted",
					children: "Este negocio todavía no publicó su ubicación."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "catalogo",
				className: "scroll-mt-36",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-2xl font-semibold",
						children: ["Productos de ", business.tradeName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Para consultar uno, abrilo y enviá tu mensaje."
					}),
					business.listings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-2xl bg-card p-5 shadow-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "Este negocio todavía no publicó productos."
						}), owns ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/panel/productos/$listingId",
							params: { listingId: "nuevo" },
							className: "mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
							children: "Publicar producto"
						}) : null]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 grid gap-2 sm:grid-cols-2",
						onSubmit: (event) => event.preventDefault(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Buscar en este negocio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: catalogQ,
								onChange: (event) => setCatalogQ(event.target.value),
								placeholder: "Nombre o marca",
								className: "min-h-11 rounded-full border border-line bg-card px-4"
							})]
						}), catalogCategories.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Categoría del catálogo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
								value: catalogCategory,
								onChange: setCatalogCategory,
								ariaLabel: "Categoría del catálogo",
								placeholder: "Todas",
								options: [{
									value: "",
									label: "Todas"
								}, ...catalogCategories.map((name) => ({
									value: name,
									label: name
								}))]
							})]
						}) : null]
					}), visibleListings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "Ningún producto de este proveedor coincide con esa búsqueda."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4",
						children: visibleListings.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex flex-col overflow-hidden rounded-2xl bg-card shadow-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/producto/$productId",
								params: { productId: listing.id },
								className: "block aspect-square bg-paper",
								children: listing.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: listing.imageUrl,
									alt: "",
									className: "h-full w-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-full place-items-center text-sm text-muted",
									children: "Sin foto"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-1 flex-col gap-1 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "line-clamp-2 text-sm font-semibold",
										children: listing.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-display text-xl font-semibold tabular-nums",
										children: [
											formatArs(listing.priceCents),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-medium text-muted",
												children: ["/ ", listing.unit]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [listing.stockUnits > 0 ? `Stock ${listing.stockUnits}` : "Sin stock", listing.categoryName ? ` · ${listing.categoryName}` : ""]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/producto/$productId",
										params: { productId: listing.id },
										className: "mt-2 inline-flex min-h-11 items-center justify-center rounded-full bg-ember text-sm font-semibold text-ink",
										children: "Ver producto"
									})
								]
							})]
						}, listing.id))
					})] })
				]
			})]
		}) : null
	] });
}
//#endregion
export { BusinessPage as component };

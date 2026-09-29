import { o as __toESM } from "../_runtime.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { it as BadgeCheck, l as Store, m as SlidersHorizontal, o as Truck, v as Search } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as Route$24 } from "./router-CvWFEIdL.mjs";
import { o as Shell, p as loadDevelopmentSeed, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { a as listMapBusinesses, c as searchMarketplace, o as listPublicBusinesses, r as getPlatformStatus, s as listPublicRequests, t as getBusiness } from "./public-CpGTpZb5.mjs";
import { n as parseArsToCents, t as formatArs } from "./money-DSc2EJ_o.mjs";
import { n as formatWhen, o as requestStatusLabel } from "./labels-BJ2JP56X.mjs";
import { n as validMapPoint, t as MarketMap } from "./market-map-B-H5l8a-.mjs";
import { t as ConexSelect } from "./controls-DMCQZUQt.mjs";
import { a as categoryIcon, i as browseCategories, n as CategoryCard, r as CategoryGlyph, t as AllCategoriesGlyph } from "./category-visual-BUjo7Qjd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-eHONtrQD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const search = Route$24.useSearch();
	const navigate = useNavigate();
	const { user } = useCurrentUserState();
	const [q, setQ] = (0, import_react.useState)(search.q ?? "");
	const [category, setCategory] = (0, import_react.useState)(search.categoria ?? "");
	const [sort, setSort] = (0, import_react.useState)("price_asc");
	const [delivery, setDelivery] = (0, import_react.useState)(false);
	const [pickup, setPickup] = (0, import_react.useState)(false);
	const [maxPrice, setMaxPrice] = (0, import_react.useState)("");
	const [maxKm, setMaxKm] = (0, import_react.useState)("");
	const [filtersOpen, setFiltersOpen] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [directory, setDirectory] = (0, import_react.useState)([]);
	const [needs, setNeeds] = (0, import_react.useState)([]);
	const [demoAllowed, setDemoAllowed] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [mapDraft, setMapDraft] = (0, import_react.useState)("");
	const [mapQuery, setMapQuery] = (0, import_react.useState)("");
	const [mapCategory, setMapCategory] = (0, import_react.useState)("");
	const [onlyWithProducts, setOnlyWithProducts] = (0, import_react.useState)(false);
	const [mapRows, setMapRows] = (0, import_react.useState)([]);
	const [mapLoading, setMapLoading] = (0, import_react.useState)(true);
	const [mapSelected, setMapSelected] = (0, import_react.useState)(null);
	const [placeLabel, setPlaceLabel] = (0, import_react.useState)(null);
	const [spots, setSpots] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(true);
	async function execute(nextQ, nextCategory) {
		setLoading(true);
		const filtered = Boolean(nextQ || nextCategory);
		try {
			const [data, businesses, openNeeds] = await Promise.all([
				searchMarketplace({ data: {
					q: nextQ,
					category: nextCategory,
					sort,
					delivery,
					pickup,
					inStock: true,
					maxPriceCents: maxPrice ? parseArsToCents(maxPrice) : null,
					maxDistanceKm: maxKm ? Number(maxKm) : null
				} }),
				filtered ? listPublicBusinesses({ data: {
					q: nextQ,
					category: nextCategory
				} }) : Promise.resolve([]),
				filtered ? listPublicRequests({ data: {
					q: nextQ,
					category: nextCategory
				} }).then((payload) => payload.requests) : Promise.resolve([])
			]);
			setResult(data);
			setDirectory(businesses);
			setNeeds(openNeeds);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo buscar.");
		} finally {
			setLoading(false);
		}
	}
	(0, import_react.useEffect)(() => {
		getPlatformStatus().then((status) => setDemoAllowed(status.demoSeedAllowed));
	}, []);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setMapLoading(true);
		listMapBusinesses({ data: {
			q: mapQuery,
			category: mapCategory,
			onlyWithProducts
		} }).then((rows) => {
			if (!cancelled) setMapRows(rows);
		}).catch(() => {
			if (!cancelled) setMapRows([]);
		}).finally(() => {
			if (!cancelled) setMapLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [
		mapQuery,
		mapCategory,
		onlyWithProducts
	]);
	(0, import_react.useEffect)(() => {
		const nextQ = search.q ?? "";
		const nextCategory = search.categoria ?? "";
		setQ(nextQ);
		setCategory(nextCategory);
		execute(nextQ, nextCategory);
	}, [search.q, search.categoria]);
	const suppliers = (0, import_react.useMemo)(() => {
		const seen = /* @__PURE__ */ new Map();
		for (const listing of result?.listings ?? []) {
			const current = seen.get(listing.businessId);
			if (!current) seen.set(listing.businessId, {
				id: listing.businessId,
				name: listing.businessName,
				neighborhood: listing.neighborhood,
				distanceKm: listing.distanceKm,
				verified: listing.verified,
				count: 1,
				lat: listing.lat,
				lng: listing.lng,
				categories: [listing.categoryName]
			});
			else {
				current.count += 1;
				if (!current.categories.includes(listing.categoryName)) current.categories.push(listing.categoryName);
				if (current.lat === null && listing.lat !== null) current.lat = listing.lat;
				if (current.lng === null && listing.lng !== null) current.lng = listing.lng;
			}
		}
		return [...seen.values()];
	}, [result]);
	const points = (0, import_react.useMemo)(() => {
		const next = [];
		for (const supplier of suppliers) {
			const override = Object.prototype.hasOwnProperty.call(spots, supplier.id) ? spots[supplier.id] : void 0;
			const spot = override === void 0 ? validMapPoint(supplier.lat, supplier.lng) : override;
			if (!spot) continue;
			next.push({
				id: supplier.id,
				lat: spot.lat,
				lng: spot.lng,
				label: supplier.name,
				place: supplier.neighborhood?.trim() ? supplier.neighborhood.trim() : null,
				distanceKm: supplier.distanceKm,
				categories: supplier.categories
			});
		}
		return next;
	}, [suppliers, spots]);
	(0, import_react.useEffect)(() => {
		setSpots({});
		setPlaceLabel(null);
	}, [result]);
	(0, import_react.useEffect)(() => {
		if (selected && !suppliers.some((supplier) => supplier.id === selected)) {
			setSelected(null);
			setPlaceLabel(null);
		}
	}, [selected, suppliers]);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		let cancelled = false;
		getBusiness({ data: selected }).then((business) => {
			if (cancelled) return;
			const spot = validMapPoint(business.lat, business.lng);
			setSpots((current) => ({
				...current,
				[selected]: spot
			}));
			const parts = [
				business.addressLine,
				business.neighborhood,
				business.city
			].map((part) => typeof part === "string" ? part.trim() : "").filter((part) => part.length > 0);
			setPlaceLabel(parts.length > 0 ? parts.join(" · ") : null);
			if (!spot) setSelected(null);
		}).catch(() => {
			if (!cancelled) setPlaceLabel(null);
		});
		return () => {
			cancelled = true;
		};
	}, [selected, result]);
	const listings = result?.listings ?? [];
	const activeCategoryName = result?.categories.find((item) => item.slug === category)?.name;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-olive",
					children: "CONEX · Rosario"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-4xl leading-tight font-semibold tracking-tight md:text-5xl",
					children: "Todo lo que necesitás, cerca tuyo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-base text-muted md:text-lg",
					children: "Buscá productos, proveedores o lo que necesitás."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6",
					onSubmit: (event) => {
						event.preventDefault();
						navigate({
							to: "/",
							search: {
								q: q.trim() || void 0,
								categoria: category || void 0
							},
							hash: "productos"
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-2",
						htmlFor: "conex-home-search",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-semibold",
							children: "¿Qué estás buscando?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex min-h-14 items-center gap-3 rounded-full border border-line bg-card px-4 shadow-card focus-within:border-teal sm:min-h-16 sm:px-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								className: "size-5 shrink-0 text-teal",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "conex-home-search",
								value: q,
								onChange: (event) => setQ(event.target.value),
								placeholder: "Buscar productos, proveedores o servicios",
								className: "min-w-0 flex-1 bg-transparent text-base outline-none"
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "min-h-12 rounded-full bg-ember px-5 text-sm font-semibold text-ink",
								children: "Buscar"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/solicitudes",
								className: "inline-flex min-h-12 items-center justify-center rounded-full border border-ink bg-card px-5 text-sm font-semibold",
								children: "Publicar lo que necesito"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/panel",
								className: "inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-paper",
								children: "Tengo un negocio"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					hash: "mapa",
					search: {
						q: q.trim() || void 0,
						categoria: category || void 0
					},
					className: "mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
					children: "Ver proveedores en el mapa"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-14",
			"aria-labelledby": "categorias-titulo",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "categorias-titulo",
					className: "text-2xl font-semibold",
					children: "Explorá por categoría"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Elegí una categoría para ver productos y proveedores."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/categorias",
					className: "inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-olive",
					children: "Ver todas"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "overflow-hidden rounded-2xl border border-line bg-card lg:max-w-md",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": !category,
						onClick: () => {
							navigate({
								to: "/",
								search: {
									q: q.trim() || void 0,
									categoria: void 0
								},
								hash: "productos"
							});
						},
						className: `flex min-h-11 w-full items-center gap-3 border-l-2 px-3 py-2 text-left text-sm leading-snug font-semibold whitespace-normal transition hover:bg-paper ${!category ? "border-teal bg-teal/10" : "border-transparent"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: !category ? "text-teal" : "text-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllCategoriesGlyph, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1",
							children: "Todas las categorías"
						})]
					})
				}), browseCategories(result?.categories ?? []).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
						slug: item.slug,
						name: item.name,
						icon: item.icon,
						active: category === item.slug,
						onSelect: () => {
							const next = category === item.slug ? void 0 : item.slug;
							navigate({
								to: "/",
								search: {
									q: q.trim() || void 0,
									categoria: next
								},
								hash: "productos"
							});
						}
					})
				}, item.id))]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "mapa",
			className: "mt-14 scroll-mt-36",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-semibold",
						children: "Encontrá proveedores cerca tuyo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: "El mapa muestra Rosario. Los negocios aprobados con ubicación aparecen acá."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketMap, {
					tall: true,
					popup: true,
					points: mapRows.map((row) => ({
						id: row.id,
						lat: row.lat,
						lng: row.lng,
						label: row.name,
						place: row.place,
						categories: row.category ? [row.category] : [],
						productCount: row.products
					})),
					selectedId: mapSelected,
					onSelect: setMapSelected,
					emptyNote: mapLoading ? "Cargando proveedores…" : "Todavía no hay proveedores ubicados en esta zona."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center",
					onSubmit: (event) => {
						event.preventDefault();
						setMapQuery(mapDraft.trim());
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: mapDraft,
							onChange: (event) => setMapDraft(event.target.value),
							placeholder: "Buscar un negocio en el mapa",
							"aria-label": "Buscar un negocio en el mapa",
							className: "min-h-11 rounded-full border border-line bg-card px-4 text-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
							value: mapCategory,
							onChange: setMapCategory,
							ariaLabel: "Categoría del mapa",
							placeholder: "Todas las categorías",
							options: [{
								value: "",
								label: "Todas las categorías",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllCategoriesGlyph, {})
							}, ...(result?.categories ?? []).filter((item) => !item.parentId).map((item) => ({
								value: item.slug,
								label: item.name,
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
									slug: item.slug,
									icon: item.icon
								})
							}))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper",
							children: "Buscar en el mapa"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-2 flex min-h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: onlyWithProducts,
						onChange: (event) => setOnlyWithProducts(event.target.checked)
					}), "Solo negocios con productos publicados"]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "productos",
			className: "mt-14 scroll-mt-36",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-end justify-between gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-semibold",
							children: search.q || category ? "Productos" : "Productos que podés encontrar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [activeCategoryName ? activeCategoryName : "De proveedores de Rosario", search.q ? ` · “${search.q}”` : ""]
						})] }),
						search.categoria ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "cx-chip",
							onClick: () => void navigate({
								to: "/",
								search: { q: search.q },
								hash: "productos"
							}),
							children: [
								activeCategoryName ?? "Categoría",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "×"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Quitar categoría"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium",
							onClick: () => setFiltersOpen((open) => !open),
							"aria-expanded": filtersOpen,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
								className: "size-4",
								"aria-hidden": true
							}), "Filtros"]
						})
					]
				}),
				filtersOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mb-4 grid gap-2 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-6",
					onSubmit: (event) => {
						event.preventDefault();
						navigate({
							to: "/",
							search: {
								q: q.trim() || void 0,
								categoria: category || void 0
							},
							hash: "productos"
						});
						execute(q.trim(), category);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
							value: category,
							onChange: setCategory,
							ariaLabel: "Categoría",
							placeholder: "Todas las categorías",
							options: [{
								value: "",
								label: "Todas las categorías",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllCategoriesGlyph, {})
							}, ...(result?.categories ?? []).map((item) => {
								const parent = item.parentId ? result?.categories.find((candidate) => candidate.id === item.parentId) : void 0;
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
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
							value: sort,
							onChange: (next) => setSort(next),
							ariaLabel: "Orden",
							options: [
								{
									value: "price_asc",
									label: "Menor precio"
								},
								{
									value: "price_desc",
									label: "Mayor precio"
								},
								{
									value: "distance",
									label: "Más cerca del centro"
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: maxPrice,
							onChange: (event) => setMaxPrice(event.target.value),
							placeholder: "Precio máximo",
							"aria-label": "Precio máximo",
							className: "min-h-11 rounded-full border border-line bg-paper px-3 text-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: maxKm,
							onChange: (event) => setMaxKm(event.target.value),
							placeholder: "Km máx.",
							"aria-label": "Distancia máxima",
							className: "min-h-11 rounded-full border border-line bg-paper px-3 text-sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: delivery,
								onChange: (event) => setDelivery(event.target.checked)
							}), "Entrega"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: pickup,
								onChange: (event) => setPickup(event.target.checked)
							}), "Retiro"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper sm:col-span-2 lg:col-span-1",
							children: "Aplicar"
						})
					]
				}) : null,
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: Array.from({ length: 4 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-72 animate-pulse rounded-2xl bg-card" }, index))
				}) : null,
				!loading && listings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card px-5 py-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl font-semibold",
							children: search.q || category ? directory.length > 0 ? "Encontramos proveedores que pueden ayudarte." : "No encontramos exactamente lo que buscás." : "Todavía no hay productos para mostrar."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm text-muted",
							children: search.q || category ? directory.length > 0 ? "No hay un producto con ese nombre, pero estos negocios pueden responderte." : "¿No encontraste lo que buscabas? Publicá lo que necesitás y dejá que los proveedores te respondan." : "Cuando los proveedores publiquen sus productos, van a aparecer acá."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [search.q || category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold",
								onClick: () => {
									setQ("");
									setCategory("");
									navigate({
										to: "/",
										search: {},
										hash: "productos"
									});
								},
								children: "Limpiar búsqueda"
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/solicitudes",
								className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
								children: "Publicar lo que necesito"
							})]
						}),
						demoAllowed && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-4 text-sm text-muted underline-offset-2 hover:underline",
							onClick: () => {
								loadDevelopmentSeed().then(() => {
									toast.success("Ejemplos guardados como desarrollo. No aparecen en la búsqueda pública.");
									return execute(q, category);
								}).catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo cargar."));
							},
							children: "Cargar ejemplos de desarrollo"
						}) : null
					]
				}) : null,
				!loading && listings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4",
					children: listings.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { listing }, listing.id))
				}) : null
			]
		}),
		(result?.comparisons.length ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Mismo producto, varios proveedores"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Solo se agrupan si cada proveedor usó la misma ancla de catálogo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-3",
					children: result?.comparisons.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xl font-semibold",
							children: group.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex gap-3 overflow-x-auto pb-1",
							children: listings.filter((listing) => group.listingIds.includes(listing.id)).map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/producto/$productId",
								params: { productId: listing.id },
								className: "w-56 shrink-0 rounded-2xl bg-paper p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: listing.businessName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-display text-2xl tabular-nums",
										children: formatArs(listing.priceCents)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: ["/ ", listing.unit]
									})
								]
							}, listing.id))
						})]
					}, group.standardProductId))
				})
			]
		}) : null,
		!loading && (search.q || category) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "proveedores",
			className: "mt-14 scroll-mt-36",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Proveedores"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Negocios de Rosario relacionados con esta búsqueda."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/proveedores",
					search: {
						q: search.q,
						categoria: category || void 0
					},
					className: "text-sm font-semibold text-olive",
					children: "Ver directorio"
				})]
			}), directory.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl border border-line bg-card p-4 text-sm text-muted",
				children: "No hay proveedores para esta búsqueda."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: directory.map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "flex flex-col gap-2 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: business.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							business.place,
							business.verified ? " · negocio aprobado" : "",
							` · ${business.products} ${business.products === 1 ? "producto" : "productos"}`
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/negocio/$businessId",
						params: { businessId: business.id },
						className: "inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-semibold",
						children: "Ver proveedor"
					})]
				}, business.id))
			})]
		}) : null,
		!loading && (search.q || category) && needs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "solicitudes-resultado",
			className: "mt-14 scroll-mt-36",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Lo que otros están buscando"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Pedidos públicos, sin nombre ni contacto."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/solicitudes",
					search: {
						q: search.q,
						categoria: category || void 0
					},
					className: "text-sm font-semibold text-olive",
					children: "Ver todos"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: needs.map((need) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: need.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Cantidad: ",
								need.quantity,
								need.categoryName ? ` · ${need.categoryName}` : "",
								` · ${need.city}`,
								` · ${requestStatusLabel(need.status)}`,
								formatWhen(need.createdAt) ? ` · ${formatWhen(need.createdAt)}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/solicitud/$requestId",
							params: { requestId: need.id },
							className: "mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
							children: "Ver pedido"
						})
					]
				}, need.id))
			})]
		}) : null,
		!loading && !(search.q || category) && suppliers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "proveedores",
			className: "mt-14 scroll-mt-36",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Proveedores con productos"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Negocios que ya publicaron algo."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3",
				children: suppliers.map((supplier) => {
					const located = points.some((point) => point.id === supplier.id);
					const active = selected === supplier.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: `flex flex-col gap-2 rounded-2xl border bg-card p-4 ${active ? "border-teal" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !located,
							onClick: () => setSelected(supplier.id),
							className: "flex items-start gap-3 text-left disabled:cursor-default",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-11 shrink-0 place-items-center rounded-xl bg-teal/10 text-olive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
									className: "size-5",
									"aria-hidden": true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-semibold",
									children: supplier.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 block text-sm text-muted",
									children: [
										supplier.neighborhood ? supplier.neighborhood : null,
										supplier.neighborhood && supplier.distanceKm !== null ? " · " : "",
										supplier.distanceKm !== null ? `${supplier.distanceKm} km` : "",
										!located ? `${supplier.neighborhood || supplier.distanceKm !== null ? " · " : ""}sin ubicación en el mapa` : ""
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-1 block text-sm",
									children: [
										supplier.count,
										" ",
										supplier.count === 1 ? "producto" : "productos",
										supplier.verified ? " · negocio aprobado" : ""
									]
								})
							] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/negocio/$businessId",
							params: { businessId: supplier.id },
							className: "inline-flex min-h-11 items-center self-start rounded-full bg-paper px-4 text-sm font-semibold",
							children: "Ver proveedor"
						})]
					}, supplier.id);
				})
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 overflow-hidden rounded-3xl bg-ink text-paper",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "¿Tenés un negocio?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-paper/80",
					children: "Publicá tus productos y conectá con compradores de Rosario. El negocio se revisa antes de aparecer en el mapa y en la búsqueda."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel",
					className: "inline-flex min-h-12 items-center justify-center rounded-full bg-sun px-5 text-sm font-semibold text-ink",
					children: "Crear mi negocio"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-14",
			"aria-labelledby": "confianza-titulo",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "confianza-titulo",
				className: "text-2xl font-semibold",
				children: "Por qué CONEX"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
								className: "size-5 text-teal",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 text-lg font-semibold",
								children: "Negocios revisados"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Un negocio nuevo queda en revisión hasta que se aprueba. Recién entonces puede publicar y aparecer."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, {
								className: "size-5 text-teal",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 text-lg font-semibold",
								children: "Consultá y comprá"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Consultás un producto o publicás lo que necesitás. Si aceptás una respuesta sobre un producto, se arma una compra con ese proveedor."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/solicitudes",
								className: "mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
								children: "Publicar lo que necesito"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-2xl border border-line bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
								className: "size-5 text-teal",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 text-lg font-semibold",
								children: "Protección"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: "Si algo no corresponde, se puede reportar. La protección sigue lo que quedó registrado en la compra."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/proteccion",
								className: "mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
								children: "Cómo te protege"
							})
						]
					})
				]
			})]
		})
	] });
}
function ProductCard({ listing }) {
	const Icon = categoryIcon(listing.categorySlug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card transition hover:-translate-y-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/producto/$productId",
			params: { productId: listing.id },
			"aria-label": `Ver ${listing.name}`,
			className: "relative block aspect-square bg-paper",
			children: listing.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: listing.imageUrl,
				alt: "",
				className: "h-full w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-full place-items-center text-olive",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-10",
					"aria-hidden": true
				})
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-1 p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-snug text-muted",
					children: listing.brand || listing.categoryName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "line-clamp-2 min-h-10 text-sm font-semibold leading-snug",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/producto/$productId",
						params: { productId: listing.id },
						children: listing.name
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-lg leading-none font-semibold tabular-nums",
					children: formatArs(listing.priceCents)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						"/ ",
						listing.unit,
						listing.stockUnits > 0 ? ` · stock ${listing.stockUnits}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate text-sm",
					children: listing.businessName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "truncate text-xs text-muted",
					children: [listing.neighborhood ?? "Rosario", listing.distanceKm !== null ? ` · ${listing.distanceKm} km` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-1",
					children: [
						listing.delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-sun px-2 py-1 text-xs font-medium text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, {
								className: "size-3",
								"aria-hidden": true
							}), "Entrega"]
						}) : null,
						listing.pickup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "rounded-full bg-paper px-2 py-1 text-xs font-medium",
							children: "Retiro"
						}) : null,
						listing.verified ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-1 text-xs font-medium text-olive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
								className: "size-3",
								"aria-hidden": true
							}), "Negocio aprobado"]
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/producto/$productId",
					params: { productId: listing.id },
					className: "mt-auto inline-flex min-h-11 items-center justify-center rounded-full border border-line text-sm font-semibold",
					children: "Ver producto"
				})
			]
		})]
	});
}
//#endregion
export { Home as component };

import { o as __toESM } from "../_runtime.mjs";
import { t as fold } from "./text-BUH6vDdb.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { J as ChevronLeft, K as ClipboardList, h as ShoppingBag, l as Store, q as ChevronRight, v as Search } from "../_libs/lucide-react.mjs";
import { u as Route$22 } from "./router-CvWFEIdL.mjs";
import { o as Shell } from "./shell-CbJDficC.mjs";
import { c as searchMarketplace, o as listPublicBusinesses, s as listPublicRequests } from "./public-CpGTpZb5.mjs";
import { t as formatArs } from "./money-DSc2EJ_o.mjs";
import { o as categoryRowClass, r as CategoryGlyph, t as AllCategoriesGlyph } from "./category-visual-BUjo7Qjd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categorias-6uFee7s2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategorySearch({ query, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
		className: "mt-4",
		role: "search",
		onSubmit: (event) => event.preventDefault(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			htmlFor: "conex-category-search",
			className: "flex min-h-14 items-center gap-3 rounded-full border border-line bg-card px-4 shadow-card focus-within:border-teal",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
					className: "size-5 shrink-0 text-teal",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: "Buscar una categoría"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "conex-category-search",
					name: "categoria",
					type: "search",
					value: query,
					autoComplete: "off",
					placeholder: "Buscar una categoría",
					onChange: (event) => onChange(event.target.value),
					className: "min-w-0 flex-1 bg-transparent text-base outline-none"
				})
			]
		})
	});
}
function categoryRoots(categories) {
	return categories.filter((category) => !category.parentId);
}
function categoryChildren(categories, parentId) {
	return categories.filter((category) => category.parentId === parentId).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "es"));
}
/** Busca solo en nombre y slug. No mira productos ni proveedores. */
function categoryMatchesQuery(category, query) {
	const needle = fold(query);
	if (!needle) return false;
	const name = fold(category.name);
	const slug = fold(category.slug).replace(/-/g, " ");
	return name.includes(needle) || slug.includes(needle);
}
function CategoriesPage() {
	const search = Route$22.useSearch();
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [query, setQuery] = (0, import_react.useState)("");
	const [products, setProducts] = (0, import_react.useState)(null);
	const [providers, setProviders] = (0, import_react.useState)(null);
	const [needs, setNeeds] = (0, import_react.useState)(null);
	const [detailError, setDetailError] = (0, import_react.useState)("");
	const [detailLoading, setDetailLoading] = (0, import_react.useState)(false);
	function loadTree() {
		setReady(false);
		setLoadError("");
		searchMarketplace({ data: {} }).then((result) => {
			setCategories(result.categories);
			setLoadError("");
		}).catch((error) => {
			setCategories([]);
			setLoadError(error instanceof Error ? error.message : "No se pudieron cargar las categorías.");
		}).finally(() => setReady(true));
	}
	(0, import_react.useEffect)(() => {
		loadTree();
	}, []);
	const selected = search.categoria ? categories.find((category) => category.slug === search.categoria) ?? null : null;
	const missing = ready && !loadError && Boolean(search.categoria) && !selected;
	const parent = selected?.parentId ? categories.find((category) => category.id === selected.parentId) ?? null : null;
	const children = selected ? categoryChildren(categories, selected.id) : [];
	const roots = categoryRoots(categories);
	const featured = roots.filter((category) => category.featured);
	const others = roots.filter((category) => !category.featured);
	const needle = query.trim();
	const matches = needle ? categories.filter((category) => categoryMatchesQuery(category, needle)) : [];
	(0, import_react.useEffect)(() => {
		if (!selected) {
			setProducts(null);
			setProviders(null);
			setNeeds(null);
			setDetailError("");
			setDetailLoading(false);
			return;
		}
		let cancelled = false;
		setDetailLoading(true);
		setDetailError("");
		setProducts(null);
		setProviders(null);
		setNeeds(null);
		Promise.all([
			searchMarketplace({ data: {
				category: selected.slug,
				inStock: true
			} }),
			listPublicBusinesses({ data: { category: selected.slug } }),
			listPublicRequests({ data: { category: selected.slug } })
		]).then(([market, businesses, requests]) => {
			if (cancelled) return;
			setProducts(market.listings);
			setProviders(businesses);
			setNeeds(requests.requests);
		}).catch((error) => {
			if (cancelled) return;
			setDetailError(error instanceof Error ? error.message : "No se pudo leer esta categoría.");
		}).finally(() => {
			if (!cancelled) setDetailLoading(false);
		});
		return () => {
			cancelled = true;
		};
	}, [selected]);
	(0, import_react.useEffect)(() => {
		setQuery("");
	}, [search.categoria]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "mb-4 hidden min-w-0 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 text-sm font-semibold",
				children: "Categorías"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CategoryList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/categorias",
					search: { categoria: void 0 },
					"aria-current": !selected ? "page" : void 0,
					className: categoryRowClass(!selected),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: !selected ? "text-teal" : "text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllCategoriesGlyph, {})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 font-semibold",
						children: "Todas las categorías"
					})]
				})
			}), roots.map((category) => {
				const active = selected?.id === category.id || parent?.id === category.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
					name: category.name,
					slug: category.slug,
					icon: category.icon,
					active,
					to: "/categorias",
					search: { categoria: category.slug }
				}, category.id);
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				!selected || needle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-olive",
						children: "CONEX"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 text-3xl font-semibold tracking-tight md:text-4xl",
						children: "Categorías"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted md:text-base",
						children: "Explorá productos y proveedores por categoría."
					})
				] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySearch, {
					query,
					onChange: setQuery
				}),
				!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySkeleton, {}) : null,
				ready && loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadError, {
					message: loadError,
					onRetry: loadTree
				}) : null,
				missing && !needle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyNote, {
					title: "No encontramos esa categoría.",
					body: "Probá con otro término o volvé al listado."
				}) : null,
				ready && !loadError && needle ? matches.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-4",
					"aria-labelledby": "resultado-categorias",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "resultado-categorias",
						className: "mb-2 text-sm font-semibold text-muted",
						children: "Categorías y subcategorías"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryList, { children: matches.map((category) => {
						const owner = category.parentId ? categories.find((item) => item.id === category.parentId) : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
							name: category.name,
							hint: owner ? owner.name : "Categoría",
							slug: category.slug,
							icon: category.icon,
							parentIcon: owner?.icon,
							to: "/categorias",
							search: { categoria: category.slug }
						}, category.id);
					}) })]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyNote, {
					title: "No encontramos esa categoría.",
					body: "Probá con otro término."
				}) : null,
				ready && !loadError && !needle && selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryExplorer, {
					category: selected,
					parent,
					children,
					products,
					providers,
					needs,
					loading: detailLoading,
					error: detailError
				}) : null,
				ready && !loadError && !needle && !selected && !missing && roots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyNote, {
					title: "Todavía no hay categorías activas.",
					body: "Cuando se publiquen en el catálogo, van a aparecer acá."
				}) : null,
				ready && !loadError && !needle && !selected && featured.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-5 lg:hidden",
					"aria-labelledby": "todas-categorias",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "todas-categorias",
						className: "mb-2 text-sm font-semibold",
						children: "Todas las categorías"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryList, { children: featured.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
						name: category.name,
						slug: category.slug,
						icon: category.icon,
						to: "/categorias",
						search: { categoria: category.slug }
					}, category.id)) })]
				}) : null,
				ready && !loadError && !needle && !selected && others.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6 lg:hidden",
					"aria-labelledby": "otras-categorias",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "otras-categorias",
						className: "mb-2 text-sm font-semibold",
						children: "Otras categorías"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryList, { children: others.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
						name: category.name,
						slug: category.slug,
						icon: category.icon,
						to: "/categorias",
						search: { categoria: category.slug }
					}, category.id)) })]
				}) : null
			]
		})]
	}) });
}
function CategoryExplorer({ category, parent, children, products, providers, needs, loading, error }) {
	const back = parent ? {
		label: parent.name,
		search: { categoria: parent.slug }
	} : {
		label: "Todas las categorías",
		search: { categoria: void 0 }
	};
	const parentIcon = parent?.icon ?? category.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Migas",
			className: "mb-3 hidden flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted md:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/categorias",
					search: { categoria: void 0 },
					className: "inline-flex min-h-11 items-center hover:text-ink",
					children: "Categorías"
				}),
				parent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: "/"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/categorias",
					search: { categoria: parent.slug },
					className: "inline-flex min-h-11 items-center hover:text-ink",
					children: parent.name
				})] }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: "/"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium text-ink",
					"aria-current": "page",
					children: category.name
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/categorias",
			search: back.search,
			className: "inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-olive md:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
				className: "size-4",
				"aria-hidden": true
			}), back.label]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 text-3xl font-semibold tracking-tight md:text-4xl",
			children: category.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted md:text-base",
			children: children.length > 0 ? "Elegí una subcategoría." : "Esta categoría no tiene subcategorías. Podés ver sus productos o sus proveedores."
		}),
		children.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-4",
			"aria-labelledby": "subcategorias",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "subcategorias",
				className: "sr-only",
				children: "Subcategorías"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryList, { children: children.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryRow, {
				name: child.name,
				slug: child.slug,
				icon: child.icon,
				parentIcon,
				to: "/categorias",
				search: { categoria: child.slug }
			}, child.id)) })]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-2 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionLink, {
					to: "/",
					search: {
						categoria: category.slug,
						q: void 0
					},
					hash: "productos",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
						className: "size-5",
						"aria-hidden": true
					}),
					label: "Ver productos de esta categoría"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionLink, {
					to: "/proveedores",
					search: {
						categoria: category.slug,
						q: void 0
					},
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, {
						className: "size-5",
						"aria-hidden": true
					}),
					label: "Ver proveedores de esta categoría"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionLink, {
					to: "/solicitudes",
					search: {
						categoria: category.slug,
						q: void 0
					},
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, {
						className: "size-5",
						"aria-hidden": true
					}),
					label: "Ver solicitudes de esta categoría"
				})
			]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: "Buscando productos de esta categoría…"
		}) : null,
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 rounded-2xl border border-line bg-card p-4 text-sm",
			children: error
		}) : null,
		!loading && !error && products && products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyNote, {
			title: "Todavía no hay productos en esta categoría.",
			body: "Explorá otras categorías o buscá directamente lo que necesitás."
		}) : null,
		!loading && !error && providers && providers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 rounded-2xl border border-line bg-card px-4 py-3 text-sm",
			children: "Todavía no hay proveedores publicados en esta categoría."
		}) : null,
		!loading && products && products.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5",
			"aria-labelledby": "productos-categoria",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "productos-categoria",
				className: "text-lg font-semibold",
				children: "Productos publicados"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 overflow-hidden rounded-2xl border border-line bg-card",
				children: products.slice(0, 4).map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/producto/$productId",
						params: { productId: listing.id },
						className: "flex min-h-16 items-center gap-3 px-3 py-3 outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-inset",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-semibold",
								children: listing.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block text-sm text-muted",
								children: [
									formatArs(listing.priceCents),
									" · ",
									listing.businessName
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "size-5 shrink-0 text-muted",
							"aria-hidden": true
						})]
					})
				}, listing.id))
			})]
		}) : null,
		!loading && providers && providers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5",
			"aria-labelledby": "proveedores-categoria",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "proveedores-categoria",
				className: "text-lg font-semibold",
				children: "Proveedores publicados"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 overflow-hidden rounded-2xl border border-line bg-card",
				children: providers.slice(0, 4).map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/negocio/$businessId",
						params: { businessId: business.id },
						className: "flex min-h-16 items-center gap-3 px-3 py-3 outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-inset",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block font-semibold",
								children: business.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-sm text-muted",
								children: business.place
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "size-5 shrink-0 text-muted",
							"aria-hidden": true
						})]
					})
				}, business.id))
			})]
		}) : null,
		!loading && needs && needs.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-5",
			"aria-labelledby": "solicitudes-categoria",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "solicitudes-categoria",
				className: "text-lg font-semibold",
				children: "Solicitudes abiertas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 overflow-hidden rounded-2xl border border-line bg-card",
				children: needs.slice(0, 3).map((need) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/solicitud/$requestId",
						params: { requestId: need.id },
						className: "flex min-h-16 items-center gap-3 px-3 py-3 outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-inset",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 font-semibold",
							children: need.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "size-5 shrink-0 text-muted",
							"aria-hidden": true
						})]
					})
				}, need.id))
			})]
		}) : null
	] });
}
function CategoryList({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "overflow-hidden rounded-2xl border border-line bg-card",
		children
	});
}
function CategoryRow({ name, hint, slug, icon, parentIcon, active = false, to, search }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "border-b border-line last:border-b-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to,
			search,
			"aria-current": active ? "page" : void 0,
			"aria-label": hint ? `${name}, ${hint}` : name,
			className: categoryRowClass(active),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: active ? "text-teal" : "text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
						slug,
						icon,
						parentIcon
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block leading-snug",
						children: name
					}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 block text-sm font-normal text-muted",
						children: hint
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
					className: "size-4 shrink-0 text-muted",
					"aria-hidden": true
				})
			]
		})
	});
}
function ActionLink({ to, search, hash, icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		search,
		hash,
		className: "flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-card px-3 py-3 text-sm font-semibold outline-none hover:bg-paper focus-visible:ring-2 focus-visible:ring-teal active:bg-teal/10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-10 shrink-0 place-items-center rounded-full bg-sun text-ink",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 leading-snug",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
				className: "size-5 shrink-0 text-muted",
				"aria-hidden": true
			})
		]
	});
}
function CategorySkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-5 overflow-hidden rounded-2xl border border-line bg-card",
		"aria-hidden": true,
		children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "h-16 animate-pulse border-b border-line bg-paper/60 last:border-b-0" }, index))
	});
}
function LoadError({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-5 rounded-2xl border border-line bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold",
				children: "No se pudieron cargar las categorías."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRetry,
				className: "mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
				children: "Reintentar"
			})
		]
	});
}
function EmptyNote({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-2xl border border-line bg-card px-4 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				search: {
					q: void 0,
					categoria: void 0
				},
				hash: "productos",
				className: "mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
				children: "Buscar en CONEX"
			})
		]
	});
}
//#endregion
export { CategoriesPage as component };

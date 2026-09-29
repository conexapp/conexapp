import { o as __toESM } from "../_runtime.mjs";
import { _ as sizeLabel, a as SELLER_GOALS, c as activityLabel, d as goalLabel, f as panelLead, g as sellerStanding, i as SELLER_CHANNELS, l as channelLabel, o as SELLER_SIZES, r as SELLER_ACTIVITIES, s as UNAVAILABLE_VERIFICATION, t as LEGAL_REVIEW } from "./seller-profile-B9jvPmNx.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { X as Check, t as X, v as Search } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { _ as updateBusinessCommercial, a as RedirectToSignIn, c as createBusiness, d as getMyAccount, g as setBusinessPaymentMethods, h as setBusinessLocation, i as PaymentMethodToggles, l as createSsrRpc, m as saveSellerIntent, o as Shell, u as geocodeRosario, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { s as listPublicRequests } from "./public-CpGTpZb5.mjs";
import { n as parseArsToCents } from "./money-DSc2EJ_o.mjs";
import { a as quoteStatusLabel, n as formatWhen, o as requestStatusLabel } from "./labels-BJ2JP56X.mjs";
import { n as validMapPoint, t as MarketMap } from "./market-map-B-H5l8a-.mjs";
import { t as ConexSelect } from "./controls-DMCQZUQt.mjs";
import { o as categoryRowClass, r as CategoryGlyph } from "./category-visual-BUjo7Qjd.mjs";
import { o as listMyListings } from "./listings-CqC7257q.mjs";
import { f as listQuoteInbox, h as submitQuote } from "./trade-DBj1viCc.mjs";
import { a as searchSellerTaxonomy, i as otherRoots, n as childrenOf, r as featuredTaxa } from "./seller-categories-BFm_XHW2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/panel-jnPZMrEA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LocationEditor({ businesses }) {
	const [businessId, setBusinessId] = (0, import_react.useState)(businesses[0]?.id ?? "");
	const current = businesses.find((business) => business.id === businessId) ?? null;
	const [query, setQuery] = (0, import_react.useState)(current?.address_line ?? "");
	const [neighborhood, setNeighborhood] = (0, import_react.useState)(current?.neighborhood ?? "");
	const [hits, setHits] = (0, import_react.useState)([]);
	const [pin, setPin] = (0, import_react.useState)(validMapPoint(current?.lat ?? null, current?.lng ?? null));
	const [approximate, setApproximate] = (0, import_react.useState)(current?.location_visibility === "approximate");
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [searchNote, setSearchNote] = (0, import_react.useState)("");
	const [placed, setPlaced] = (0, import_react.useState)(current?.lat !== null && current?.lng !== null);
	const applied = (0, import_react.useRef)("");
	(0, import_react.useEffect)(() => {
		if (!businessId && businesses[0]) setBusinessId(businesses[0].id);
	}, [businesses, businessId]);
	(0, import_react.useEffect)(() => {
		const next = businesses.find((business) => business.id === businessId);
		if (!next) return;
		const signature = [
			next.id,
			next.lat,
			next.lng,
			next.address_line,
			next.neighborhood,
			next.location_visibility
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
	if (businesses.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl bg-card p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xl font-semibold",
			children: "Ubicación de tu negocio"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Primero creá el negocio. Después marcás dónde está en Rosario."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-3 rounded-2xl bg-card p-4 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl font-semibold",
				children: "Ubicación de tu negocio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Escribí la dirección, elegí un resultado o tocá el mapa. No se guarda un punto hasta que confirmes."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm",
				children: ["Negocio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
					value: businessId,
					onChange: setBusinessId,
					ariaLabel: "Negocio",
					options: businesses.map((business) => ({
						value: business.id,
						label: business.trade_name
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-2 sm:grid-cols-[1fr_auto]",
				onSubmit: (event) => {
					event.preventDefault();
					setSearching(true);
					setSearchNote("");
					geocodeRosario({ data: { query } }).then((result) => {
						setHits(result.results);
						if (!result.ok) {
							setSearchNote(result.message);
							toast.message(result.message);
						} else if (result.results[0]) {
							setPin({
								lat: result.results[0].lat,
								lng: result.results[0].lng
							});
							setPlaced(true);
							setSearchNote("");
						}
					}).catch((error) => {
						const message = error instanceof Error ? error.message : "No se pudo buscar.";
						setSearchNote(message);
						toast.error(message);
					}).finally(() => setSearching(false));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Dirección", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Av. Pellegrini 1234, Rosario",
						className: "min-h-11 rounded-2xl border border-line bg-paper px-3"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 self-end rounded-full bg-teal px-4 text-sm font-semibold text-ink",
					disabled: searching,
					children: searching ? "Buscando…" : "Buscar"
				})]
			}),
			searchNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: searchNote
			}) : null,
			hits.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-1",
				children: hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "w-full rounded-2xl border border-line px-3 py-2 text-left text-sm",
					onClick: () => {
						setPin({
							lat: hit.lat,
							lng: hit.lng
						});
						setPlaced(true);
						setQuery(hit.label);
					},
					children: hit.label
				}) }, `${hit.lat}-${hit.lng}-${hit.label}`))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm",
				children: ["Barrio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: neighborhood,
					onChange: (event) => setNeighborhood(event.target.value),
					placeholder: "Barrio",
					className: "min-h-11 rounded-2xl border border-line bg-paper px-3"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketMap, {
				tall: true,
				points: pin ? [{
					id: "pin",
					lat: pin.lat,
					lng: pin.lng,
					label: "Tu negocio"
				}] : [],
				selectedId: pin ? "pin" : null,
				onSelect: () => void 0,
				onPick: (lat, lng) => {
					setPin({
						lat,
						lng
					});
					setPlaced(true);
				},
				emptyNote: placed ? null : "Tocá el mapa para marcar tu negocio en Rosario."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex min-h-11 items-center justify-between gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mostrar ubicación aproximada. Los compradores no ven la dirección exacta." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "cx-switch",
					type: "checkbox",
					role: "switch",
					checked: approximate,
					onChange: (event) => setApproximate(event.target.checked)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink disabled:opacity-40",
				disabled: !pin || !placed,
				onClick: () => {
					if (!pin) return;
					setBusinessLocation({ data: {
						businessId,
						lat: pin.lat,
						lng: pin.lng,
						delivery: true,
						pickup: true,
						address: query,
						neighborhood,
						visibility: approximate ? "approximate" : "exact"
					} }).then(() => toast.success("Ubicación guardada.")).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardó la ubicación."));
				},
				children: "Confirmar ubicación"
			})
		]
	});
}
function SellerOnboarding({ intent, business, completedOrders, onSaved }) {
	const [draft, setDraft] = (0, import_react.useState)(intent ?? emptyIntent());
	const [coverage, setCoverage] = (0, import_react.useState)(business?.coverage_note ?? "");
	const [minOrder, setMinOrder] = (0, import_react.useState)(business?.min_order_note ?? "");
	const [description, setDescription] = (0, import_react.useState)(business?.description ?? "");
	const [wholesale, setWholesale] = (0, import_react.useState)(business?.sells_wholesale === true);
	const [retail, setRetail] = (0, import_react.useState)(business?.sells_retail === true);
	(0, import_react.useEffect)(() => {
		setDraft(intent ?? emptyIntent());
	}, [intent]);
	(0, import_react.useEffect)(() => {
		setCoverage(business?.coverage_note ?? "");
		setMinOrder(business?.min_order_note ?? "");
		setDescription(business?.description ?? "");
		setWholesale(business?.sells_wholesale === true);
		setRetail(business?.sells_retail === true);
	}, [business]);
	const standing = sellerStanding({
		intent,
		businessStatus: business?.status ?? null,
		completedOrders
	});
	function toggle(list, id) {
		return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mb-6 grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-wide text-olive uppercase",
						children: "Estado"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 text-2xl",
						children: standing.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm text-muted",
						children: standing.detail
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm",
						children: panelLead(intent)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							"Todavía no se otorgan: ",
							UNAVAILABLE_VERIFICATION.join(" · "),
							"."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-2xl border border-line bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					saveSellerIntent({ data: draft }).then(() => {
						toast.success("Declaración guardada.");
						onSaved();
					}).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardó."));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Qué querés hacer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-sm font-medium",
							children: "En CONEX"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: SELLER_GOALS.map((goal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "conex-seller-goal",
									checked: draft.goal === goal,
									onChange: () => setDraft({
										...draft,
										goal
									})
								}), goalLabel(goal)]
							}, goal))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Qué tipo de productos", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft.productKinds,
							onChange: (event) => setDraft({
								...draft,
								productKinds: event.target.value
							}),
							className: "min-h-11 rounded-2xl border border-line px-3",
							placeholder: "Por ejemplo, herramientas"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-sm font-medium",
							children: "Cómo trabajás"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: SELLER_ACTIVITIES.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: draft.activities.includes(id),
									onChange: () => setDraft({
										...draft,
										activities: toggle(draft.activities, id)
									})
								}), activityLabel(id)]
							}, id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-sm font-medium",
							children: "A quién le vendés"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: SELLER_CHANNELS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: draft.channels.includes(id),
									onChange: () => setDraft({
										...draft,
										channels: toggle(draft.channels, id)
									})
								}), channelLabel(id)]
							}, id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-sm font-medium",
							children: "Tamaño de hoy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: SELLER_SIZES.map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "conex-seller-size",
									checked: draft.size === size,
									onChange: () => setDraft({
										...draft,
										size
									})
								}), sizeLabel(size)]
							}, size))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: draft.ships,
							onChange: (event) => setDraft({
								...draft,
								ships: event.target.checked
							})
						}), "Hago envíos"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Qué buscás en CONEX", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: draft.seeking,
							onChange: (event) => setDraft({
								...draft,
								seeking: event.target.value
							}),
							className: "min-h-20 rounded-2xl border border-line px-3 py-2"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-start gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "mt-1",
							checked: draft.declaresMinor,
							onChange: (event) => setDraft({
								...draft,
								declaresMinor: event.target.checked
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Soy menor de 18 años. Si lo marcás, no vas a poder publicar ni cobrar. No hace falta el documento de un adulto." })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 justify-self-start rounded-full bg-ember px-4 text-sm font-semibold text-ink",
						children: "Guardar declaración"
					})
				]
			}),
			business ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-2xl border border-line bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					updateBusinessCommercial({ data: {
						businessId: business.id,
						description,
						coverageNote: coverage,
						minOrderNote: minOrder,
						sellsWholesale: wholesale,
						sellsRetail: retail
					} }).then(() => {
						toast.success("Datos comerciales guardados.");
						onSaved();
					}).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardó."));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-2xl",
						children: ["Datos comerciales de ", business.trade_name]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Sin CUIT ni documentos. La compra mínima es una nota: no se cobra sola."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Descripción", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: description,
							onChange: (event) => setDescription(event.target.value),
							className: "min-h-20 rounded-2xl border border-line px-3 py-2"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Zona de cobertura", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: coverage,
							onChange: (event) => setCoverage(event.target.value),
							placeholder: "Por ejemplo, Rosario centro",
							className: "min-h-11 rounded-2xl border border-line px-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Compra mínima, si la tenés", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: minOrder,
							onChange: (event) => setMinOrder(event.target.value),
							placeholder: "Por ejemplo, 10 unidades",
							className: "min-h-11 rounded-2xl border border-line px-3"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: wholesale,
							onChange: (event) => setWholesale(event.target.checked)
						}), "Vendo mayorista"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: retail,
							onChange: (event) => setRetail(event.target.checked)
						}), "Vendo minorista"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 justify-self-start rounded-full bg-ink px-4 text-sm font-semibold text-paper",
						children: "Guardar datos comerciales"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-card p-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Lo que esta cuenta todavía no hace"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-2 text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No hay chat aparte. La consulta y la respuesta quedan en CONEX, con precio, cantidad, envío y plazo." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No hay cotización de varios productos ni descuentos armados." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No hay carga por Excel, CRM, automatizaciones ni un plan pago." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No hay reputación de estrellas ni porcentajes si no hubo operaciones." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "No hay sanciones automáticas ni detección de operaciones por fuera." })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-paper p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Antes de pedirte más datos"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: "Esto tiene que revisarlo un abogado, un contador o un especialista en datos. Por eso no está en el formulario."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 grid gap-3",
						children: LEGAL_REVIEW.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: item.topic
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: item.detail
						})] }, item.topic))
					})
				]
			})
		]
	});
}
function emptyIntent() {
	return {
		goal: "vender",
		productKinds: "",
		activities: [],
		channels: [],
		size: "empezando",
		ships: false,
		seeking: "",
		declaresMinor: false
	};
}
var listSellerTaxonomy = createServerFn({ method: "GET" }).handler(createSsrRpc("fb57c938a0d920117e6ee0ac48d85231042b7fdd76b1a234d4bca9335ee74d28"));
var setBusinessCategories = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId) throw new Error("Falta el negocio.");
	if (!Array.isArray(input.categoryIds)) throw new Error("Elegí al menos una categoría.");
	return {
		businessId: input.businessId,
		categoryIds: input.categoryIds
	};
}).handler(createSsrRpc("bd7739e16b93213b4c6fe07b3805872e6830adf60597d48ed0b98b00a024120e"));
function SellerCategoryPicker({ selected, onChange, title = "¿Qué tipo de productos vendés?", hint = "Seleccioná una o varias categorías que representen los productos que ofrecés." }) {
	const titleId = (0, import_react.useId)();
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [limit, setLimit] = (0, import_react.useState)(10);
	const [otherOpen, setOtherOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		listSellerTaxonomy().then((result) => {
			if (cancelled) return;
			setCategories(result.categories);
			setLimit(result.limit);
		}).catch(() => {
			if (!cancelled) setError("No se pudo cargar el catálogo de categorías.");
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!otherOpen) return;
		function onKey(event) {
			if (event.key === "Escape") setOtherOpen(false);
		}
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [otherOpen]);
	function toggle(id) {
		if (selected.includes(id)) {
			onChange(selected.filter((item) => item !== id));
			setNotice(null);
			return;
		}
		if (selected.length >= limit) {
			setNotice(`Podés elegir hasta ${limit} categorías. Ese tope se cambia en la configuración de la plataforma.`);
			return;
		}
		setNotice(null);
		onChange([...selected, id]);
	}
	const featured = featuredTaxa(categories);
	const extras = otherRoots(categories);
	const hits = searchSellerTaxonomy(categories, query);
	const byId = new Map(categories.map((category) => [category.id, category]));
	const featuredIds = new Set(featured.map((category) => category.id));
	const otherSelected = selected.some((id) => !featuredIds.has(id));
	const atLimit = selected.length >= limit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: hint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm font-medium text-ink",
					children: [
						selected.length,
						" de ",
						limit
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Elegir un rubro no te impide publicar un producto de otro."
				})
			] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-sun/40 px-3 py-2 text-sm",
				children: error
			}) : null,
			categories.length === 0 && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-card" }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "overflow-hidden rounded-2xl border border-line bg-card",
				children: [featured.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-b border-line last:border-b-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChoice, {
						category,
						selected: selected.includes(category.id),
						disabled: atLimit,
						onToggle: toggle
					})
				}, category.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-pressed": otherOpen || otherSelected,
					onClick: () => setOtherOpen(true),
					className: categoryRowClass(otherSelected),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							className: `size-4 shrink-0 ${otherSelected ? "text-teal" : "text-ink"}`,
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 font-semibold leading-snug",
							children: "Otro"
						}),
						otherSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-4 shrink-0 text-teal",
							"aria-hidden": true
						}) : null
					]
				}) })]
			}),
			selected.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-wrap gap-2",
				children: selected.map((id) => {
					const category = byId.get(id);
					const parent = category?.parentId ? byId.get(category.parentId) : void 0;
					const label = parent ? `${parent.name} → ${category?.name ?? id}` : category?.name ?? id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => toggle(id),
						className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-sun px-3 text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-4",
							"aria-hidden": true
						}), label]
					}) }, id);
				})
			}) : null,
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: notice
			}) : null,
			otherOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4",
				onClick: () => setOtherOpen(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": titleId,
					className: "flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-foam shadow-card sm:rounded-3xl",
					onClick: (event) => event.stopPropagation(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 border-b border-line px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								id: titleId,
								className: "text-lg font-semibold",
								children: "Buscá qué vendés"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: "También encuentra subcategorías de las 10 principales."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOtherOpen(false),
								className: "inline-flex size-11 items-center justify-center rounded-full hover:bg-paper",
								"aria-label": "Cerrar",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-5",
									"aria-hidden": true
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
									className: "size-4 text-teal",
									"aria-hidden": true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									value: query,
									onChange: (event) => setQuery(event.target.value),
									placeholder: "Buscar categoría...",
									className: "min-w-0 flex-1 bg-transparent text-sm outline-none"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-h-0 flex-1 overflow-y-auto px-4 pb-3",
							children: query.trim().length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "grid gap-1",
								children: [hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "py-6 text-center text-sm text-muted",
									children: "No hay categorías con ese texto."
								}) : null, hits.map((hit) => {
									const category = byId.get(hit.id);
									const parent = category?.parentId ? byId.get(category.parentId) : void 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceRow, {
										title: hit.parentName ? `${hit.parentName} → ${hit.name}` : hit.name,
										icon: category?.icon,
										parentIcon: parent?.icon,
										slug: hit.id,
										selected: selected.includes(hit.id),
										disabled: atLimit && !selected.includes(hit.id),
										onClick: () => toggle(hit.id)
									}) }, hit.id);
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-4",
								children: extras.map((root) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceRow, {
									title: root.name,
									icon: root.icon,
									slug: root.id,
									selected: selected.includes(root.id),
									disabled: atLimit && !selected.includes(root.id),
									onClick: () => toggle(root.id)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-1 grid gap-1 pl-3",
									children: childrenOf(categories, root.id).map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChoiceRow, {
										title: child.name,
										icon: child.icon,
										parentIcon: root.icon,
										slug: child.id,
										selected: selected.includes(child.id),
										disabled: atLimit && !selected.includes(child.id),
										onClick: () => toggle(child.id)
									}) }, child.id))
								})] }, root.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border-t border-line p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOtherOpen(false),
								className: "min-h-11 w-full rounded-full bg-ink text-sm font-semibold text-paper",
								children: "Listo"
							})
						})
					]
				})
			}) : null
		]
	});
}
function CategoryChoice({ category, selected, disabled, onToggle }) {
	const IconWrap = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: selected ? "text-teal" : "text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
			slug: category.id,
			icon: category.icon
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": selected,
		disabled: !selected && disabled,
		onClick: () => onToggle(category.id),
		className: `${categoryRowClass(selected)} disabled:opacity-50`,
		children: [
			IconWrap,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 leading-snug",
				children: category.name
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				className: "size-4 shrink-0 text-teal",
				"aria-hidden": true
			}) : null
		]
	});
}
function ChoiceRow({ title, selected, disabled, onClick, icon, parentIcon, slug }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		disabled,
		"aria-pressed": selected,
		onClick,
		className: `${categoryRowClass(selected)} disabled:opacity-50`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: selected ? "text-teal" : "text-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
					slug: slug ?? "",
					icon,
					parentIcon
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 flex-1 leading-snug",
				children: title
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
				className: "size-4 shrink-0 text-teal",
				"aria-hidden": true
			}) : null
		]
	});
}
var listSellerPaymentLinks = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("663296a7af27f2e27ab0e04cfa55730d2c4211e61d501c3e03d2fc1803f1c988"));
var startSellerOAuth = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((businessId) => {
	if (typeof businessId !== "string" || businessId.length < 8 || businessId.length > 80) throw new Error("Negocio inválido.");
	return businessId;
}).handler(createSsrRpc("39a5a0011edbb27ec30d1bf8886eb2192cdd3d27c983825d9f110addab244344"));
var disconnectSellerPayments = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((businessId) => {
	if (typeof businessId !== "string" || businessId.length < 8) throw new Error("Negocio inválido.");
	return businessId;
}).handler(createSsrRpc("062d79fba039d0d8d6fd0cc73135f06f8f65615339c3467c57ca4b5f47f4d84a"));
function PanelPage() {
	const { user, isPending } = useCurrentUserState();
	const [account, setAccount] = (0, import_react.useState)(null);
	const [inbox, setInbox] = (0, import_react.useState)([]);
	const [payments, setPayments] = (0, import_react.useState)(null);
	const [tradeName, setTradeName] = (0, import_react.useState)("");
	const [legalName, setLegalName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [neighborhood, setNeighborhood] = (0, import_react.useState)("");
	const [categoryIds, setCategoryIds] = (0, import_react.useState)([]);
	const [description, setDescription] = (0, import_react.useState)("");
	const [coverageNote, setCoverageNote] = (0, import_react.useState)("");
	const [minOrderNote, setMinOrderNote] = (0, import_react.useState)("");
	const [sellsWholesale, setSellsWholesale] = (0, import_react.useState)(false);
	const [sellsRetail, setSellsRetail] = (0, import_react.useState)(false);
	const [editIds, setEditIds] = (0, import_react.useState)([]);
	const [businessId, setBusinessId] = (0, import_react.useState)("");
	const [publishedCount, setPublishedCount] = (0, import_react.useState)(null);
	const [needs, setNeeds] = (0, import_react.useState)(null);
	const [needQ, setNeedQ] = (0, import_react.useState)("");
	const [quoteBusinessId, setQuoteBusinessId] = (0, import_react.useState)("");
	const [acceptedMethods, setAcceptedMethods] = (0, import_react.useState)([]);
	function reload() {
		getMyAccount().then((next) => {
			setAccount(next);
			const id = businessId || next.businesses[0]?.id || "";
			if (!businessId && next.businesses[0]) setBusinessId(next.businesses[0].id);
			const current = next.businesses.find((item) => item.id === id);
			setAcceptedMethods(current?.paymentMethods ?? []);
		});
		listQuoteInbox().then(setInbox).catch(() => setInbox([]));
		listSellerPaymentLinks().then(setPayments).catch(() => setPayments(null));
		listMyListings({ data: { status: "published" } }).then((rows) => setPublishedCount(rows.length)).catch(() => setPublishedCount(null));
		listPublicRequests({ data: { q: needQ } }).then((result) => setNeeds(result.requests)).catch(() => setNeeds([]));
	}
	(0, import_react.useEffect)(() => {
		const current = account?.businesses.find((business) => business.id === businessId);
		setEditIds(current?.categoryIds ?? []);
	}, [account, businessId]);
	(0, import_react.useEffect)(() => {
		if (user) reload();
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl",
				children: "Mi negocio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm text-muted",
				children: account && account.businesses.length === 0 ? "Creá tu negocio para empezar a publicar productos." : "Tus productos, las consultas que te llegan y lo que otras personas están buscando."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					account?.sellerIntent?.declaresMinor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xs text-sm text-muted",
						children: "Publicar está bloqueado: declaraste ser menor de edad."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/panel/productos/$listingId",
						params: { listingId: "nuevo" },
						className: "inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
						children: "+ Publicar producto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#consultas",
						className: "inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-semibold",
						children: "Ver consultas"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#solicitudes",
						className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold",
						children: "Ver solicitudes"
					})
				]
			})]
		}),
		account && account.businesses.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mb-4 grid max-w-md gap-1 text-sm",
			children: ["Negocio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
				value: businessId,
				onChange: (id) => {
					setBusinessId(id);
					const business = account.businesses.find((item) => item.id === id);
					setAcceptedMethods(business?.paymentMethods ?? []);
				},
				ariaLabel: "Negocio",
				options: account.businesses.map((business) => ({
					value: business.id,
					label: `${business.trade_name} · ${business.status === "active" ? "aprobado" : business.status === "pending_review" ? "en revisión" : business.status === "suspended" ? "suspendido" : business.status}`
				}))
			})]
		}) : null,
		account && account.businesses.length === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 text-sm",
			children: ["Negocio: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold",
				children: account.businesses[0]?.trade_name
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: "Productos publicados"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-2xl font-semibold tabular-nums",
						children: publishedCount ?? "—"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: "Consultas nuevas"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-2xl font-semibold tabular-nums",
						children: inbox.filter((item) => !item.quote_id).length
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: "Respuestas enviadas"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-2xl font-semibold tabular-nums",
						children: inbox.filter((item) => item.quote_status === "submitted").length
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-sm text-muted",
						children: "Solicitudes disponibles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "mt-1 text-2xl font-semibold tabular-nums",
						children: needs ? needs.length : "—"
					})]
				})
			]
		}),
		account ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerOnboarding, {
			intent: account.sellerIntent,
			completedOrders: account.completedOrders,
			business: account.businesses.find((item) => item.id === (businessId || account.businesses[0]?.id)) ?? null,
			onSaved: reload
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2 rounded-card border border-line bg-foam p-4",
					onSubmit: (event) => {
						event.preventDefault();
						createBusiness({ data: {
							tradeName,
							legalName,
							phone,
							address,
							neighborhood,
							categoryIds,
							description,
							coverageNote,
							minOrderNote,
							sellsWholesale,
							sellsRetail
						} }).then((created) => {
							toast.success("Negocio enviado a revisión.");
							setBusinessId(created.id);
							reload();
						}).catch((error) => toast.error(error instanceof Error ? error.message : "No se creó."));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: account && account.businesses.length > 0 ? "Crear otro negocio" : "Crear mi negocio"
						}),
						account && account.businesses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Completá estos datos. El negocio se revisa antes de aparecer en la búsqueda."
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Nombre comercial", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: tradeName,
								onChange: (event) => setTradeName(event.target.value),
								className: "min-h-11 rounded-2xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: [
								"Razón social",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: "Si todavía no tenés, repetí el nombre comercial. No pedimos CUIT acá."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									required: true,
									value: legalName,
									onChange: (event) => setLegalName(event.target.value),
									className: "min-h-11 rounded-2xl border border-line px-3"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Descripción", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: description,
								onChange: (event) => setDescription(event.target.value),
								className: "min-h-20 rounded-2xl border border-line px-3 py-2"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Zona de cobertura", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: coverageNote,
								onChange: (event) => setCoverageNote(event.target.value),
								className: "min-h-11 rounded-2xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Compra mínima, si la tenés", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: minOrderNote,
								onChange: (event) => setMinOrderNote(event.target.value),
								className: "min-h-11 rounded-2xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: sellsWholesale,
								onChange: (event) => setSellsWholesale(event.target.checked)
							}), "Vendo mayorista"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: sellsRetail,
								onChange: (event) => setSellsRetail(event.target.checked)
							}), "Vendo minorista"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Teléfono", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: phone,
								onChange: (event) => setPhone(event.target.value),
								className: "min-h-11 rounded-2xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Dirección", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: address,
								onChange: (event) => setAddress(event.target.value),
								placeholder: "Av. Pellegrini 1234",
								className: "min-h-11 rounded-2xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "grid gap-1 text-sm",
							children: ["Barrio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: neighborhood,
								onChange: (event) => setNeighborhood(event.target.value),
								className: "min-h-11 rounded-2xl border border-line px-3"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCategoryPicker, {
							selected: categoryIds,
							onChange: setCategoryIds
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: categoryIds.length === 0,
							className: "min-h-11 rounded-full bg-ember text-ink disabled:opacity-40",
							children: categoryIds.length === 0 ? "Elegí al menos una categoría" : "Crear mi negocio"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "text-sm text-muted",
							children: account?.businesses.map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								business.trade_name,
								" — ",
								business.status === "active" ? "aprobado" : business.status === "pending_review" ? "en revisión" : business.status === "suspended" ? "suspendido" : business.status
							] }, business.id))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationEditor, { businesses: account?.businesses ?? [] }),
				businessId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-3 rounded-card border border-line bg-foam p-4 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SellerCategoryPicker, {
						selected: editIds,
						onChange: setEditIds,
						title: "Categorías de este negocio",
						hint: "Podés cambiarlas cuando quieras. No reemplazan la categoría de cada producto."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: editIds.length === 0,
						className: "min-h-11 rounded-full bg-ink px-4 text-paper disabled:opacity-40",
						onClick: () => {
							setBusinessCategories({ data: {
								businessId,
								categoryIds: editIds
							} }).then(() => {
								toast.success("Categorías guardadas.");
								reload();
							}).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardaron."));
						},
						children: "Guardar categorías"
					})]
				}) : null
			]
		}),
		businessId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-3 rounded-card border border-line bg-foam p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Medios de pago que acepto"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Elegí los medios de pago que aceptás para tus productos. El comprador podrá elegir uno de estos medios al realizar una operación."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Los medios de pago disponibles dependen de cada proveedor. CONEX registra el medio elegido. La aceptación y disponibilidad del medio corresponden al proveedor. CONEX no verifica automáticamente que pueda cobrar con cada uno."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodToggles, {
					selected: acceptedMethods,
					onChange: setAcceptedMethods
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 w-fit rounded-full bg-ink px-4 text-sm font-semibold text-paper",
					onClick: () => {
						setBusinessPaymentMethods({ data: {
							businessId,
							methods: acceptedMethods
						} }).then(() => {
							toast.success("Medios de pago guardados. No se confirmó ningún cobro.");
							reload();
						}).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardaron."));
					},
					children: "Guardar medios de pago"
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-3 rounded-card border border-line bg-foam p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Mercado Pago"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Opcional. Sirve si querés cobrar una compra dentro de CONEX. No es obligatorio para publicar ni para responder consultas: el pago también se puede acordar con el comprador."
				}),
				payments?.missing.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"No se puede conectar todavía. Falta: ",
						payments.missing.join(", "),
						"."
					]
				}) : null,
				payments?.warning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: payments.warning
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: payments?.businesses.map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium",
							children: business.tradeName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted",
							children: business.connected ? `Conectado${business.liveMode === false ? " · modo de prueba" : ""}.` : business.status === "refresh_failed" ? "Hay que reconectar. El token no se pudo renovar." : "Sin conectar."
						})] }), business.connected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full border border-line px-4",
							onClick: () => {
								disconnectSellerPayments({ data: business.businessId }).then((result) => {
									toast.success(result.message);
									reload();
								}).catch((error) => toast.error(error instanceof Error ? error.message : "No se desconectó."));
							},
							children: "Desconectar"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-full bg-ink px-4 text-paper",
							onClick: () => {
								startSellerOAuth({ data: business.businessId }).then((result) => {
									if (result.url) {
										window.location.href = result.url;
										return;
									}
									const missing = result.missing.length ? ` Falta: ${result.missing.join(", ")}.` : "";
									toast.message(`${result.message}${missing}`);
								}).catch((error) => toast.error(error instanceof Error ? error.message : "No se abrió Mercado Pago."));
							},
							children: "Conectar Mercado Pago"
						})]
					}, business.businessId))
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "consultas",
			className: "mt-8 grid scroll-mt-36 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Consultas recibidas"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Alguien preguntó por uno de tus productos."
				}),
				inbox.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-card p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "No tenés consultas."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: "Cuando un comprador pregunte por uno de tus productos, aparecerá acá."
					})]
				}) : null,
				inbox.filter((request) => !request.quote_id).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: "Nuevas"
				}) : null,
				inbox.filter((request) => !request.quote_id).map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteReply, {
					request,
					onDone: reload
				}, request.id)),
				inbox.filter((request) => request.quote_status === "submitted").length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: "Respuestas enviadas"
				}) : null,
				inbox.filter((request) => request.quote_status === "submitted").map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteReply, {
					request,
					onDone: reload
				}, request.id)),
				inbox.filter((request) => request.quote_status === "accepted").length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-semibold",
					children: "Respuestas aceptadas"
				}) : null,
				inbox.filter((request) => request.quote_status === "accepted").map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: request.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted",
						children: ["Aceptada · cantidad ", request.quantity]
					})]
				}, request.id)),
				inbox.filter((request) => request.quote_id && request.quote_status !== "submitted" && request.quote_status !== "accepted").map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuoteReply, {
					request,
					onDone: reload
				}, request.id))
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			id: "solicitudes",
			className: "mt-8 grid scroll-mt-36 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Solicitudes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Alguien publicó que necesita algo y todavía no lo encontró. No está ligado a uno de tus productos."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-col gap-2 sm:flex-row",
					onSubmit: (event) => {
						event.preventDefault();
						listPublicRequests({ data: { q: needQ } }).then((result) => setNeeds(result.requests)).catch(() => setNeeds([]));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid min-w-0 flex-1 gap-1 text-sm",
						children: ["Buscar lo que necesitan", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: needQ,
							onChange: (event) => setNeedQ(event.target.value),
							className: "min-h-11 rounded-full border border-line px-4"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "min-h-11 self-end rounded-full border border-ink px-4 text-sm font-semibold",
						children: "Filtrar"
					})]
				}),
				needs && needs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "No hay solicitudes abiertas. Cuando alguien publique lo que necesita, va a aparecer acá."
				}) : null,
				needs?.map((need) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NeedReply, {
					need,
					businesses: (account?.businesses ?? []).filter((business) => business.status === "active" && !demoFlag(business.is_demo)),
					businessId: quoteBusinessId || businessId,
					onBusiness: setQuoteBusinessId,
					onDone: reload
				}, need.id))
			]
		})
	] });
}
function QuoteReply({ request, onDone }) {
	const [price, setPrice] = (0, import_react.useState)("");
	const [shipping, setShipping] = (0, import_react.useState)("0");
	const [hours, setHours] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-2 rounded-card border border-line bg-foam p-4",
		onSubmit: (event) => {
			event.preventDefault();
			const unitPriceCents = parseArsToCents(price);
			const shippingCents = parseArsToCents(shipping) ?? (shipping === "0" ? 0 : null);
			if (!unitPriceCents || shippingCents === null || !/^\d+$/.test(hours)) {
				toast.error("Revisá el precio, el envío y las horas.");
				return;
			}
			submitQuote({ data: {
				requestId: request.id,
				businessId: request.business_id,
				unitPriceCents,
				quantity: request.quantity,
				shippingCents,
				leadTimeHours: Number(hours),
				notes
			} }).then(() => {
				toast.success("Tu respuesta fue enviada al comprador.");
				onDone();
			}).catch((error) => toast.error(error instanceof Error ? error.message : "No se envió."));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xl",
				children: request.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Cantidad pedida: ",
					request.quantity,
					". ",
					request.delivery_required ? "Prefiere entrega." : "Prefiere retiro.",
					" ",
					request.notes,
					request.quote_status ? ` · ${quoteStatusLabel(request.quote_status)}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm",
				children: [
					"Precio unitario",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Precio en pesos por cada unidad. 125000 es $ 125.000."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: price,
						onChange: (event) => setPrice(event.target.value),
						placeholder: "125000",
						className: "min-h-11 rounded-2xl border border-line px-3"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm",
				children: [
					"Envío",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Costo de envío en pesos. Si no se cobra, escribí 0. No es un pago dentro de CONEX."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: shipping,
						onChange: (event) => setShipping(event.target.value),
						placeholder: "0",
						className: "min-h-11 rounded-2xl border border-line px-3"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm",
				children: [
					"Tiempo estimado",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Horas hasta tener el pedido listo."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 0,
						value: hours,
						onChange: (event) => setHours(event.target.value),
						className: "min-h-11 rounded-2xl border border-line px-3"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-sm",
				children: [
					"Mensaje al comprador",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: "Condiciones, disponibilidad o cómo se acuerda el pago. Mercado Pago no es obligatorio."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: notes,
						onChange: (event) => setNotes(event.target.value),
						className: "min-h-11 rounded-2xl border border-line px-3"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "min-h-11 rounded-full bg-ink px-4 text-sm font-semibold text-paper",
				children: request.quote_id ? "Actualizar respuesta" : "Enviar respuesta"
			})
		]
	});
}
function demoFlag(value) {
	return value === true || value === "t" || value === 1;
}
function NeedReply({ need, businesses, businessId, onBusiness, onDone }) {
	const [price, setPrice] = (0, import_react.useState)("");
	const [shipping, setShipping] = (0, import_react.useState)("");
	const [hours, setHours] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const selected = businesses.some((business) => business.id === businessId) ? businessId : businesses[0]?.id ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "grid gap-3 rounded-2xl border border-line bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-xl font-semibold",
				children: need.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					"Cantidad: ",
					need.quantity,
					need.categoryName ? ` · ${need.categoryName}` : "",
					` · ${need.city}`,
					need.delivery ? " · prefiere entrega" : " · prefiere retiro",
					` · ${requestStatusLabel(need.status)}`,
					formatWhen(need.createdAt) ? ` · ${formatWhen(need.createdAt)}` : ""
				]
			}),
			need.notes.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm",
				children: need.notes
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/solicitud/$requestId",
				params: { requestId: need.id },
				className: "mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
				children: "Ver pedido"
			})
		] }), businesses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Para responder necesitás un negocio aprobado. Uno en revisión todavía no puede responder."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-2",
			onSubmit: (event) => {
				event.preventDefault();
				const unitPriceCents = parseArsToCents(price);
				const shippingCents = shipping.trim() === "" ? 0 : parseArsToCents(shipping) ?? (shipping === "0" ? 0 : null);
				if (!selected || !unitPriceCents || shippingCents === null || !/^\d+$/.test(hours)) {
					toast.error("Completá negocio, precio, envío y horas.");
					return;
				}
				submitQuote({ data: {
					requestId: need.id,
					businessId: selected,
					unitPriceCents,
					quantity: need.quantity,
					shippingCents,
					leadTimeHours: Number(hours),
					notes
				} }).then(() => {
					toast.success("Tu respuesta fue enviada. Esta solicitud no arma una compra automática porque no hay un producto publicado del cual reservar stock.");
					onDone();
				}).catch((error) => toast.error(error instanceof Error ? error.message : "No se envió."));
			},
			children: [
				businesses.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Responder con", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
						value: selected,
						onChange: onBusiness,
						ariaLabel: "Responder con",
						options: businesses.map((business) => ({
							value: business.id,
							label: business.trade_name
						}))
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm",
					children: [
						"Esta respuesta sale de ",
						businesses[0]?.trade_name,
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Precio unitario", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: price,
						onChange: (event) => setPrice(event.target.value),
						placeholder: "125000",
						className: "min-h-11 rounded-2xl border border-line px-3"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: [
						"Envío",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: "0 si no cobrás envío."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: shipping,
							onChange: (event) => setShipping(event.target.value),
							placeholder: "0",
							className: "min-h-11 rounded-2xl border border-line px-3"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Tiempo estimado en horas", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						min: 0,
						value: hours,
						onChange: (event) => setHours(event.target.value),
						className: "min-h-11 rounded-2xl border border-line px-3"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Mensaje al comprador", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: notes,
						onChange: (event) => setNotes(event.target.value),
						className: "min-h-11 rounded-2xl border border-line px-3"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink",
					children: "Enviar propuesta"
				})
			]
		})]
	});
}
//#endregion
export { PanelPage as component };

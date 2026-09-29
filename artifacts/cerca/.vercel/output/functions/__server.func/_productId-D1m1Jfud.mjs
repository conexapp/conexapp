import { o as __toESM } from "./_runtime.mjs";
import { m as publicStandingLabel, u as completionShare } from "./_ssr/seller-profile-B9jvPmNx.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { i as Route$7 } from "./_ssr/router-CvWFEIdL.mjs";
import { o as Shell, r as PaymentMethodRadios, t as PaymentMethodChips, y as useCurrentUserState } from "./_ssr/shell-CbJDficC.mjs";
import { n as getListing, r as getPlatformStatus, t as getBusiness } from "./_ssr/public-CpGTpZb5.mjs";
import { t as formatArs } from "./_ssr/money-DSc2EJ_o.mjs";
import { r as memberSinceLabel, t as businessInitials } from "./_ssr/labels-BJ2JP56X.mjs";
import { n as QuantityField, t as ConexSelect } from "./_ssr/controls-DMCQZUQt.mjs";
import { r as CategoryGlyph } from "./_ssr/category-visual-BUjo7Qjd.mjs";
import { c as createQuoteRequest, i as buyPublishedListing } from "./_ssr/trade-DBj1viCc.mjs";
import { r as submitReport } from "./_ssr/reports-CI9ZyE4B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_productId-D1m1Jfud.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	const { productId } = Route$7.useParams();
	const navigate = useNavigate();
	const { user } = useCurrentUserState();
	const [listing, setListing] = (0, import_react.useState)(null);
	const [business, setBusiness] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	const [address, setAddress] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [delivery, setDelivery] = (0, import_react.useState)(true);
	const [photo, setPhoto] = (0, import_react.useState)(0);
	const [broken, setBroken] = (0, import_react.useState)({});
	const [sending, setSending] = (0, import_react.useState)(false);
	const [buyOpen, setBuyOpen] = (0, import_react.useState)(false);
	const [buyQty, setBuyQty] = (0, import_react.useState)(1);
	const [buyDelivery, setBuyDelivery] = (0, import_react.useState)(true);
	const [buyAddress, setBuyAddress] = (0, import_react.useState)("");
	const [buyMethod, setBuyMethod] = (0, import_react.useState)("");
	const [buying, setBuying] = (0, import_react.useState)(false);
	const [paymentsMissing, setPaymentsMissing] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let dead = false;
		setListing(null);
		setBusiness(null);
		setError("");
		setPhoto(0);
		setQuantity(1);
		setAddress("");
		setNotes("");
		setBroken({});
		getListing({ data: productId }).then((next) => {
			if (dead) return;
			setListing(next);
			setDelivery(next.delivery);
			setBuyDelivery(next.delivery);
			setBuyQty(1);
			setBuyMethod("");
		}).catch((cause) => {
			if (!dead) setError(cause instanceof Error ? cause.message : "No se encontró el producto.");
		});
		return () => {
			dead = true;
		};
	}, [productId]);
	(0, import_react.useEffect)(() => {
		if (!listing) return;
		let dead = false;
		getBusiness({ data: listing.businessId }).then((next) => {
			if (!dead) setBusiness(next);
		}).catch(() => {
			if (!dead) setBusiness(null);
		});
		return () => {
			dead = true;
		};
	}, [listing]);
	(0, import_react.useEffect)(() => {
		if (!listing || !user) return;
		if (new URLSearchParams(window.location.search).get("comprar") === "1") setBuyOpen(true);
	}, [listing, user]);
	(0, import_react.useEffect)(() => {
		let dead = false;
		getPlatformStatus().then((status) => {
			if (!dead) setPaymentsMissing(status.payments.missing);
		}).catch(() => {
			if (!dead) setPaymentsMissing(null);
		});
		return () => {
			dead = true;
		};
	}, []);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "Este producto no está publicado"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-muted",
			children: error
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-6 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
			children: "Volver al inicio"
		})
	] });
	if (!listing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]",
		"aria-busy": "true",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "aspect-square animate-pulse rounded-2xl bg-paper" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid content-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-28 animate-pulse rounded bg-paper" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 w-4/5 animate-pulse rounded bg-paper" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-36 animate-pulse rounded bg-paper" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-40 animate-pulse rounded-2xl bg-paper" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: "Cargando producto…"
			})
		]
	}) });
	const images = listing.images;
	const photoIndex = images.length === 0 ? 0 : Math.min(photo, images.length - 1);
	const currentImage = images[photoIndex];
	const imageBroken = broken[photoIndex] === true;
	const inStock = listing.stockUnits > 0;
	const canDeliver = listing.delivery;
	const canPickup = listing.pickup;
	const quoteBlocked = !inStock || !canDeliver && !canPickup;
	const others = (business?.listings ?? []).filter((item) => item.id !== listing.id);
	const place = business ? business.approximate ? [
		business.neighborhood,
		business.city,
		"ubicación aproximada"
	].filter((part) => part && part.trim()).join(" · ") : [
		business.addressLine,
		business.neighborhood,
		business.city
	].filter((part) => part && part.trim()).join(" · ") : listing.neighborhood ? `${listing.neighborhood}, Rosario` : null;
	const cityLine = business ? [business.city, business.province].filter((part) => part && part.trim()).join(", ") : "Rosario, Santa Fe";
	const since = business ? memberSinceLabel(business.createdAt) : null;
	const publishedCount = business?.listings.length ?? 0;
	const standing = business ? publicStandingLabel(business.completedOrders) : null;
	const closedShare = business ? completionShare(business.completedOrders, business.cancelledOrders) : null;
	const facts = [
		listing.brand.trim() ? ["Marca", listing.brand.trim()] : null,
		listing.model.trim() ? ["Modelo", listing.model.trim()] : null,
		["Categoría", listing.categoryName],
		["Unidad", listing.unit]
	].filter((item) => item !== null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			"aria-label": "Migas",
			className: "mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "min-h-11 inline-flex items-center hover:text-ink",
					children: "Inicio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: "/"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					search: { categoria: listing.categorySlug },
					className: "inline-flex min-h-11 items-center gap-2 font-medium text-ink hover:text-olive",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, { slug: listing.categorySlug }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "whitespace-normal",
						children: listing.categoryName
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: "hidden sm:inline",
					children: "/"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden max-w-xs truncate sm:inline",
					"aria-current": "page",
					children: listing.name
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.12fr)_minmax(16.5rem,22rem)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 lg:col-start-1 lg:row-start-1",
					children: [currentImage && !imageBroken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: currentImage,
						alt: listing.name,
						className: "aspect-square w-full rounded-2xl bg-paper object-cover",
						onError: () => setBroken((current) => ({
							...current,
							[photoIndex]: true
						}))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid aspect-square place-items-center rounded-2xl bg-paper px-6 text-center text-sm text-muted",
						children: images.length === 0 ? "Este producto no tiene fotos." : "No se pudo cargar esta foto."
					}), images.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2 overflow-x-auto pb-1",
						children: images.map((url, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Foto ${index + 1} de ${images.length}`,
							"aria-pressed": index === photoIndex,
							onClick: () => setPhoto(index),
							className: `h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper ring-offset-2 focus-visible:ring-2 focus-visible:ring-teal ${index === photoIndex ? "ring-2 ring-teal" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: url,
								alt: "",
								className: "h-full w-full object-cover"
							})
						}, `${url}-${index}`))
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "min-w-0 lg:col-start-2 lg:row-start-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "inline-flex items-center gap-2 text-sm font-medium text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, { slug: listing.categorySlug }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "whitespace-normal",
								children: listing.categoryName
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 text-3xl leading-tight font-semibold text-balance",
							children: listing.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-display text-4xl leading-none font-semibold tabular-nums",
							children: [formatArs(listing.priceCents), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-base font-medium text-muted",
								children: ["/ ", listing.unit]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-medium",
							children: stockLabel(listing.stockUnits, listing.unit)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: deliveryMode(canDeliver, canPickup)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: quoteBlocked,
								className: "min-h-11 rounded-full bg-ember px-5 text-sm font-semibold text-ink disabled:opacity-40",
								onClick: () => {
									if (quoteBlocked) return;
									if (!user) {
										sessionStorage.setItem("conex-after-auth", `/producto/${listing.id}?comprar=1`);
										navigate({ to: "/login" });
										return;
									}
									setBuyOpen(true);
									document.getElementById("comprar")?.scrollIntoView({ block: "nearest" });
								},
								children: "Comprar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#pedir-cotizacion",
								className: "inline-flex min-h-11 items-center rounded-full border border-ink px-5 text-sm font-semibold",
								children: "Consultar producto"
							})]
						}),
						quoteBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: !inStock ? "Sin stock: no se puede comprar este producto." : "Este producto no tiene entrega ni retiro, así que no se puede comprar."
						}) : null,
						buyOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							id: "comprar",
							className: "mt-4 grid scroll-mt-28 gap-3 rounded-2xl border border-line bg-card p-4",
							onSubmit: (event) => {
								event.preventDefault();
								if (quoteBlocked || buying) return;
								if (!user) {
									sessionStorage.setItem("conex-after-auth", `/producto/${listing.id}?comprar=1`);
									navigate({ to: "/login" });
									return;
								}
								const needsMethod = listing.paymentMethods.length > 0;
								if (needsMethod && !buyMethod) {
									toast.error("Elegí un medio de pago antes de confirmar.");
									return;
								}
								setBuying(true);
								const ship = buyDelivery && canDeliver;
								buyPublishedListing({ data: {
									listingId: listing.id,
									quantity: buyQty,
									delivery: ship,
									address: ship ? buyAddress : "",
									paymentMethod: needsMethod ? buyMethod : null,
									idempotencyKey: crypto.randomUUID()
								} }).then((order) => {
									toast.success("Compra registrada. Quedó pendiente de pago: no se cobró nada.");
									window.location.href = `/pedidos/${order.orderId}`;
								}).catch((cause) => {
									setBuying(false);
									toast.error(cause instanceof Error ? cause.message : "No se pudo crear la compra.");
								});
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: "Confirmar compra"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										listing.businessName,
										". Precio publicado: ",
										formatArs(listing.priceCents),
										" / ",
										listing.unit,
										". Stock: ",
										listing.stockUnits,
										"."
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									htmlFor: "conex-buy-quantity",
									children: ["Cantidad", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuantityField, {
										id: "conex-buy-quantity",
										name: "buy-quantity",
										value: buyQty,
										min: 1,
										max: Math.max(listing.stockUnits, 1),
										disabled: !inStock || buying,
										onChange: setBuyQty
									})]
								}),
								canDeliver && canPickup ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-2 text-sm",
									htmlFor: "conex-buy-delivery",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "conex-buy-delivery",
										name: "buy-delivery",
										type: "checkbox",
										checked: buyDelivery,
										onChange: (event) => setBuyDelivery(event.target.checked)
									}), "Quiero entrega"]
								}) : null,
								buyDelivery && canDeliver ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									htmlFor: "conex-buy-address",
									children: ["Dirección en Rosario", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "conex-buy-address",
										name: "buy-address",
										required: true,
										autoComplete: "street-address",
										value: buyAddress,
										onChange: (event) => setBuyAddress(event.target.value),
										className: "min-h-11 rounded-2xl border border-line bg-paper px-3"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Retiro en el negocio. No hace falta una dirección."
								}),
								listing.paymentMethods.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "grid gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
											className: "text-sm font-semibold",
											children: "¿Cómo querés pagar?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Solo los medios que este proveedor declaró. Elegir no confirma el pago."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodRadios, {
											name: `compra-${listing.id}`,
											codes: listing.paymentMethods,
											value: buyMethod,
											onChange: setBuyMethod
										}),
										buyMethod === "mercadopago" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Elegir Mercado Pago no aprueba el pago. Solo cuenta la confirmación de Mercado Pago."
										}) : null,
										buyMethod === "mercadopago" && paymentsMissing && paymentsMissing.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Mercado Pago no está configurado. No se inició un cobro."
										}) : null,
										buyMethod === "mercadopago" && business && !business.mercadoPago ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted",
											children: "Este negocio todavía no conectó Mercado Pago."
										}) : null
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Medios de pago: consultar con el proveedor. Confirmar no elige un medio ni confirma un pago."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium",
									children: ["Total: ", formatArs(listing.priceCents * buyQty + (buyDelivery && canDeliver ? listing.shippingCents : 0))]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: quoteBlocked || buying || listing.paymentMethods.length > 0 && !buyMethod,
									className: "min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink disabled:opacity-40",
									children: buying ? "Confirmando…" : "Confirmar compra"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-5",
							"aria-labelledby": "medios-pago",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									id: "medios-pago",
									className: "text-sm font-semibold",
									children: listing.paymentMethods.length > 0 ? "Medios de pago aceptados por el proveedor" : "Medios de pago"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodChips, { codes: listing.paymentMethods })
								}),
								listing.paymentMethods.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "El proveedor indicó que acepta estos medios. CONEX no verifica automáticamente que pueda cobrar con cada uno."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Este proveedor no declaró medios. CONEX no inventó ninguno."
								}),
								listing.paymentMethods.includes("mercadopago") && business && !business.mercadoPago ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Elegir Mercado Pago no inicia un cobro: este negocio todavía no lo conectó."
								}) : null
							]
						}),
						facts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-5 grid grid-cols-2 gap-3",
							children: facts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted",
									children: label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-sm font-medium break-words",
									children: value
								})]
							}, label))
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: "Descripción"
							}), listing.description.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed whitespace-pre-wrap",
								children: listing.description
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "Este producto no tiene descripción."
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0 rounded-2xl border border-line bg-card p-4 shadow-card lg:col-span-2 lg:col-start-1 lg:row-start-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal/15 font-display text-lg font-semibold text-olive",
								children: businessInitials(listing.businessName)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold tracking-wide text-olive uppercase",
										children: "Proveedor"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-1 text-2xl font-semibold break-words",
										children: listing.businessName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm font-medium",
										children: standing?.label ?? "Negocio aprobado para publicar"
									}),
									standing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: standing.detail
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: cityLine
									})
								]
							})]
						}),
						business ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-4 grid gap-2 text-sm sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-muted",
									children: "Productos publicados"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-medium",
									children: publishedCountLabel(publishedCount)
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
										business.reviewCount,
										" ",
										business.reviewCount === 1 ? "reseña" : "reseñas"
									]
								})] }) : null
							]
						}) : null,
						business ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: business.completedOrders > 0 || business.reviewCount > 0 ? "No hay tiempo de respuesta ni tasa de entrega: CONEX todavía no los registra." : "Sin datos suficientes para calificación, operaciones, tiempo de respuesta o entregas."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "Cargando datos del proveedor…"
						}),
						place ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm break-words text-muted",
							children: place
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "Rosario"
						}),
						business?.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: ["Teléfono: ", business.phone]
						}) : null,
						business?.coverageNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm",
							children: ["Zona declarada: ", business.coverageNote]
						}) : null,
						business?.minOrderNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: [
								"Compra mínima declarada: ",
								business.minOrderNote,
								". No se exige sola al consultar."
							]
						}) : null,
						business && (business.sellsWholesale || business.sellsRetail) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm",
							children: [business.sellsWholesale ? "Mayorista" : "", business.sellsRetail ? "Minorista" : ""].filter(Boolean).join(" · ")
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/negocio/$businessId",
							params: { businessId: listing.businessId },
							className: "mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
							children: "Ver proveedor"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "grid min-w-0 content-start gap-3 lg:sticky lg:top-24 lg:col-start-3 lg:row-start-1 lg:row-span-2 lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: "Entrega"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-3 grid gap-3 text-sm",
									children: [
										canPickup ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "font-medium",
											children: "Retiro en el negocio"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "text-muted",
											children: "Disponible"
										})] }) : null,
										canDeliver ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "font-medium",
											children: "Entrega"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "text-muted",
											children: listing.shippingCents === 0 ? "Envío sin cargo" : `Envío ${formatArs(listing.shippingCents)}`
										})] }) : null,
										listing.leadTimeHours !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "font-medium",
											children: "Tiempo de preparación"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
											className: "text-muted",
											children: [listing.leadTimeHours, " horas"]
										})] }) : null
									]
								}),
								!canDeliver && !canPickup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted",
									children: "Este producto no tiene entrega ni retiro publicados."
								}) : null,
								place ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm break-words text-muted",
									children: place
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: "Protección de la operación CONEX"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "Conocé cómo funciona la protección de tus operaciones y qué hacer ante un inconveniente."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "La consulta y, si aceptás la respuesta, la compra quedan registradas. El pago que entra en ese registro es el de Mercado Pago desde la compra. CONEX no retiene el dinero ni promete un reembolso automático."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/proteccion",
									className: "mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
									children: "Ver protección →"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							id: "pedir-cotizacion",
							className: "grid scroll-mt-28 gap-3 rounded-2xl border border-line bg-card p-4",
							onSubmit: (event) => {
								event.preventDefault();
								if (quoteBlocked || sending) return;
								if (!user) {
									navigate({ to: "/login" });
									return;
								}
								setSending(true);
								createQuoteRequest({ data: {
									listingId: listing.id,
									quantity,
									notes,
									address,
									delivery
								} }).then(async () => {
									toast.success("Tu consulta fue enviada al proveedor.");
									await navigate({ to: "/cotizaciones" });
								}).catch((cause) => {
									setSending(false);
									toast.error(cause instanceof Error ? cause.message : "No pudimos enviar la consulta. Revisá tu conexión e intentá nuevamente.");
								});
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-lg font-semibold",
									children: "¿Qué querés consultar?"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: "El proveedor recibe tu mensaje. Si aceptás su respuesta, se arma una compra."
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									htmlFor: "conex-quote-quantity",
									children: [
										"Cantidad",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted",
											children: "Cuántas unidades querés."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuantityField, {
											id: "conex-quote-quantity",
											name: "quantity",
											value: quantity,
											min: 1,
											max: Math.max(listing.stockUnits, 1),
											disabled: !inStock || sending,
											onChange: setQuantity
										})
									]
								}),
								canDeliver && canPickup ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-2 text-sm",
									htmlFor: "conex-quote-delivery",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "conex-quote-delivery",
										name: "delivery",
										type: "checkbox",
										checked: delivery,
										onChange: (event) => setDelivery(event.target.checked)
									}), "Quiero entrega"]
								}) : null,
								delivery && canDeliver ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									htmlFor: "conex-quote-address",
									children: ["Dirección en Rosario", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "conex-quote-address",
										name: "address",
										required: true,
										autoComplete: "street-address",
										value: address,
										onChange: (event) => setAddress(event.target.value),
										className: "min-h-11 rounded-2xl border border-line bg-paper px-3"
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-sm",
									htmlFor: "conex-quote-notes",
									children: [
										"Mensaje",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted",
											children: "Contale al proveedor qué necesitás saber."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											id: "conex-quote-notes",
											name: "notes",
											value: notes,
											onChange: (event) => setNotes(event.target.value),
											className: "min-h-20 rounded-2xl border border-line bg-paper px-3 py-2"
										})
									]
								}),
								quoteBlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: !inStock ? "Sin stock: no se puede consultar este producto." : "Este producto no tiene entrega ni retiro, así que no se puede consultar."
								}) : null,
								!user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Para enviarla tenés que entrar."
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: quoteBlocked || sending,
									className: "min-h-11 rounded-full border border-ink px-4 text-sm font-semibold disabled:opacity-40",
									children: sending ? "Consultando…" : "Consultar producto"
								})
							]
						})
					]
				})
			]
		}),
		others.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Más productos de este proveedor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/negocio/$businessId",
					params: { businessId: listing.businessId },
					className: "inline-flex min-h-11 items-center text-sm font-semibold text-olive",
					children: "Ver todos"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4",
				children: others.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/producto/$productId",
						params: { productId: item.id },
						className: "flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card",
						children: [item.imageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: item.imageUrl,
							alt: "",
							className: "aspect-square w-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid aspect-square place-items-center bg-paper text-sm text-muted",
							children: "Sin foto"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex flex-1 flex-col gap-1 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "line-clamp-2 text-sm font-semibold",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-semibold tabular-nums",
								children: formatArs(item.priceCents)
							})]
						})]
					})
				}, item.id))
			})]
		}) : null,
		listing.siblings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold",
				children: listing.standardProductName ? `Otras ofertas de ${listing.standardProductName}` : "Otras ofertas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2",
				children: listing.siblings.map((sibling) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/producto/$productId",
						params: { productId: sibling.id },
						className: "flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: sibling.businessName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [
								formatArs(sibling.priceCents),
								" · stock ",
								sibling.stockUnits
							]
						})]
					})
				}, sibling.id))
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-10 max-w-xl rounded-2xl border border-line p-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (!user) {
					navigate({ to: "/login" });
					return;
				}
				const form = event.currentTarget;
				const reason = String(new FormData(form).get("reason") ?? "");
				const details = String(new FormData(form).get("details") ?? "");
				submitReport({ data: {
					targetType: "listing",
					targetId: listing.id,
					reason,
					details
				} }).then(() => {
					toast.success("Reporte enviado. Un administrador lo revisa.");
					form.reset();
				}).catch((cause) => toast.error(cause instanceof Error ? cause.message : "No se envió."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: "Reportar este producto"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "No se publica. Queda para que un administrador lo revise."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 grid gap-1 text-sm",
					htmlFor: "conex-report-reason",
					children: ["Motivo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
						id: "conex-report-reason",
						name: "reason",
						required: true,
						defaultValue: "contenido",
						ariaLabel: "Motivo",
						options: [
							{
								value: "contenido",
								label: "Contenido inadecuado"
							},
							{
								value: "engano",
								label: "Información engañosa"
							},
							{
								value: "otro",
								label: "Otro"
							}
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-2 grid gap-1 text-sm",
					htmlFor: "conex-report-details",
					children: ["Detalle", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						id: "conex-report-details",
						name: "details",
						placeholder: "Opcional",
						className: "min-h-20 w-full rounded-2xl border border-line bg-paper px-3 py-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "mt-3 min-h-11 rounded-full border border-line px-4 text-sm font-semibold",
					children: user ? "Enviar reporte" : "Entrá para reportar"
				})
			]
		})
	] });
}
function stockLabel(stock, unit) {
	if (stock <= 0) return "Sin stock";
	if (unit === "unidad") return stock === 1 ? "En stock · 1 unidad" : `En stock · ${stock} unidades`;
	return `En stock · ${stock} ${unit}`;
}
function publishedCountLabel(count) {
	return count === 1 ? "1 producto publicado" : `${count} productos publicados`;
}
function deliveryMode(delivery, pickup) {
	if (delivery && pickup) return "Entrega y retiro.";
	if (delivery) return "Solo entrega.";
	if (pickup) return "Solo retiro.";
	return "Sin entrega ni retiro publicados.";
}
//#endregion
export { ProductPage as component };

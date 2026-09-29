import { o as __toESM } from "./_runtime.mjs";
import { l as paymentMethodByCode } from "./_ssr/payment-methods-BtOKvucv.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as Route$2 } from "./_ssr/router-CvWFEIdL.mjs";
import { a as RedirectToSignIn, d as getMyAccount, i as PaymentMethodToggles, o as Shell, t as PaymentMethodChips, y as useCurrentUserState } from "./_ssr/shell-CbJDficC.mjs";
import { n as parseArsToCents, t as formatArs } from "./_ssr/money-DSc2EJ_o.mjs";
import { t as ConexSelect } from "./_ssr/controls-DMCQZUQt.mjs";
import { r as CategoryGlyph } from "./_ssr/category-visual-BUjo7Qjd.mjs";
import { a as listListingOptions, c as prepareListingImage, d as saveListingImage, f as setListingPaymentMethods, h as updateListing, i as getMyListing, l as publishListing, m as setPrimaryImage, n as createListing, p as setListingStatus, r as deleteListingImage, s as moveListingImage, t as confirmListingImage, u as removeListing } from "./_ssr/listings-CqC7257q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_listingId-BJJp9Etk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		id: "producto",
		label: "Producto",
		title: "Producto",
		next: "Continuar con precio y disponibilidad"
	},
	{
		id: "precio",
		label: "Precio y disponibilidad",
		title: "Precio y disponibilidad",
		next: "Continuar con la entrega"
	},
	{
		id: "entrega",
		label: "Entrega",
		title: "¿Cómo puede recibirlo el comprador?",
		next: "Revisar y publicar"
	},
	{
		id: "revisar",
		label: "Revisar y publicar",
		title: "Así verán tu producto los compradores",
		next: ""
	}
];
var control = "min-h-11 w-full rounded-2xl border border-line bg-foam px-3 text-base";
function EditorPage() {
	const { listingId } = Route$2.useParams();
	const creating = listingId === "nuevo";
	const navigate = useNavigate();
	const { user, isPending } = useCurrentUserState();
	const [options, setOptions] = (0, import_react.useState)(null);
	const [businesses, setBusinesses] = (0, import_react.useState)(null);
	const [accountError, setAccountError] = (0, import_react.useState)("");
	const [optionsError, setOptionsError] = (0, import_react.useState)("");
	const [loadError, setLoadError] = (0, import_react.useState)("");
	const [loaded, setLoaded] = (0, import_react.useState)(creating);
	const [stepIndex, setStepIndex] = (0, import_react.useState)(0);
	const [businessId, setBusinessId] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [brand, setBrand] = (0, import_react.useState)("");
	const [model, setModel] = (0, import_react.useState)("");
	const [sku, setSku] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [standardProductId, setStandardProductId] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("");
	const [unit, setUnit] = (0, import_react.useState)("unidad");
	const [stock, setStock] = (0, import_react.useState)("");
	const [minStock, setMinStock] = (0, import_react.useState)(0);
	const [pickup, setPickup] = (0, import_react.useState)(true);
	const [delivery, setDelivery] = (0, import_react.useState)(false);
	const [shipping, setShipping] = (0, import_react.useState)("");
	const [hours, setHours] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)("draft");
	const [images, setImages] = (0, import_react.useState)([]);
	const [errors, setErrors] = (0, import_react.useState)({});
	const [formError, setFormError] = (0, import_react.useState)("");
	const [inheritPayments, setInheritPayments] = (0, import_react.useState)(true);
	const [productMethods, setProductMethods] = (0, import_react.useState)([]);
	function clearError(key) {
		setErrors((current) => {
			if (!current[key]) return current;
			const next = { ...current };
			delete next[key];
			return next;
		});
	}
	function payload(priceCents, shippingCents) {
		return {
			businessId,
			name,
			description,
			brand,
			model,
			sku,
			categoryId,
			standardProductId: standardProductId || null,
			priceCents,
			unit,
			referenceUnit: "",
			referencePriceCents: null,
			stockUnits: Number(stock),
			minStock,
			pickup,
			delivery,
			shippingCents,
			leadTimeHours: Number(hours)
		};
	}
	function validate() {
		const next = {};
		if (!businessId) next.business = "Elegí un negocio antes de continuar.";
		if (!name.trim()) next.name = "Escribí el nombre que van a ver los compradores.";
		if (!parseArsToCents(price)) next.price = "Ingresá el precio en pesos. Por ejemplo, 125000 es $ 125.000.";
		if (!unit.trim()) next.unit = "Indicá la unidad de venta. Por ejemplo, unidad, kg o litro.";
		if (!/^\d+$/.test(stock.trim())) next.stock = "Indicá el stock disponible. Si no tenés, escribí 0.";
		if (delivery) {
			if ((parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null)) === null) next.shipping = "Indicá el costo de envío en pesos. Si el envío no se cobra, escribí 0.";
		}
		if (!/^\d+$/.test(hours.trim())) next.hours = "Indicá el plazo en horas. Por ejemplo, 48 son dos días.";
		else if (Number(hours) > 2160) next.hours = "El plazo máximo es 2160 horas.";
		if (!categoryId) next.category = "Elegí una categoría final para que los compradores puedan encontrar tu producto.";
		if (Object.keys(next).length === 0) return null;
		return {
			step: next.business || next.name || next.category ? 0 : next.price || next.unit || next.stock ? 1 : 2,
			errors: next
		};
	}
	async function reload(id = listingId) {
		if (id === "nuevo") return;
		const listing = await getMyListing({ data: id });
		setBusinessId(listing.business_id);
		setName(listing.name);
		setBrand(listing.brand);
		setModel(listing.model);
		setSku(listing.sku);
		setDescription(listing.description);
		setCategoryId(listing.category_id);
		setStandardProductId(listing.standard_product_id ?? "");
		setPrice(centsToInput(listing.priceCents));
		setUnit(listing.unit);
		setStock(String(listing.stock_units));
		setMinStock(listing.min_stock);
		setPickup(listing.pickup);
		setDelivery(listing.delivery);
		setShipping(centsToInput(listing.shippingCents));
		setHours(listing.lead_time_hours == null ? "" : String(listing.lead_time_hours));
		setStatus(listing.status);
		setInheritPayments(listing.paymentInherit);
		setProductMethods(listing.paymentMethods);
		setImages(listing.images);
		setLoaded(true);
	}
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let cancelled = false;
		setAccountError("");
		listListingOptions().then((next) => {
			if (!cancelled) setOptions(next);
		}).catch((error) => {
			if (!cancelled) setOptionsError(friendlyError(error));
		});
		getMyAccount().then((account) => {
			if (!cancelled) setBusinesses(account.businesses);
		}).catch((error) => {
			if (!cancelled) {
				setBusinesses([]);
				setAccountError(friendlyError(error));
			}
		});
		if (!creating) reload().catch((error) => {
			if (!cancelled) setLoadError(error instanceof Error ? error.message : "No se pudo abrir.");
		});
		return () => {
			cancelled = true;
		};
	}, [user, listingId]);
	(0, import_react.useEffect)(() => {
		if (!creating || !businesses) return;
		const usable = businesses.filter(canUseBusiness);
		if (usable.some((business) => business.id === businessId)) return;
		const preferred = usable.find((business) => business.status === "active") ?? usable[0];
		if (preferred) setBusinessId(preferred.id);
	}, [
		creating,
		businesses,
		businessId
	]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Cargando tu cuenta…"
	}) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!creating && loadError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-4xl",
			children: "No se puede abrir este producto"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-xl text-sm",
			role: "alert",
			children: loadError
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/panel/productos",
			className: "mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-olive",
			children: "Volver a mis productos"
		})
	] });
	if (businesses === null || !creating && !loaded) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Cargando el formulario…"
	}) });
	const usable = businesses.filter(canUseBusiness);
	const selected = businesses.find((business) => business.id === businessId) ?? null;
	const suspendedOnly = usable.length === 0 && businesses.some((business) => !isDemo(business) && business.status === "suspended");
	if (creating && usable.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-4xl",
		children: "Agregar producto"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 max-w-xl rounded-card border border-line bg-foam p-4",
		role: "status",
		children: [
			accountError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: "No pudimos cargar tus negocios."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm",
				role: "alert",
				children: accountError
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: "No tenés un negocio disponible para publicar."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Primero creá tu negocio. Cuando esté disponible, vas a poder publicar productos desde acá."
			})] }),
			suspendedOnly ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm",
				children: "Tu negocio está suspendido. Mientras siga así no podés cargar productos."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/panel",
				className: "mt-4 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
				children: "Crear mi negocio"
			})
		]
	})] });
	const pendingSelected = selected?.status === "pending_review";
	const archived = status === "archived";
	const readyImages = images.filter((image) => image.status === "ready" && image.url);
	const priceCents = parseArsToCents(price);
	const categoryLabel = categoryLabelOf(options, categoryId);
	const standardLabel = options?.standards.find((item) => item.id === standardProductId)?.name ?? "";
	async function save(publish) {
		const found = validate();
		if (found) {
			setErrors(found.errors);
			setStepIndex(found.step);
			setFormError("Revisá los campos marcados antes de guardar.");
			return;
		}
		if (publish) {
			if (pendingSelected || selected?.status !== "active") {
				setStepIndex(3);
				setFormError("Tu negocio está pendiente de aprobación. Cuando sea aprobado vas a poder publicar productos.");
				return;
			}
			if (Number(stock) <= 0) {
				setStepIndex(1);
				setErrors((current) => ({
					...current,
					stock: "No se puede publicar sin stock. Cargá al menos 1."
				}));
				setFormError("No se puede publicar sin stock.");
				return;
			}
			if (!pickup && !delivery) {
				setStepIndex(2);
				setErrors((current) => ({
					...current,
					delivery: "Indicá retiro, envío o ambos."
				}));
				setFormError("Indicá retiro, envío o ambos.");
				return;
			}
			if (readyImages.length < 1) {
				setStepIndex(0);
				setFormError("Agregá al menos una foto para publicar.");
				return;
			}
		}
		const parsedPrice = parseArsToCents(price);
		const parsedShipping = delivery ? parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null) : 0;
		if (!parsedPrice) {
			setFormError("Revisá el precio.");
			setStepIndex(1);
			return;
		}
		if (parsedShipping === null) {
			setFormError("Revisá el costo de envío.");
			setStepIndex(2);
			return;
		}
		const body = payload(parsedPrice, parsedShipping);
		setFormError("");
		try {
			if (creating) {
				const created = await createListing({ data: body });
				await setListingPaymentMethods({ data: {
					listingId: created.id,
					inherit: inheritPayments,
					methods: productMethods
				} });
				toast.success("Borrador guardado. Ahora podés subir las fotos.");
				await navigate({
					to: "/panel/productos/$listingId",
					params: { listingId: created.id }
				});
				return;
			}
			if (archived) {
				setFormError("Un producto archivado no se edita.");
				return;
			}
			const updated = await updateListing({ data: {
				listingId,
				...body
			} });
			await setListingPaymentMethods({ data: {
				listingId,
				inherit: inheritPayments,
				methods: productMethods
			} });
			setStatus(updated.status);
			if (publish) {
				const published = await publishListing({ data: listingId });
				setStatus(published.status);
				toast.success("Tu producto ya está publicado.");
			} else toast.success("Cambios guardados. Los pedidos anteriores no cambian.");
			await reload();
		} catch (error) {
			setFormError(friendlyError(error));
		}
	}
	async function upload(file) {
		if (creating) {
			toast.error("Guardá el borrador antes de subir fotos.");
			return;
		}
		const prepared = await prepareListingImage({ data: {
			listingId,
			contentType: file.type || "application/octet-stream",
			byteSize: file.size
		} });
		if (prepared.mode === "direct") {
			const base64 = await fileToBase64(file);
			await saveListingImage({ data: {
				imageId: prepared.imageId,
				base64
			} });
		} else {
			if (!(await fetch(prepared.uploadUrl, {
				method: "PUT",
				headers: prepared.headers,
				body: file
			})).ok) throw new Error("El almacenamiento rechazó la imagen.");
			await confirmListingImage({ data: prepared.imageId });
		}
		await reload();
	}
	function continueStep() {
		if (stepIndex === 0) {
			const next = {};
			if (!name.trim()) next.name = "Escribí el nombre que van a ver los compradores.";
			if (!categoryId) next.category = "Elegí una categoría final para que los compradores puedan encontrar tu producto.";
			if (Object.keys(next).length > 0) {
				setErrors((current) => ({
					...current,
					...next
				}));
				return;
			}
		}
		if (stepIndex === 1) {
			const next = {};
			if (!parseArsToCents(price)) next.price = "Ingresá el precio en pesos. Por ejemplo, 125000 es $ 125.000.";
			if (!unit.trim()) next.unit = "Indicá la unidad de venta. Por ejemplo, unidad, kg o litro.";
			if (!/^\d+$/.test(stock.trim())) next.stock = "Indicá el stock disponible. Si no tenés, escribí 0.";
			if (Object.keys(next).length > 0) {
				setErrors((current) => ({
					...current,
					...next
				}));
				return;
			}
		}
		if (stepIndex === 2) {
			const next = {};
			if (delivery && (parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null)) === null) next.shipping = "Indicá el costo de envío en pesos. Si el envío no se cobra, escribí 0.";
			if (!/^\d+$/.test(hours.trim())) next.hours = "Indicá el plazo en horas. Por ejemplo, 48 son dos días.";
			if (Object.keys(next).length > 0) {
				setErrors((current) => ({
					...current,
					...next
				}));
				return;
			}
		}
		setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
	}
	const step = STEPS[stepIndex] ?? STEPS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: creating ? "Nuevo borrador" : `Estado: ${statusLabel(status)}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-2 text-4xl",
			children: creating ? "Agregar producto" : name || "Editar producto"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mb-4 flex flex-wrap gap-2 text-sm",
			children: STEPS.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-current": index === stepIndex ? "step" : void 0,
				onClick: () => setStepIndex(index),
				className: `min-h-11 rounded-full px-3 ${index === stepIndex ? "bg-ink font-semibold text-paper" : "border border-line bg-paper"}`,
				children: [
					index + 1,
					". ",
					item.label
				]
			}) }, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid max-w-3xl gap-4",
			noValidate: true,
			onSubmit: (event) => {
				event.preventDefault();
				save(false);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusinessBlock, {
					businesses: creating ? usable : businesses.filter((business) => !isDemo(business)),
					businessId,
					creating,
					error: errors.business,
					onChange: (value) => {
						setBusinessId(value);
						clearError("business");
					}
				}),
				pendingSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-line bg-paper p-3 text-sm",
					role: "status",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "Tu negocio está pendiente de aprobación."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: "Cuando sea aprobado vas a poder publicar productos. Mientras tanto podés dejar el borrador listo."
					})]
				}) : null,
				formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					role: "alert",
					children: formError
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-4 rounded-card border border-line bg-foam p-4",
					"aria-labelledby": "conex-listing-step-title",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									"Paso ",
									stepIndex + 1,
									" de ",
									STEPS.length
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "conex-listing-step-title",
								className: "text-2xl",
								children: step.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: stepHelp(stepIndex, creating)
							})
						] }),
						stepIndex === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoStep, {
							creating,
							archived,
							images,
							readyCount: readyImages.length,
							storage: options?.storage,
							onUpload: upload,
							onReload: () => void reload().catch((error) => setFormError(friendlyError(error)))
						}) : null,
						stepIndex === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-name",
									label: "Nombre del producto",
									hint: "Es el nombre que verán los compradores.",
									error: errors.name,
									children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id,
										name: "name",
										required: true,
										maxLength: 140,
										value: name,
										"aria-describedby": describedBy,
										"aria-invalid": invalid,
										placeholder: "iPhone 13 128 GB",
										onChange: (event) => {
											setName(event.target.value);
											clearError("name");
										},
										className: control
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 md:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											id: "conex-listing-brand",
											label: "Marca",
											optional: true,
											hint: "Ejemplo: Samsung, Apple, Bosch. Si no aplica, podés dejarlo vacío.",
											children: ({ id, describedBy }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id,
												name: "brand",
												maxLength: 80,
												value: brand,
												"aria-describedby": describedBy,
												onChange: (event) => setBrand(event.target.value),
												placeholder: "Apple",
												className: control
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											id: "conex-listing-model",
											label: "Modelo",
											optional: true,
											hint: "Opcional. Ejemplo: 128 GB o GSR 120.",
											children: ({ id, describedBy }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id,
												name: "model",
												maxLength: 80,
												value: model,
												"aria-describedby": describedBy,
												onChange: (event) => setModel(event.target.value),
												placeholder: "A2633",
												className: control
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											id: "conex-listing-sku",
											label: "Código interno",
											optional: true,
											hint: "Opcional. Es un código para vos. Si lo completás, el comprador también puede verlo.",
											children: ({ id, describedBy }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id,
												name: "sku",
												maxLength: 64,
												value: sku,
												"aria-describedby": describedBy,
												onChange: (event) => setSku(event.target.value),
												placeholder: "CEL-13-128",
												className: control
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-description",
									label: "Descripción del producto",
									optional: true,
									hint: "Contá qué incluye, características importantes, estado y cualquier detalle que ayude al comprador a decidir.",
									children: ({ id, describedBy }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										id,
										name: "description",
										maxLength: 4e3,
										value: description,
										"aria-describedby": describedBy,
										placeholder: "iPhone 13 sellado, 128 GB, color negro. Incluye caja y accesorios originales.",
										onChange: (event) => setDescription(event.target.value),
										className: "min-h-28 w-full rounded-2xl border border-line bg-foam px-3 py-2 text-base"
									})
								})
							]
						}) : null,
						stepIndex === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 md:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										id: "conex-listing-price",
										label: "Precio",
										hint: "Precio por unidad. 125000 significa $ 125.000.",
										error: errors.price,
										children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-h-11 items-center rounded-2xl border border-line bg-foam px-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												className: "text-sm font-semibold",
												children: "$"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id,
												name: "price",
												required: true,
												inputMode: "decimal",
												value: price,
												"aria-describedby": describedBy,
												"aria-invalid": invalid,
												placeholder: "125000",
												onChange: (event) => {
													setPrice(event.target.value);
													clearError("price");
												},
												className: "min-h-11 w-full bg-transparent px-2 text-base outline-none"
											})]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										id: "conex-listing-unit",
										label: "Unidad",
										hint: "Cómo se vende. Por ejemplo: unidad, kg, metro, litro o caja.",
										error: errors.unit,
										children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id,
											name: "unit",
											required: true,
											maxLength: 40,
											list: "conex-listing-units",
											value: unit,
											"aria-describedby": describedBy,
											"aria-invalid": invalid,
											onChange: (event) => {
												setUnit(event.target.value);
												clearError("unit");
											},
											className: control
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("datalist", {
											id: "conex-listing-units",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "unidad" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "kg" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "metro" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "litro" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "caja" })
											]
										})] })
									})]
								}),
								priceCents ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm",
									children: [
										"El comprador va a ver ",
										formatArs(priceCents),
										" por ",
										unit.trim() || "unidad",
										"."
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-stock",
									label: "Stock disponible",
									hint: "Cantidad disponible para vender. Si es 0, el producto no se puede publicar.",
									error: errors.stock,
									children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id,
										name: "stock",
										required: true,
										inputMode: "numeric",
										min: 0,
										value: stock,
										"aria-describedby": describedBy,
										"aria-invalid": invalid,
										placeholder: "0",
										onChange: (event) => {
											setStock(event.target.value);
											clearError("stock");
										},
										className: control
									})
								})
							]
						}) : null,
						stepIndex === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "Elegí retiro, envío o los dos. Para publicar hace falta al menos uno."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "grid gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
											className: "text-sm font-semibold",
											children: "Cómo lo recibe el comprador"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											htmlFor: "conex-listing-pickup",
											className: "flex min-h-11 items-start gap-3 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "conex-listing-pickup",
												name: "pickup",
												type: "checkbox",
												className: "mt-1 size-4",
												checked: pickup,
												onChange: (event) => {
													setPickup(event.target.checked);
													clearError("delivery");
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Retiro en el local"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												id: "conex-listing-pickup-hint",
												className: "mt-1 block text-muted",
												children: "El comprador retira el producto en tu negocio."
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											htmlFor: "conex-listing-delivery",
											className: "flex min-h-11 items-start gap-3 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "conex-listing-delivery",
												name: "delivery",
												type: "checkbox",
												className: "mt-1 size-4",
												checked: delivery,
												"aria-describedby": "conex-listing-delivery-hint",
												onChange: (event) => {
													setDelivery(event.target.checked);
													clearError("delivery");
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Envío"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												id: "conex-listing-delivery-hint",
												className: "mt-1 block text-muted",
												children: "Activá esta opción si entregás el producto a domicilio."
											})] })]
										}),
										errors.delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											id: "conex-listing-delivery-error",
											role: "alert",
											className: "text-sm font-medium",
											children: errors.delivery
										}) : null
									]
								}),
								delivery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-shipping",
									label: "Costo de envío",
									hint: "Indicá cuánto cuesta el envío, en pesos. Si no se cobra, escribí 0.",
									error: errors.shipping,
									children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-h-11 items-center rounded-2xl border border-line bg-foam px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: "text-sm font-semibold",
											children: "$"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id,
											name: "shipping",
											inputMode: "decimal",
											value: shipping,
											"aria-describedby": describedBy,
											"aria-invalid": invalid,
											placeholder: "0",
											onChange: (event) => {
												setShipping(event.target.value);
												clearError("shipping");
											},
											className: "min-h-11 w-full bg-transparent px-2 text-base outline-none"
										})]
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-hours",
									label: "Tiempo estimado",
									hint: "Horas hasta tener el producto listo. Por ejemplo, 48 son dos días. El comprador ve este número.",
									error: errors.hours,
									children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-foam px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id,
											name: "hours",
											required: true,
											inputMode: "numeric",
											min: 0,
											max: 2160,
											value: hours,
											"aria-describedby": describedBy,
											"aria-invalid": invalid,
											placeholder: "48",
											onChange: (event) => {
												setHours(event.target.value);
												clearError("hours");
											},
											className: "min-h-11 w-full bg-transparent text-base outline-none"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm text-muted",
											children: "horas"
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
									className: "grid gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
											className: "text-sm font-semibold",
											children: "Medios de pago de este producto"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex min-h-11 items-start gap-3 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "mt-1 size-4",
												checked: inheritPayments,
												onChange: (event) => {
													const on = event.target.checked;
													setInheritPayments(on);
													if (!on && productMethods.length === 0) setProductMethods(selected?.paymentMethods ?? []);
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Usar medios de pago de mi negocio"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-muted",
												children: "Si lo dejás así, no tenés que repetirlos en cada producto."
											})] })]
										}),
										inheritPayments ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodChips, { codes: selected?.paymentMethods ?? [] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm text-muted",
											children: "El comprador va a ver solo estos. CONEX no verifica que puedas cobrar con cada uno."
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodToggles, {
											selected: productMethods,
											onChange: setProductMethods
										})
									]
								})
							]
						}) : null,
						stepIndex === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-semibold",
									children: "Categoría"
								}),
								optionsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									role: "alert",
									children: optionsError
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-category",
									label: "Categoría",
									hint: "Elegí dónde se encuentra tu producto. Si hay subcategorías, elegí la más específica.",
									error: errors.category,
									children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
										id,
										name: "category",
										required: true,
										value: categoryId,
										describedBy,
										invalid,
										placeholder: "Elegir categoría",
										onChange: (next) => {
											setCategoryId(next);
											clearError("category");
										},
										options: [{
											value: "",
											label: "Elegir categoría"
										}, ...categoryGroups(options?.categories ?? []).flatMap((group) => group.items.map((category) => ({
											value: category.id,
											label: category.name,
											group: group.parent,
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
												slug: category.slug,
												icon: category.icon,
												parentIcon: category.parent_icon
											})
										})))]
									})
								}),
								options && options.standards.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									id: "conex-listing-standard",
									label: "Comparar con otros productos",
									optional: true,
									hint: "Opcional. Si lo vinculás a una referencia existente, se puede mostrar junto a otros que eligieron la misma. Si no corresponde, dejá “No comparar”.",
									children: ({ id, describedBy }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
										id,
										name: "standard",
										value: standardProductId,
										describedBy,
										placeholder: "No comparar",
										onChange: setStandardProductId,
										options: [{
											value: "",
											label: "No comparar"
										}, ...options.standards.map((standard) => ({
											value: standard.id,
											label: `${standard.name} (${standard.unit})`
										}))]
									})
								}) : null
							]
						}) : null,
						stepIndex === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BuyerPreview, {
							images: readyImages,
							name,
							brand,
							model,
							sku,
							category: categoryLabel,
							priceCents,
							unit,
							stock: /^\d+$/.test(stock) ? Number(stock) : null,
							pickup,
							delivery,
							shipping: delivery ? parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null) : null,
							hours: /^\d+$/.test(hours) ? Number(hours) : null,
							description,
							business: selected,
							paymentMethods: inheritPayments ? selected?.paymentMethods ?? [] : productMethods
						}) : null,
						stepIndex === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 text-sm",
							children: [
								status === "published" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-2xl border border-line bg-paper p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: "Tu producto está publicado"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-muted",
											children: "Los compradores ya pueden encontrarlo."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 flex flex-wrap gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/producto/$productId",
													params: { productId: listingId },
													className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
													children: "Ver producto"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/panel/productos/$listingId",
													params: { listingId: "nuevo" },
													className: "inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-semibold",
													children: "Publicar otro producto"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/panel",
													className: "inline-flex min-h-11 items-center text-sm font-semibold text-olive",
													children: "Ir a mi negocio"
												})
											]
										})
									]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "grid gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Producto",
											value: name.trim() || "Sin nombre"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Precio",
											value: priceCents ? `${formatArs(priceCents)} / ${unit.trim() || "unidad"}` : "Sin precio"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Stock",
											value: /^\d+$/.test(stock) ? `${stock} ${unit.trim() || "unidad"}` : "Sin indicar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Categoría",
											value: categoryLabel || "Sin categoría"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Entrega",
											value: deliverySentence(pickup, delivery, delivery ? parseArsToCents(shipping) ?? (shipping.trim() === "0" ? 0 : null) : null, /^\d+$/.test(hours) ? Number(hours) : null)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Medios de pago",
											value: paymentSummary(inheritPayments, selected?.paymentMethods ?? [], productMethods)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Negocio",
											value: selected ? `${selected.trade_name}${pendingSelected ? " · pendiente de aprobación" : ""}` : "Sin negocio"
										}),
										standardLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Summary, {
											term: "Comparación",
											value: standardLabel
										}) : null
									]
								}),
								!creating && !archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2 border-t border-line pt-3",
									children: [
										status === "published" || status === "out_of_stock" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-11 rounded-full border border-ink px-4",
											onClick: () => void setListingStatus({ data: {
												listingId,
												action: "pause"
											} }).then(() => reload()),
											children: "Pausar"
										}) : null,
										status === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-11 rounded-full border border-ink px-4",
											onClick: () => void setListingStatus({ data: {
												listingId,
												action: "reactivate"
											} }).then(() => reload()).catch((error) => setFormError(friendlyError(error))),
											children: "Reactivar"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "cx-danger min-h-11 rounded-full border border-line px-4",
											onClick: () => {
												if (!window.confirm("¿Querés eliminar este producto? Si tiene historial de consultas o compras, se archiva para no perderlo.")) return;
												removeListing({ data: listingId }).then(async (result) => {
													toast.message(result.message);
													if (result.deleted) await navigate({ to: "/panel/productos" });
													else await reload();
												}).catch((error) => setFormError(friendlyError(error)));
											},
											children: "Eliminar"
										})
									]
								}) : null
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								step.next ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink",
									onClick: continueStep,
									children: step.next
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "min-h-11 rounded-full border border-ink px-4 text-sm font-semibold",
									disabled: archived,
									children: "Guardar borrador"
								}),
								!creating && stepIndex === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "min-h-11 rounded-full bg-ember px-4 text-sm font-semibold text-ink",
									disabled: archived,
									onClick: () => void save(true),
									children: "Publicar producto"
								}) : null
							]
						}),
						creating && stepIndex === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Primero guardá el borrador y subí al menos una foto en el paso Producto. Después vas a poder publicarlo desde acá."
						}) : null
					]
				})
			]
		})
	] });
}
function BusinessBlock({ businesses, businessId, creating, error, onChange }) {
	const selected = businesses.find((business) => business.id === businessId) ?? businesses[0];
	if (!creating && selected) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm font-semibold",
		children: "Negocio"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		id: "conex-listing-business-note",
		className: "mt-1 text-sm",
		children: ["Este producto se publicará en: ", selected.trade_name]
	})] });
	if (businesses.length === 1 && selected) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold",
			children: "Negocio"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			id: "conex-listing-business-note",
			className: "mt-1 text-sm",
			children: ["Este producto se publicará en: ", selected.trade_name]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: "Es el único negocio disponible en tu cuenta."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			role: "alert",
			className: "mt-1 text-sm font-medium",
			children: error
		}) : null
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		id: "conex-listing-business",
		label: "Negocio",
		hint: "Elegí el negocio desde el que vas a publicar este producto.",
		error,
		children: ({ id, describedBy, invalid }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConexSelect, {
			id,
			name: "business",
			required: true,
			value: businessId,
			describedBy,
			invalid,
			placeholder: "Elegí un negocio",
			onChange,
			options: [{
				value: "",
				label: "Elegí un negocio"
			}, ...businesses.map((business) => ({
				value: business.id,
				label: `${business.trade_name} · ${businessStatusLabel(business.status)}`
			}))]
		})
	});
}
function PhotoStep({ creating, archived, images, readyCount, onUpload, onReload }) {
	const full = images.length >= 8;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Fotos del producto"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Agregá hasta 8 fotos. La primera será la principal. JPEG, PNG o WebP, hasta 4 MB cada una."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: readyCount > 0 ? `Fotos listas: ${readyCount}.` : "Hace falta al menos una foto para publicar. Podés guardar el borrador sin fotos."
			}),
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-2xl bg-paper p-3 text-sm",
				children: "Las fotos se suben cuando el borrador ya está guardado. Completá los datos y usá Guardar borrador. Después vas a volver a este paso."
			}) : archived ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: "Un producto archivado no se edita."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				htmlFor: "conex-listing-photos",
				className: "grid min-h-28 place-items-center rounded-2xl border border-dashed border-line bg-paper px-3 py-4 text-center text-sm",
				onDragOver: (event) => event.preventDefault(),
				onDrop: (event) => {
					event.preventDefault();
					if (full) return;
					const files = [...event.dataTransfer.files];
					Promise.all(files.map((file) => onUpload(file))).catch((error) => toast.error(friendlyError(error)));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: "Fotos del producto"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 text-muted",
						children: full ? "Llegaste al máximo de 8 fotos." : "Arrastrá fotos o elegilas del teléfono."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "conex-listing-photos",
						name: "photos",
						type: "file",
						accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg",
						multiple: true,
						capture: "environment",
						disabled: full,
						className: "mt-2 max-w-full text-sm",
						onChange: (event) => {
							const files = [...event.target.files ?? []];
							event.target.value = "";
							Promise.all(files.map((file) => onUpload(file))).catch((error) => toast.error(friendlyError(error)));
						}
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: images.map((image) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 rounded-2xl border border-line p-2",
					children: [
						image.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: image.url,
							alt: "",
							className: "h-16 w-16 rounded-xl object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "Pendiente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: image.isPrimary ? "Foto principal" : image.status === "ready" ? "Lista" : "Pendiente"
						}),
						image.status === "ready" && !image.isPrimary ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-10 rounded-full border border-line px-3",
							onClick: () => void setPrimaryImage({ data: image.id }).then(onReload),
							children: "Hacer principal"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-10 rounded-full border border-line px-3",
							onClick: () => void moveListingImage({ data: {
								imageId: image.id,
								direction: "up"
							} }).then(onReload),
							children: "Mover arriba"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-10 rounded-full border border-line px-3",
							onClick: () => void moveListingImage({ data: {
								imageId: image.id,
								direction: "down"
							} }).then(onReload),
							children: "Mover abajo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "cx-danger min-h-10 rounded-full border border-line px-3",
							onClick: () => void deleteListingImage({ data: image.id }).then(onReload).catch((error) => toast.error(friendlyError(error))),
							children: "Quitar"
						})
					]
				}, image.id))
			})] })
		]
	});
}
function BuyerPreview({ images, name, brand, model, sku, category, priceCents, unit, stock, pickup, delivery, shipping, hours, description, business, paymentMethods }) {
	const meta = [
		brand.trim(),
		model.trim(),
		sku.trim() ? `SKU ${sku.trim()}` : ""
	].filter(Boolean).join(" · ");
	const photo = images.find((image) => image.isPrimary)?.url ?? images[0]?.url ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "grid gap-4 md:grid-cols-2",
		children: [photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: photo,
			alt: name || "Foto del producto",
			className: "aspect-square w-full rounded-2xl object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid aspect-square place-items-center rounded-2xl bg-paper px-4 text-center text-sm text-muted",
			children: "Todavía no hay fotos."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: category || "Sin categoría"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-1 text-2xl",
					children: name.trim() || "Sin nombre"
				}),
				meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: meta
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-display text-3xl",
					children: [priceCents ? formatArs(priceCents) : "Sin precio", unit.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-2 text-base text-muted",
						children: ["/ ", unit.trim()]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: stock !== null && stock > 0 ? `En stock · ${stock} ${unit.trim() || "unidad"}` : "Sin stock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: deliverySentence(pickup, delivery, shipping, hours)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: paymentMethods.length > 0 ? "Medios de pago aceptados por el proveedor" : "Medios de pago"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodChips, { codes: paymentMethods })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm font-semibold",
					children: business?.trade_name ?? "Sin negocio"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: publicPlace(business)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "mt-4 text-base font-semibold",
					children: "Descripción"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm whitespace-pre-wrap",
					children: description.trim() || "Sin descripción."
				})
			]
		})]
	});
}
function Field({ id, label, hint, optional, error, children }) {
	const hintId = hint ? `${id}-hint` : void 0;
	const errorId = error ? `${id}-error` : void 0;
	const describedBy = [hintId, errorId].filter(Boolean).join(" ") || void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				htmlFor: id,
				className: "text-sm font-semibold",
				children: [label, optional ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-normal text-muted",
					children: " (opcional)"
				}) : null]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: hintId,
				className: "text-sm text-muted",
				children: hint
			}) : null,
			children({
				id,
				describedBy,
				invalid: Boolean(error)
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				id: errorId,
				role: "alert",
				className: "text-sm font-medium",
				children: error
			}) : null
		]
	});
}
function paymentSummary(inherit, businessMethods, productMethods) {
	const codes = inherit ? businessMethods : productMethods;
	if (codes.length === 0) return inherit ? "El negocio no declaró medios" : "Ninguno en este producto";
	const names = codes.map((code) => paymentMethodByCode(code)?.name).filter((name) => Boolean(name));
	if (names.length === 0) return inherit ? "El negocio no declaró medios" : "Ninguno en este producto";
	return inherit ? `Los del negocio: ${names.join(", ")}` : names.join(", ");
}
function Summary({ term, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-0.5 border-b border-line py-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "font-semibold",
			children: term
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "min-w-0 break-words",
			children: value
		})]
	});
}
function stepHelp(step, creating) {
	if (step === 0) return creating ? "Fotos, datos y categoría. En un producto nuevo, guardá el borrador antes de subir fotos. La primera foto será la principal." : "Fotos, nombre, descripción y categoría. La primera foto será la principal.";
	if (step === 1) return "El precio es por unidad. El stock es la cantidad disponible para vender.";
	if (step === 2) return "Elegí retiro, envío o los dos. El costo de envío aparece solo si ofrecés envío.";
	return "Revisá cómo lo van a ver los compradores. Si algo no cierra, volvé al paso correspondiente.";
}
function deliverySentence(pickup, delivery, shipping, hours) {
	return `${delivery && pickup ? "Entrega y retiro." : delivery ? "Solo entrega." : pickup ? "Solo retiro." : "Sin entrega ni retiro."}${delivery && shipping !== null ? ` Envío: ${formatArs(shipping)}.` : ""}${hours !== null ? ` Plazo: ${hours} horas.` : ""}`;
}
function publicPlace(business) {
	if (!business) return "Rosario";
	if (business.location_visibility === "approximate") return [business.neighborhood, "ubicación aproximada"].filter((part) => part && part.trim()).join(" · ") || "Ubicación aproximada";
	return [
		business.address_line,
		business.neighborhood,
		"Rosario"
	].filter((part) => part && part.trim()).join(" · ");
}
function categoryGroups(categories) {
	const groups = [];
	for (const category of categories) {
		const last = groups[groups.length - 1];
		if (!last || last.parent !== category.parent_name) groups.push({
			parent: category.parent_name,
			items: [category]
		});
		else last.items.push(category);
	}
	return groups;
}
function categoryLabelOf(options, categoryId) {
	const category = options?.categories.find((item) => item.id === categoryId);
	if (!category) return "";
	return `${category.parent_name} → ${category.name}`;
}
function canUseBusiness(business) {
	return !isDemo(business) && business.status !== "suspended";
}
function isDemo(business) {
	const value = business.is_demo;
	return value === true || value === "t" || value === 1;
}
function businessStatusLabel(status) {
	if (status === "active") return "Aprobado";
	if (status === "pending_review") return "Pendiente de aprobación";
	if (status === "suspended") return "Suspendido";
	return status;
}
function statusLabel(status) {
	if (status === "draft") return "borrador";
	if (status === "published") return "publicado";
	if (status === "paused") return "pausado";
	if (status === "out_of_stock") return "sin stock";
	if (status === "archived") return "archivado";
	return status;
}
function friendlyError(error) {
	const message = error instanceof Error ? error.message : "No se pudo guardar.";
	if (message === "Elegí el negocio.") return "Elegí un negocio antes de continuar.";
	if (message.includes("tiene que estar aprobado")) return "Tu negocio está pendiente de aprobación. Cuando sea aprobado vas a poder publicar productos.";
	if (message === "No podés cargar productos en un negocio que no es tuyo.") return "No encontramos un negocio disponible para publicar. Creá tu negocio o esperá a que sea aprobado.";
	return message;
}
function centsToInput(cents) {
	const whole = Math.trunc(cents / 100);
	const frac = Math.abs(cents % 100);
	if (frac === 0) return String(whole);
	return `${whole},${String(frac).padStart(2, "0")}`;
}
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("No se pudo leer la imagen."));
		reader.onload = () => {
			const encoded = String(reader.result ?? "").split(",")[1];
			if (!encoded) reject(/* @__PURE__ */ new Error("No se pudo leer la imagen."));
			else resolve(encoded);
		};
		reader.readAsDataURL(file);
	});
}
//#endregion
export { EditorPage as component };

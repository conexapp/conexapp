import { o as __toESM } from "../_runtime.mjs";
import { p as parseSellerIntent } from "./seller-profile-B9jvPmNx.mjs";
import { n as assertString } from "./helpers-AwcxVs0A.mjs";
import { a as hasGateSessionMarker } from "./server-kpnKyvB7.mjs";
import { c as normalizePaymentMethods, l as paymentMethodByCode, n as PAYMENT_METHODS, r as RETIRED_PAYMENT_LABEL, t as PAYMENT_CATALOG_DISCLAIMERS } from "./payment-methods-BtOKvucv.mjs";
import { C as useNavigate, Q as require_react, S as Navigate, T as require_jsx_runtime, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { K as ClipboardList, N as Landmark, O as MapPin, Y as ChevronDown, _ as Shield, h as ShoppingBag, it as BadgeCheck, v as Search } from "../_libs/lucide-react.mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut, t as authClient } from "./client-IWHfIGH2.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { r as insideRosario } from "./geo-BwvVDJHB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-CbJDficC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const sessionUser = data?.user;
	const id = sessionUser?.id;
	const name = sessionUser?.name;
	const email = sessionUser?.email;
	const image = sessionUser?.image;
	return {
		user: (0, import_react.useMemo)(() => {
			if (!id) return null;
			return {
				id,
				displayName: name ?? null,
				primaryEmail: email ?? null,
				profileImageUrl: image ?? null,
				isDevFallback: false
			};
		}, [
			id,
			name,
			email,
			image
		]),
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/** Render children only when a user is present (real session, or the disabled-auth dev user). */
function SignedIn({ children }) {
	const { user } = useCurrentUserState();
	return user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children }) : null;
}
/**
* Render children only once we KNOW the visitor is signed out (`isPending` has
* cleared and there is no user). Hidden while the session is still loading.
*/
function SignedOut({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending || user) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-8 place-items-center rounded-full bg-teal/15 text-sm font-semibold text-olive",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm text-olive underline-offset-4 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Saliendo…" : "Salir"
			})
		]
	});
}
var GROUP_LABEL = {
	plataforma: "Plataforma",
	tarjeta: "Tarjetas",
	transferencia: "Transferencia"
};
/** Abreviatura propia de CONEX. No imita el logo, el color ni la forma de la marca. */
var NEUTRAL_MARK = {
	mercadopago: "MP",
	visa_debito: "V",
	visa_credito: "V",
	mastercard_debito: "MC",
	mastercard_credito: "MC",
	amex: "AE",
	cabal: "C",
	naranja: "NX"
};
function Mark({ method }) {
	if (method.code === "transferencia") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, {
		className: "size-4 shrink-0 text-ink",
		"aria-hidden": true
	});
	const letters = NEUTRAL_MARK[method.code];
	if (!letters) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"aria-hidden": true,
		className: "grid h-5 min-w-5 shrink-0 place-items-center rounded-md border border-line bg-paper px-0.5 text-[10px] leading-none font-semibold tracking-tight text-ink",
		children: letters
	});
}
function MethodLabel({ method }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex min-w-0 items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { method }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "whitespace-normal break-words",
			children: method.name
		})]
	});
}
function PaymentMethodInline({ code }) {
	const method = paymentMethodByCode(code);
	if (!method) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: RETIRED_PAYMENT_LABEL });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodLabel, { method });
}
function PaymentMethodChips({ codes }) {
	if (codes.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Medios de pago: consultar con el proveedor."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-wrap gap-2",
		children: codes.map((code) => {
			const method = paymentMethodByCode(code);
			if (!method) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "max-w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-sm font-medium",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodLabel, { method })
				})
			}, code);
		})
	});
}
function PaymentMethodToggles({ selected, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4",
		children: [
			"plataforma",
			"tarjeta",
			"transferencia"
		].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
			className: "grid min-w-0 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
				className: "text-sm font-semibold",
				children: GROUP_LABEL[group]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-wrap gap-2",
				children: PAYMENT_METHODS.filter((method) => method.group === group).map((method) => {
					const on = selected.includes(method.code);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "max-w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: `inline-flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-medium ${on ? "border-teal bg-teal/10" : "border-line bg-paper"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								className: "size-4 shrink-0",
								checked: on,
								onChange: () => {
									onChange(on ? selected.filter((code) => code !== method.code) : [...selected, method.code]);
								}
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodLabel, { method })]
						})
					}, method.code);
				})
			})]
		}, group))
	});
}
function PaymentMethodRadios({ name, codes, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "radiogroup",
		"aria-label": "Cómo querés pagar",
		className: "flex flex-wrap gap-2",
		children: codes.map((code) => {
			const method = paymentMethodByCode(code);
			if (!method) return null;
			const on = value === code;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: `inline-flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-medium ${on ? "border-teal bg-teal/10" : "border-line bg-paper"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "radio",
					name,
					className: "size-4 shrink-0",
					checked: on,
					onChange: () => onChange(code)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodLabel, { method })]
			}, code);
		})
	});
}
/** Lista informativa del footer. Sale del mismo catálogo. No selecciona ni cobra. */
function PaymentMethodsNotice() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3",
			children: PAYMENT_METHODS.map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodLabel, { method })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-snug break-words text-muted",
					children: method.notice
				})]
			}, method.code))
		}), PAYMENT_CATALOG_DISCLAIMERS.map((text) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm leading-snug break-words text-muted",
			children: text
		}, text))]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getMyAccount = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("4aba93c8662aeff5a995730eae5280b597f453d9df364fbab0e5bcd9b3c092c0"));
var updateMyPhone = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((phone) => {
	const value = assertString(phone, "Teléfono", 30);
	if (!/^[0-9+\s()-]{8,30}$/.test(value)) throw new Error("Teléfono argentino inválido.");
	return value;
}).handler(createSsrRpc("ae8d45090271869dc24f27778ba1febaaf6770f9494d2e536e22cd112c376fe5"));
var saveSellerIntent = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => parseSellerIntent(input)).handler(createSsrRpc("15346e90f0b39728b0ccb2955f29dc93080e3e6a79366d1c5e68c8b9eb78558b"));
var updateBusinessCommercial = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId || input.businessId.length > 80) throw new Error("Falta el negocio.");
	return {
		businessId: input.businessId,
		description: typeof input.description === "string" ? input.description.trim().slice(0, 600) : "",
		coverageNote: typeof input.coverageNote === "string" ? input.coverageNote.trim().slice(0, 160) : "",
		minOrderNote: typeof input.minOrderNote === "string" ? input.minOrderNote.trim().slice(0, 160) : "",
		sellsWholesale: input.sellsWholesale === true,
		sellsRetail: input.sellsRetail === true
	};
}).handler(createSsrRpc("b6eb131d14db1869752997708341e09dbb163c98918cace2baea2c6fc64adfd1"));
var setBusinessPaymentMethods = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId || input.businessId.length > 80) throw new Error("Falta el negocio.");
	return {
		businessId: input.businessId,
		methods: normalizePaymentMethods(input.methods)
	};
}).handler(createSsrRpc("7ad231c7b09cfca4c0ec552124b11152c6a61e3134de51e7c4cad56bb5f9a024"));
var claimAdminIfNone = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("09cbe489c341db73d7abaeae69d4e349f73e30314550014224a3ef143acc8d46"));
var createBusiness = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	tradeName: assertString(input?.tradeName, "Nombre comercial", 80),
	legalName: assertString(input?.legalName, "Razón social", 120),
	phone: assertString(input?.phone, "Teléfono", 30),
	address: assertString(input?.address, "Dirección", 160),
	neighborhood: assertString(input?.neighborhood, "Barrio", 80),
	categoryIds: Array.isArray(input?.categoryIds) ? input.categoryIds : [],
	description: typeof input?.description === "string" ? input.description.trim().slice(0, 600) : "",
	coverageNote: typeof input?.coverageNote === "string" ? input.coverageNote.trim().slice(0, 160) : "",
	minOrderNote: typeof input?.minOrderNote === "string" ? input.minOrderNote.trim().slice(0, 160) : "",
	sellsWholesale: input?.sellsWholesale === true,
	sellsRetail: input?.sellsRetail === true
})).handler(createSsrRpc("c3ab414d4fa41a17c10b6fe5f4ba285042f6c46200e868db660c87ced6e8a65e"));
var setBusinessLocation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId) throw new Error("Falta el negocio.");
	if (typeof input.lat !== "number" || typeof input.lng !== "number") throw new Error("Marcá el punto en el mapa.");
	if (!insideRosario(input.lat, input.lng)) throw new Error("El punto tiene que estar en el área de Rosario.");
	const visibility = input.visibility === "approximate" ? "approximate" : "exact";
	return {
		businessId: input.businessId,
		lat: input.lat,
		lng: input.lng,
		delivery: input.delivery === true,
		pickup: input.pickup !== false,
		address: typeof input.address === "string" ? input.address.trim().slice(0, 160) : "",
		neighborhood: typeof input.neighborhood === "string" ? input.neighborhood.trim().slice(0, 80) : "",
		visibility
	};
}).handler(createSsrRpc("bc2419c21c0938f4f49eeacc128c1b19f8b96ea62abe3a5e7e6e60a35a8687eb"));
var geocodeRosario = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const query = typeof input?.query === "string" ? input.query.trim() : "";
	if (query.length < 4) throw new Error("Escribí una dirección de Rosario.");
	return query.slice(0, 160);
}).handler(createSsrRpc("fd92e9cf721d159c369b04672b2bb17af8818a20d5ccd3e4168204ec8758af33"));
createServerFn({ method: "GET" }).handler(createSsrRpc("48e541d21fb027f1f61e19b16e087a25efac3da8ff006201b813cd85d565e0e2"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("08fba208bf348b1a61fc39c4a1c3029884ae5d837b102a3148995e1b821b12d6"));
var loadDevelopmentSeed = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("566256237164e949f12dd8a4dcbf5f6dbc4bffcbe7f08ffa786c06f29fd62701"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("b566c1f8f028153ebeb77917e06004b3fc531022277a1ad52c4c78e17b8397a2"));
var HEADER_SEARCH_PLACEHOLDER = "Buscar productos, proveedores o servicios";
var footerLinkClass = "inline-flex min-h-11 w-full items-center rounded-xl px-2 text-sm font-medium text-ink hover:bg-paper hover:text-olive";
function HeaderSearchControl({ id, value, onChange, tabIndex }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 focus-within:border-teal",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
				className: "size-4 shrink-0 text-muted",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Buscar en CONEX"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative block min-w-0 flex-1",
				children: [value ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: "pointer-events-none block text-base leading-snug text-[color:color-mix(in_oklab,currentcolor_50%,transparent)]",
					children: HEADER_SEARCH_PLACEHOLDER
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id,
					name: "q",
					type: "search",
					autoComplete: "off",
					tabIndex,
					value,
					onChange: (event) => onChange(event.target.value),
					placeholder: HEADER_SEARCH_PLACEHOLDER,
					className: `w-full min-w-0 max-w-full bg-transparent outline-none placeholder:text-transparent ${value ? "relative" : "absolute inset-x-0 top-0 h-[1.375rem]"}`
				})]
			})
		]
	});
}
function FooterGroup({ title, render }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
			className: "group border-b border-line lg:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
				className: "flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold",
				children: [title, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
					className: "conex-chevron size-4 shrink-0 text-muted transition-transform",
					"aria-hidden": true
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pb-3",
				children: render()
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden lg:block",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: render()
			})]
		})]
	});
}
function Shell({ children }) {
	const navigate = useNavigate();
	const { user } = useCurrentUserState();
	const locationSearch = useRouterState({ select: (state) => state.location.search });
	const [headerQ, setHeaderQ] = (0, import_react.useState)(typeof locationSearch?.q === "string" ? locationSearch.q : "");
	const [isAdmin, setIsAdmin] = (0, import_react.useState)(false);
	const [canClaimAdmin, setCanClaimAdmin] = (0, import_react.useState)(false);
	const [hasBusiness, setHasBusiness] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof locationSearch?.q === "string") setHeaderQ(locationSearch.q);
	}, [locationSearch?.q]);
	(0, import_react.useEffect)(() => {
		if (!user) {
			setIsAdmin(false);
			setCanClaimAdmin(false);
			setHasBusiness(false);
			return;
		}
		getMyAccount().then((account) => {
			setIsAdmin(account.platformRole === "admin");
			setCanClaimAdmin(account.canClaimAdmin);
			setHasBusiness(account.businesses.length > 0);
		}).catch(() => {
			setIsAdmin(false);
			setCanClaimAdmin(false);
			setHasBusiness(false);
		});
	}, [user]);
	function submitSearch(event) {
		event.preventDefault();
		navigate({
			to: "/",
			search: {
				q: headerQ.trim() || void 0,
				categoria: void 0
			},
			hash: "productos"
		});
	}
	function buyerLinks() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/cotizaciones",
					className: footerLinkClass,
					children: "Mis consultas"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pedidos",
					className: footerLinkClass,
					children: "Mis compras"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "ayuda" },
					className: footerLinkClass,
					children: "Cómo comprar"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/proteccion",
					className: footerLinkClass,
					children: "Protección CONEX"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "cancelaciones" },
					className: footerLinkClass,
					children: "Cancelaciones"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "devoluciones" },
					className: footerLinkClass,
					children: "Devoluciones"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "arrepentimiento" },
					className: footerLinkClass,
					children: "Arrepentimiento"
				}) }),
				user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/cuenta",
					className: footerLinkClass,
					children: "Mi cuenta"
				}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: footerLinkClass,
					children: "Entrar"
				}) })
			]
		});
	}
	function sellerLinks() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "ayuda" },
					className: footerLinkClass,
					children: "Cómo vender"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel",
					className: footerLinkClass,
					children: hasBusiness ? "Mi negocio" : "Crear mi negocio"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel/productos/$listingId",
					params: { listingId: "nuevo" },
					className: footerLinkClass,
					children: "Publicar productos"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel",
					hash: "consultas",
					className: footerLinkClass,
					children: "Consultas recibidas"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "proveedores" },
					className: footerLinkClass,
					children: "Reglas para proveedores"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "prohibidos" },
					className: footerLinkClass,
					children: "Productos prohibidos"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "reputacion" },
					className: footerLinkClass,
					children: "Reputación"
				}) })
			]
		});
	}
	function protectionLinks() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/proteccion",
					className: footerLinkClass,
					children: "Protección CONEX"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "reclamos" },
					className: footerLinkClass,
					children: "Reclamos"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "disputas" },
					className: footerLinkClass,
					children: "Disputas"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "seguridad" },
					className: footerLinkClass,
					children: "Seguridad"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "reportar" },
					className: footerLinkClass,
					children: "Reportar un problema"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "comunicaciones" },
					className: footerLinkClass,
					children: "Comunicaciones"
				}) })
			]
		});
	}
	function helpLinks() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "ayuda" },
					className: footerLinkClass,
					children: "Centro de ayuda"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "compradores" },
					className: footerLinkClass,
					children: "Reglas para compradores"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "proveedores" },
					className: footerLinkClass,
					children: "Reglas para proveedores"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "seguridad" },
					className: footerLinkClass,
					children: "Seguridad de la cuenta"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "reclamos" },
					className: footerLinkClass,
					children: "Reclamos"
				}) })
			]
		});
	}
	function legalLinks() {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "terminos" },
					className: footerLinkClass,
					children: "Términos y condiciones"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "privacidad" },
					className: footerLinkClass,
					children: "Privacidad"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "cookies" },
					className: footerLinkClass,
					children: "Cookies"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "comerciales" },
					className: footerLinkClass,
					children: "Reglas comerciales"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "propiedad-intelectual" },
					className: footerLinkClass,
					children: "Propiedad intelectual"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "publicaciones" },
					className: footerLinkClass,
					children: "Publicaciones"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional/$slug",
					params: { slug: "informacion-legal" },
					className: footerLinkClass,
					children: "Información legal"
				}) })
			]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-b border-line bg-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Derechos de consumo",
					className: "mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 py-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/institucional/$slug",
						params: { slug: "arrepentimiento" },
						className: "inline-flex min-h-11 items-center text-sm font-semibold text-olive",
						children: "BOTÓN DE ARREPENTIMIENTO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/institucional/$slug",
						params: { slug: "baja" },
						className: "inline-flex min-h-11 items-center text-sm font-semibold text-olive",
						children: "BOTÓN DE BAJA DE SERVICIO"
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-40 border-b border-line bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								search: {
									q: void 0,
									categoria: void 0
								},
								className: "shrink-0 leading-none",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-2xl font-semibold tracking-tight text-olive",
									children: "CONEX"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden shrink-0 items-center gap-1 text-sm text-muted md:inline-flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
									className: "size-4 text-teal",
									"aria-hidden": true
								}), "Rosario"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
								onSubmit: submitSearch,
								className: "mx-2 hidden min-w-0 max-w-md flex-1 lg:flex",
								role: "search",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderSearchControl, {
									id: "conex-header-search",
									value: headerQ,
									onChange: setHeaderQ
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
								className: "ml-auto hidden min-w-0 items-center gap-0.5 overflow-x-auto lg:flex",
								"aria-label": "Principal",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										search: {
											q: void 0,
											categoria: void 0
										},
										className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper",
										children: "Inicio"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										hash: "productos",
										search: {
											q: void 0,
											categoria: void 0
										},
										className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper",
										children: "Productos"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/proveedores",
										className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper",
										children: "Proveedores"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/categorias",
										className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper",
										children: "Categorías"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										hash: "mapa",
										search: {
											q: void 0,
											categoria: void 0
										},
										className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper",
										children: "Mapa"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex items-center gap-1 lg:ml-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
											className: "flex min-h-11 list-none items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-paper",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, {
												className: "size-4",
												"aria-hidden": true
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "sr-only",
												children: "Consultas y compras"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-card p-4 shadow-card",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-display text-lg font-semibold",
													children: "Tus consultas y compras"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-sm text-muted",
													children: "Acá ves lo que consultaste y lo que compraste. Una compra se arma cuando aceptás la respuesta de un proveedor."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-3 grid gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/cotizaciones",
														className: "inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-medium",
														children: "Mis consultas"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: "/pedidos",
														className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
														children: "Mis compras"
													})]
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedOut, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/login",
										className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
										children: "Entrar"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignedIn, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
											className: "flex min-h-11 list-none items-center rounded-full px-3 text-sm font-medium hover:bg-paper",
											children: "Cuenta"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute right-0 z-50 mt-2 grid w-64 gap-1 rounded-2xl border border-line bg-card p-2 shadow-card",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/cuenta",
													className: "inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper",
													children: "Mi cuenta"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/panel",
													className: "inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper",
													children: hasBusiness ? "Mi negocio" : "Crear mi negocio"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/cotizaciones",
													className: "inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper",
													children: "Mis consultas"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/solicitudes",
													className: "inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper",
													children: "Lo que necesito"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/pedidos",
													className: "inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper",
													children: "Mis compras"
												}),
												isAdmin || canClaimAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: "/admin",
													className: "inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper",
													children: "Administración"
												}) : null
											]
										})]
									}) })
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						onSubmit: submitSearch,
						className: "min-w-0 px-4 pb-2 lg:hidden",
						role: "search",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderSearchControl, {
							id: "conex-header-search-mobile",
							value: headerQ,
							onChange: setHeaderQ,
							tabIndex: 0
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden",
						"aria-label": "Secciones",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								search: {
									q: void 0,
									categoria: void 0
								},
								className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper",
								children: "Inicio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "productos",
								search: {
									q: void 0,
									categoria: void 0
								},
								className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper",
								children: "Productos"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/proveedores",
								className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper",
								children: "Proveedores"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/categorias",
								className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper",
								children: "Categorías"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								hash: "mapa",
								search: {
									q: void 0,
									categoria: void 0
								},
								className: "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper",
								children: "Mapa"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-7xl px-4 py-8 md:py-10",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "conex-footer mt-8 border-t border-line bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-7xl px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "grid gap-2 border-b border-line py-6 md:grid-cols-3 md:gap-4 md:py-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/proveedores",
								className: "flex h-full min-h-11 gap-3 rounded-2xl p-3 hover:bg-paper",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 shrink-0 place-items-center rounded-full bg-teal/10 text-teal",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
										className: "size-5",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Proveedores aprobados"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm font-normal leading-snug text-muted",
										children: "Un negocio nuevo queda en revisión hasta que se aprueba. Recién entonces puede publicar y aparecer."
									})]
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								hash: "productos",
								search: {
									q: void 0,
									categoria: void 0
								},
								className: "flex h-full min-h-11 gap-3 rounded-2xl p-3 hover:bg-paper",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 shrink-0 place-items-center rounded-full bg-teal/10 text-teal",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, {
										className: "size-5",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Consultá antes de avanzar"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm font-normal leading-snug text-muted",
										children: "Consultás un producto o publicás lo que necesitás. Si aceptás una respuesta sobre un producto, se arma una compra con ese proveedor."
									})]
								})]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/proteccion",
								className: "flex h-full min-h-11 gap-3 rounded-2xl p-3 hover:bg-paper",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-10 shrink-0 place-items-center rounded-full bg-teal/10 text-teal",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
										className: "size-5",
										"aria-hidden": true
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Protección CONEX"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block text-sm font-normal leading-snug text-muted",
										children: "CONEX no da la razón de antemano. La protección sigue la evidencia que quedó en el pedido."
									})]
								})]
							}) })
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-8 py-8 lg:grid-cols-3 xl:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										search: {
											q: void 0,
											categoria: void 0
										},
										className: "inline-flex min-h-11 items-center font-display text-xl font-semibold text-olive",
										children: "CONEX"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-ink",
										children: "Todo lo que necesitás, cerca tuyo."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted",
										children: "Rosario, Santa Fe, Argentina."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/institucional/$slug",
										params: { slug: "como-funciona" },
										className: footerLinkClass,
										children: "Cómo funciona"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/institucional/$slug",
										params: { slug: "informacion-legal" },
										className: footerLinkClass,
										children: "Información legal"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterGroup, {
								title: "Compradores",
								render: buyerLinks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterGroup, {
								title: "Proveedores",
								render: sellerLinks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterGroup, {
								title: "Protección",
								render: protectionLinks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterGroup, {
								title: "Ayuda",
								render: helpLinks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterGroup, {
								title: "Legal",
								render: legalLinks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 lg:col-span-3 xl:col-span-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FooterGroup, {
									title: "Medios de pago",
									render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodsNotice, {})
								})
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid max-w-7xl gap-1 px-4 py-4 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "© 2026 CONEX. Todos los derechos reservados." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "CONEX no da la razón de antemano. La protección sigue la evidencia que quedó en el pedido." })]
					})
				})]
			})
		]
	});
}
//#endregion
export { updateBusinessCommercial as _, RedirectToSignIn as a, createBusiness as c, getMyAccount as d, listNotifications as f, setBusinessPaymentMethods as g, setBusinessLocation as h, PaymentMethodToggles as i, createSsrRpc as l, saveSellerIntent as m, PaymentMethodInline as n, Shell as o, loadDevelopmentSeed as p, PaymentMethodRadios as r, claimAdminIfNone as s, PaymentMethodChips as t, geocodeRosario as u, updateMyPhone as v, useCurrentUserState as y };

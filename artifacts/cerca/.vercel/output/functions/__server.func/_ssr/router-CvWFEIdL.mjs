import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { c as getSql } from "./helpers-AwcxVs0A.mjs";
import { r as normalizeAccountEmail } from "./text-BUH6vDdb.mjs";
import { t as bumpRateLimit } from "./rate-limit-CxIZqdRb.mjs";
import { n as auth } from "./server-kpnKyvB7.mjs";
import { a as readObject } from "./storage-BueJXjBC.mjs";
import { f as verifyMercadoPagoSignature, l as readMercadoPagoEnv } from "./mercadopago-BrD8R2__.mjs";
import { n as completeSellerOAuth, s as processMercadoPagoWebhook } from "./payment-runtime-J3KTxcgp.mjs";
import { Q as require_react, T as require_jsx_runtime, _ as Outlet, b as createRootRoute, f as Scripts, g as createRouter, p as HeadContent, v as lazyRouteComponent, w as useRouter, y as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CvWFEIdL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-Bom70l6a.css";
var Route$25 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "CONEX — Todo lo que necesitás, cerca tuyo" },
			{
				name: "description",
				content: "Buscá productos y proveedores en Rosario. Si no lo encontrás, publicalo. Si tenés un negocio, publicá lo que vendés."
			},
			{
				name: "theme-color",
				content: "#05AD98"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "es",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-center" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$20 = () => import("./routes-eHONtrQD.mjs");
var Route$24 = createFileRoute("/")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" && search.q.length > 0 ? search.q.slice(0, 80) : void 0,
		categoria: typeof search.categoria === "string" && search.categoria.length > 0 ? search.categoria.slice(0, 80) : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./admin-DOUIFIuR.mjs");
var Route$23 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./categorias-6uFee7s2.mjs");
var Route$22 = createFileRoute("/categorias")({
	validateSearch: (search) => ({ categoria: typeof search.categoria === "string" && search.categoria.length > 0 ? search.categoria.slice(0, 80) : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./cotizaciones-BbDw_zKe.mjs");
var Route$21 = createFileRoute("/cotizaciones")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./cotizar-BNBj42cH.mjs");
var Route$20 = createFileRoute("/cotizar")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./cuenta-DLKcvqZJ.mjs");
var Route$19 = createFileRoute("/cuenta")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./login-B8w7VeVm.mjs");
var Route$18 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./proteccion-DX2NaR2X.mjs");
var Route$17 = createFileRoute("/proteccion")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./proveedores-DSrC0MEp.mjs");
var Route$16 = createFileRoute("/proveedores")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" && search.q.length > 0 ? search.q.slice(0, 80) : void 0,
		categoria: typeof search.categoria === "string" && search.categoria.length > 0 ? search.categoria.slice(0, 80) : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./restablecer-DIZHwibV.mjs");
var Route$15 = createFileRoute("/restablecer")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./solicitudes-C16lUgOZ.mjs");
var Route$14 = createFileRoute("/solicitudes")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" && search.q.length > 0 ? search.q.slice(0, 80) : void 0,
		categoria: typeof search.categoria === "string" && search.categoria.length > 0 ? search.categoria.slice(0, 80) : void 0
	}),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./institucional-jT_F_Et-.mjs");
var Route$13 = createFileRoute("/institucional/")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("../_slug-tkgk5Nmq.mjs");
var Route$12 = createFileRoute("/institucional/$slug")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("../_businessId-C36_hG49.mjs");
var Route$11 = createFileRoute("/negocio/$businessId")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./panel-jnPZMrEA.mjs");
var Route$10 = createFileRoute("/panel/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./pedidos-Bkngl8n0.mjs");
var Route$9 = createFileRoute("/pedidos/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("../_orderId-Cl_HksA0.mjs");
var Route$8 = createFileRoute("/pedidos/$orderId")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("../_productId-D1m1Jfud.mjs");
var Route$7 = createFileRoute("/producto/$productId")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("../_requestId-Ca0X47FC.mjs");
var Route$6 = createFileRoute("/solicitud/$requestId")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
function isEmailSignUpPath(pathname) {
	return pathname.replace(/\/+$/, "").endsWith("/sign-up/email");
}
async function emailAlreadyRegistered(rawEmail) {
	if (typeof rawEmail !== "string") return false;
	const email = normalizeAccountEmail(rawEmail);
	if (!email) return false;
	const rows = await (await getSql()).query(`select id from "user" where lower(email) = $1 limit 1`, [email]);
	return Boolean(rows[0]);
}
async function guardEmailSignUp(request, next) {
	const path = new URL(request.url).pathname;
	if (request.method === "POST" && isEmailSignUpPath(path)) {
		const clone = request.clone();
		let raw = null;
		try {
			raw = await clone.json();
		} catch {
			raw = null;
		}
		if (await emailAlreadyRegistered(raw && typeof raw === "object" && "email" in raw ? raw.email : void 0)) return Response.json({
			message: "No se pudo crear la cuenta con esos datos.",
			code: "EMAIL_TAKEN"
		}, { status: 422 });
	}
	return next(request);
}
var Route$5 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => guardEmailSignUp(request, auth.handler)
} } });
var Route$4 = createFileRoute("/api/media/$")({ server: { handlers: { GET: async ({ params }) => {
	const key = params._splat;
	if (!key || key.includes("..")) return new Response(null, { status: 404 });
	try {
		const stored = await readObject(key);
		if (!stored) return new Response(null, { status: 404 });
		return new Response(Buffer.from(stored.bytes), { headers: {
			"Content-Type": stored.contentType,
			"Cache-Control": "public, max-age=86400"
		} });
	} catch {
		return new Response(null, { status: 404 });
	}
} } } });
var $$splitComponentImporter$1 = () => import("./productos-D5rHxSXc.mjs");
var Route$3 = createFileRoute("/panel/productos/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_listingId-BJJp9Etk.mjs");
var Route$2 = createFileRoute("/panel/productos/$listingId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
function clientIp(request) {
	const forwarded = request.headers.get("x-forwarded-for");
	return (forwarded ? forwarded.split(",")[0] : "local").trim().slice(0, 64) || "local";
}
/**
* Webhook de Mercado Pago. No usa sesión.
* Firma inválida: 401, sin cambiar el pedido.
* Firma válida: se guarda el evento y se lee GET /v1/payments/{id}
* con el token del vendedor. Solo approved pasa el pedido a PAID.
*/
var Route$1 = createFileRoute("/api/payments/mercadopago/")({ server: { handlers: { POST: async ({ request }) => {
	const db = await getSql();
	if (await bumpRateLimit(db, `webhook:${clientIp(request)}`, 60) > 120) return Response.json({ ok: false }, { status: 429 });
	const env = readMercadoPagoEnv();
	if (!env.webhookSecret) return Response.json({
		ok: false,
		code: "PAYMENTS_NOT_CONFIGURED",
		missing: ["MP_WEBHOOK_SECRET"]
	}, { status: 503 });
	const url = new URL(request.url);
	const body = await request.json().catch(() => null);
	const dataId = url.searchParams.get("data.id");
	if (!verifyMercadoPagoSignature({
		header: request.headers.get("x-signature"),
		requestId: request.headers.get("x-request-id"),
		dataId,
		secret: env.webhookSecret
	})) return Response.json({ ok: false }, { status: 401 });
	const result = await processMercadoPagoWebhook({
		dataId,
		topic: body?.type ?? url.searchParams.get("type") ?? "payment",
		body
	});
	return Response.json(result.body, { status: result.httpStatus });
} } } });
function page(title, text) {
	const clean = (value) => value.replace(/[<>&]/g, "");
	return new Response(`<!doctype html><meta charset="utf-8"><title>${clean(title)}</title><body style="font-family:sans-serif;padding:2rem"><h1>${clean(title)}</h1><p>${clean(text)}</p><p><a href="/panel">Volver al panel</a></p></body>`, { headers: { "content-type": "text/html; charset=utf-8" } });
}
var Route = createFileRoute("/api/payments/mercadopago/callback")({ server: { handlers: { GET: async ({ request }) => {
	const db = await getSql();
	if (await bumpRateLimit(db, `oauth-callback:${clientIp(request)}`, 60) > 30) return page("Demasiados intentos", "Esperá un minuto y volvé a conectar.");
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	if (!code || !state) return page("No se vinculó", "Mercado Pago no envió el código.");
	try {
		const result = await completeSellerOAuth({
			code,
			state
		});
		return page(result.ok ? "Cuenta vinculada" : "No se vinculó", result.message);
	} catch {
		return page("No se vinculó", "No se pudo guardar la cuenta. Revisá CERCA_TOKEN_KEY y las credenciales.");
	}
} } } });
var IndexRoute = Route$24.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$25
});
var AdminRoute = Route$23.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$25
});
var CategoriasRoute = Route$22.update({
	id: "/categorias",
	path: "/categorias",
	getParentRoute: () => Route$25
});
var CotizacionesRoute = Route$21.update({
	id: "/cotizaciones",
	path: "/cotizaciones",
	getParentRoute: () => Route$25
});
var CotizarRoute = Route$20.update({
	id: "/cotizar",
	path: "/cotizar",
	getParentRoute: () => Route$25
});
var CuentaRoute = Route$19.update({
	id: "/cuenta",
	path: "/cuenta",
	getParentRoute: () => Route$25
});
var LoginRoute = Route$18.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$25
});
var ProteccionRoute = Route$17.update({
	id: "/proteccion",
	path: "/proteccion",
	getParentRoute: () => Route$25
});
var ProveedoresRoute = Route$16.update({
	id: "/proveedores",
	path: "/proveedores",
	getParentRoute: () => Route$25
});
var RestablecerRoute = Route$15.update({
	id: "/restablecer",
	path: "/restablecer",
	getParentRoute: () => Route$25
});
var SolicitudesRoute = Route$14.update({
	id: "/solicitudes",
	path: "/solicitudes",
	getParentRoute: () => Route$25
});
var InstitucionalIndexRoute = Route$13.update({
	id: "/institucional/",
	path: "/institucional/",
	getParentRoute: () => Route$25
});
var InstitucionalSlugRoute = Route$12.update({
	id: "/institucional/$slug",
	path: "/institucional/$slug",
	getParentRoute: () => Route$25
});
var NegocioBusinessIdRoute = Route$11.update({
	id: "/negocio/$businessId",
	path: "/negocio/$businessId",
	getParentRoute: () => Route$25
});
var PanelIndexRoute = Route$10.update({
	id: "/panel/",
	path: "/panel/",
	getParentRoute: () => Route$25
});
var PedidosIndexRoute = Route$9.update({
	id: "/pedidos/",
	path: "/pedidos/",
	getParentRoute: () => Route$25
});
var PedidosOrderIdRoute = Route$8.update({
	id: "/pedidos/$orderId",
	path: "/pedidos/$orderId",
	getParentRoute: () => Route$25
});
var ProductoProductIdRoute = Route$7.update({
	id: "/producto/$productId",
	path: "/producto/$productId",
	getParentRoute: () => Route$25
});
var SolicitudRequestIdRoute = Route$6.update({
	id: "/solicitud/$requestId",
	path: "/solicitud/$requestId",
	getParentRoute: () => Route$25
});
var ApiAuthSplatRoute = Route$5.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$25
});
var ApiMediaSplatRoute = Route$4.update({
	id: "/api/media/$",
	path: "/api/media/$",
	getParentRoute: () => Route$25
});
var PanelProductosIndexRoute = Route$3.update({
	id: "/panel/productos/",
	path: "/panel/productos/",
	getParentRoute: () => Route$25
});
var PanelProductosListingIdRoute = Route$2.update({
	id: "/panel/productos/$listingId",
	path: "/panel/productos/$listingId",
	getParentRoute: () => Route$25
});
var ApiPaymentsMercadopagoIndexRoute = Route$1.update({
	id: "/api/payments/mercadopago/",
	path: "/api/payments/mercadopago/",
	getParentRoute: () => Route$25
});
var rootRouteChildren = {
	IndexRoute,
	AdminRoute,
	CategoriasRoute,
	CotizacionesRoute,
	CotizarRoute,
	CuentaRoute,
	LoginRoute,
	ProteccionRoute,
	ProveedoresRoute,
	RestablecerRoute,
	SolicitudesRoute,
	InstitucionalSlugRoute,
	NegocioBusinessIdRoute,
	PedidosOrderIdRoute,
	ProductoProductIdRoute,
	SolicitudRequestIdRoute,
	InstitucionalIndexRoute,
	PanelIndexRoute,
	PedidosIndexRoute,
	ApiAuthSplatRoute,
	ApiMediaSplatRoute,
	PanelProductosListingIdRoute,
	PanelProductosIndexRoute,
	ApiPaymentsMercadopagoCallbackRoute: Route.update({
		id: "/api/payments/mercadopago/callback",
		path: "/api/payments/mercadopago/callback",
		getParentRoute: () => Route$25
	}),
	ApiPaymentsMercadopagoIndexRoute
};
var routeTree = Route$25._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$8 as a, Route$14 as c, Route$24 as d, Route$7 as i, Route$16 as l, Route$2 as n, Route$11 as o, Route$6 as r, Route$12 as s, router_exports as t, Route$22 as u };

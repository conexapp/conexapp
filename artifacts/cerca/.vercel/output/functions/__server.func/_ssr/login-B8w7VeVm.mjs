import { o as __toESM } from "../_runtime.mjs";
import { t as GROK_PROVIDERS } from "./server-kpnKyvB7.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { r as signIn, t as authClient } from "./client-IWHfIGH2.mjs";
import { l as createSsrRpc, o as Shell } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B8w7VeVm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Solo el preview sin Resend. Producción no tiene este buzón. */
var getDevMailbox = createServerFn({ method: "GET" }).validator((email) => {
	const value = typeof email === "string" ? email.trim().toLowerCase() : "";
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length > 160) throw new Error("Email inválido.");
	return value;
}).handler(createSsrRpc("7458161e1907a40ce044cf547db9f0e4e98e45e18bf0e397da18e047cd54a810"));
function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("up");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [links, setLinks] = (0, import_react.useState)([]);
	async function loadMailbox() {
		try {
			const rows = await getDevMailbox({ data: email });
			setLinks(rows.map((row) => ({
				kind: row.kind,
				url: row.url
			})));
			if (rows.length === 0) toast.message("Todavía no hay un enlace en el buzón de desarrollo.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No hay buzón de desarrollo.");
		}
	}
	async function submit(event) {
		event.preventDefault();
		setPending(true);
		setNotice("");
		try {
			if (mode === "forgot") {
				const result = await authClient.requestPasswordReset({
					email,
					redirectTo: `${window.location.origin}/restablecer`
				});
				if (result.error) {
					toast.error(result.error.message ?? "No se pudo pedir el enlace.");
					return;
				}
				setNotice("Si la cuenta existe, hay un enlace para elegir una contraseña nueva. Vence en una hora y sirve una sola vez.");
				return;
			}
			const result = mode === "up" ? await authClient.signUp.email({
				email,
				password,
				name,
				callbackURL: "/"
			}) : await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (result.error) {
				const message = result.error.message ?? "No se pudo entrar.";
				if (/verif/i.test(message)) {
					setNotice("Tenés que confirmar el email antes de entrar. El enlace vence y no se puede reutilizar.");
					return;
				}
				toast.error(message);
				return;
			}
			if (mode === "up") {
				setNotice("Creá la cuenta y confirmá el email. Hasta entonces no hay sesión, y el rol no se asigna solo.");
				setMode("in");
				return;
			}
			const next = sessionStorage.getItem("conex-after-auth");
			sessionStorage.removeItem("conex-after-auth");
			if (next && /^\/producto\/[A-Za-z0-9-]+$/.test(next.split("?")[0] ?? "") && (next.endsWith("?comprar=1") || !next.includes("?"))) {
				window.location.assign(next);
				return;
			}
			await navigate({ to: "/" });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se pudo entrar.");
		} finally {
			setPending(false);
		}
	}
	async function resend() {
		const result = await authClient.sendVerificationEmail({
			email,
			callbackURL: "/"
		});
		if (result.error) toast.error(result.error.message ?? "No se reenvió.");
		else setNotice("Si la cuenta existe, generamos otro enlace de confirmación.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-md gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl",
				children: mode === "up" ? "Crear cuenta" : mode === "forgot" ? "Recuperar contraseña" : "Entrar"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "La cuenta queda en la base. Un usuario nuevo no es administrador. En producción el correo sale por Resend; sin eso, este preview guarda el enlace en un buzón local."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				id: "conex-auth-form",
				onSubmit: submit,
				className: "grid gap-3",
				autoComplete: "on",
				children: [
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Nombre", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "conex-auth-name",
							name: "name",
							autoComplete: "name",
							required: true,
							value: name,
							onChange: (event) => setName(event.target.value),
							className: "min-h-12 rounded-2xl border border-line bg-foam px-4"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "conex-auth-email",
							name: "email",
							type: "email",
							autoComplete: "username",
							required: true,
							value: email,
							onChange: (event) => setEmail(event.target.value),
							className: "min-h-12 rounded-2xl border border-line bg-foam px-4"
						})]
					}),
					mode !== "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-sm",
						children: ["Contraseña", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "conex-auth-password",
							name: "password",
							type: "password",
							autoComplete: mode === "up" ? "new-password" : "current-password",
							minLength: 8,
							required: true,
							value: password,
							onChange: (event) => setPassword(event.target.value),
							className: "min-h-12 rounded-2xl border border-line bg-foam px-4"
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: pending,
						className: "min-h-12 rounded-full bg-ink text-paper disabled:opacity-60",
						children: pending ? "Guardando…" : mode === "up" ? "Crear cuenta" : mode === "forgot" ? "Pedir enlace" : "Entrar"
					})
				]
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-olive",
						onClick: () => setMode(mode === "up" ? "in" : "up"),
						children: mode === "up" ? "Ya tengo cuenta" : "Crear una cuenta"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-olive",
						onClick: () => setMode("forgot"),
						children: "Olvidé la contraseña"
					}),
					mode !== "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-olive",
						onClick: () => void resend(),
						children: "Reenviar confirmación"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-olive",
						onClick: () => void loadMailbox(),
						children: "Buzón de desarrollo"
					})
				]
			}),
			links.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 text-sm",
				children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "break-all text-olive",
					href: link.url,
					children: link.kind === "reset" ? "Elegir contraseña" : "Confirmar email"
				}) }, link.url))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2",
				children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-h-12 rounded-full border border-line",
					onClick: () => signIn(provider.providerId, { callbackURL: "/" }),
					children: ["Continuar con ", provider.label]
				}, provider.providerId))
			})
		]
	}) });
}
//#endregion
export { LoginPage as component };

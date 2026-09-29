import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as RedirectToSignIn, d as getMyAccount, f as listNotifications, o as Shell, v as updateMyPhone, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cuenta-DLKcvqZJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function accountKind(account) {
	if (account.platformRole === "admin") return "Administración";
	if (account.businesses.length > 0) return "Proveedor";
	return "Comprador";
}
function AccountPage() {
	const { user, isPending } = useCurrentUserState();
	const [account, setAccount] = (0, import_react.useState)(null);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		getMyAccount().then((next) => {
			setAccount(next);
			setPhone(next.phone);
		});
		listNotifications().then(setNotes);
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-4xl font-semibold",
		children: "Mi cuenta"
	}), account ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 grid gap-6 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "grid gap-3 rounded-2xl border border-line bg-card p-5",
			onSubmit: (event) => {
				event.preventDefault();
				setSaving(true);
				updateMyPhone({ data: phone }).then(() => toast.success("Teléfono guardado.")).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardó.")).finally(() => setSaving(false));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold text-olive",
					children: accountKind(account)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-2xl font-semibold",
					children: account.name || "Sin nombre"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: account.email
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						"Email ",
						account.emailVerified ? "confirmado" : "pendiente de confirmación",
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1 text-sm",
					children: ["Teléfono", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: phone,
						onChange: (event) => setPhone(event.target.value),
						placeholder: "Ej. 341 555-0000",
						className: "min-h-12 rounded-2xl border border-line px-3",
						autoComplete: "tel"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: saving,
					className: "min-h-11 rounded-full bg-ink text-paper disabled:opacity-60",
					children: saving ? "Guardando…" : "Guardar teléfono"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: account.businesses.length > 0 ? "Acá vas a encontrar tus consultas, lo que pediste y tus compras." : "Acá vas a encontrar tus consultas y lo que publiques. Para vender, creá tu negocio."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/cotizaciones",
							className: "inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium",
							children: "Mis consultas"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/solicitudes",
							className: "inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium",
							children: "Lo que necesito"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pedidos",
							className: "inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium",
							children: "Mis compras"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/panel",
							className: "inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium",
							children: account.businesses.length > 0 ? "Mi negocio" : "Crear mi negocio"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/proteccion",
							className: "inline-flex min-h-11 items-center rounded-full bg-paper px-3 font-medium",
							children: "Protección"
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Avisos"
				}),
				notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl border border-line bg-card p-4 text-sm text-muted",
					children: "No hay avisos. Cuando un proveedor responda, el aviso aparece acá."
				}) : null,
				notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-card px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: note.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: note.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: ["Email: ", note.email_status]
						})
					]
				}, note.id))
			]
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm text-muted",
		children: "Cargando cuenta…"
	})] });
}
//#endregion
export { AccountPage as component };

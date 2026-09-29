import { o as __toESM } from "./_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { r as Route$6 } from "./_ssr/router-CvWFEIdL.mjs";
import { o as Shell } from "./_ssr/shell-CbJDficC.mjs";
import { i as getPublicRequest } from "./_ssr/public-CpGTpZb5.mjs";
import { n as formatWhen, o as requestStatusLabel } from "./_ssr/labels-BJ2JP56X.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_requestId-Ca0X47FC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RequestPage() {
	const { requestId } = Route$6.useParams();
	const [request, setRequest] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setError("");
		getPublicRequest({ data: requestId }).then((next) => {
			setRequest(next);
			document.title = `${next.title} — CONEX`;
		}).catch((cause) => setError(cause instanceof Error ? cause.message : "No se encontró."));
	}, [requestId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "mb-4 text-sm text-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/solicitudes",
				className: "inline-flex min-h-11 items-center hover:text-ink",
				children: "Lo que buscan"
			})
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-2xl bg-card p-4 text-sm",
			children: error
		}) : null,
		!request && !error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Cargando…"
		}) : null,
		request ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-semibold text-olive",
					children: ["Alguien busca esto · ", request.city]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-4xl font-semibold",
					children: request.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-5 grid gap-3 text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Cantidad"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-lg font-semibold",
								children: request.quantity
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Categoría"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-lg font-semibold",
								children: request.categoryName ?? "Sin categoría"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Zona"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-lg font-semibold",
								children: request.city
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-muted",
								children: "Estado"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1 text-lg font-semibold",
								children: requestStatusLabel(request.status)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm",
					children: [request.delivery ? "El comprador prefiere entrega." : "El comprador prefiere retiro.", formatWhen(request.createdAt) ? ` Publicada el ${formatWhen(request.createdAt)}.` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl font-semibold",
						children: "Descripción"
					}), request.notes.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed",
						children: request.notes
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "El comprador no agregó una descripción."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 rounded-2xl bg-paper p-4 text-sm",
					children: "Proveedores interesados pueden enviar una propuesta desde Mi negocio. No se publica el nombre ni el contacto de quien lo pidió."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel",
					className: "mt-4 inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
					children: "Enviar propuesta"
				})
			]
		}) : null
	] });
}
//#endregion
export { RequestPage as component };

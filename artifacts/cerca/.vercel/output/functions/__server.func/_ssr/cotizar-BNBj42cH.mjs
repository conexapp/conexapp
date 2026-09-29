import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Shell } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cotizar-BNBj42cH.js
var import_jsx_runtime = require_jsx_runtime();
function CotizarPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-4xl",
			children: "Buscá, pedí o vendé"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted",
			children: "Si ya viste un producto, consultalo en esa página. Si no lo encontrás, publicá lo que necesitás para que los proveedores te respondan. Si tenés un negocio, publicá tus productos."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					hash: "productos",
					className: "inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper",
					children: "Buscar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/solicitudes",
					className: "inline-flex min-h-11 items-center rounded-full border border-ink px-4 text-sm font-semibold",
					children: "Publicar lo que necesito"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel",
					className: "inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-semibold",
					children: "Tengo un negocio"
				})
			]
		})
	] });
}
//#endregion
export { CotizarPage as component };

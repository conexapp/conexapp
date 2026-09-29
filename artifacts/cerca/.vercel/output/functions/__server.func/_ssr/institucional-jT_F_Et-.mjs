import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Shell } from "./shell-CbJDficC.mjs";
import { a as institutionalGroups, i as institutionalDocs, n as LEGAL_VERIFIED, t as LEGAL_UPDATED } from "./institutional--OE7WrwE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/institucional-jT_F_Et-.js
var import_jsx_runtime = require_jsx_runtime();
function InstitutionalHome() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-olive",
			children: "CONEX"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl",
			children: "Información institucional"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-3 max-w-3xl text-sm text-muted",
			children: [
				"Redacción vigente: ",
				LEGAL_UPDATED,
				". ",
				LEGAL_VERIFIED
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 max-w-3xl text-sm leading-relaxed",
			children: "Estas páginas explican cómo funciona CONEX, qué hace el sistema hoy y qué normas se consultaron. No dicen que CONEX cumpla toda la legislación. Donde falta un dato de la empresa, un abogado o un contador, está marcado."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-6",
			children: institutionalGroups.map((group) => {
				const items = institutionalDocs.filter((item) => item.group === group);
				if (items.length === 0) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": `grupo-${group}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: `grupo-${group}`,
						className: "text-lg font-semibold",
						children: group
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 overflow-hidden rounded-2xl border border-line bg-card",
						children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-b border-line last:border-b-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/institucional/$slug",
								params: { slug: item.slug },
								className: "flex min-h-11 flex-col justify-center px-3 py-3 hover:bg-paper",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: item.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 text-sm font-normal text-muted",
									children: item.summary
								})]
							})
						}, item.slug))
					})]
				}, group);
			})
		})
	] });
}
//#endregion
export { InstitutionalHome as component };

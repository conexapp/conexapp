import { T as require_jsx_runtime, x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { s as Route$12 } from "./_ssr/router-CvWFEIdL.mjs";
import { o as Shell } from "./_ssr/shell-CbJDficC.mjs";
import { n as LEGAL_VERIFIED, r as institutionalDoc, t as LEGAL_UPDATED } from "./_ssr/institutional--OE7WrwE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-tkgk5Nmq.js
var import_jsx_runtime = require_jsx_runtime();
var noteClass = {
	"Obligación legal": "border-olive/30 bg-teal/10",
	"Buena práctica": "border-line bg-paper",
	"Regla interna": "border-line bg-paper",
	Implementado: "border-olive/30 bg-teal/10",
	Documentado: "border-line bg-card",
	"Pendiente de información legal": "border-line bg-sun/20",
	"Pendiente de abogado": "border-line bg-sun/20",
	"Pendiente de contador": "border-line bg-sun/20",
	"Pendiente de configuración técnica": "border-line bg-sun/20"
};
function InstitutionalPage({ doc }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mx-auto max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-olive",
				children: doc.group
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl font-semibold tracking-tight md:text-4xl",
				children: doc.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-muted",
				children: [
					"Última actualización y vigencia de esta redacción: ",
					LEGAL_UPDATED,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: LEGAL_VERIFIED
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-base leading-relaxed",
				children: doc.summary
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Contenido",
				className: "mt-6 rounded-2xl border border-line bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "En esta página"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 grid gap-1",
					children: doc.sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `#${section.id}`,
						className: "inline-flex min-h-11 items-center text-sm font-medium text-olive hover:underline",
						children: section.title
					}) }, section.id))
				})]
			}),
			doc.sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: section.id,
				className: "mt-8 scroll-mt-28",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: section.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-3",
					children: section.blocks.map((block, index) => {
						if (block.type === "p") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed",
							children: block.text
						}, index);
						if (block.type === "ul") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid list-disc gap-2 pl-5 text-sm leading-relaxed",
							children: block.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
						}, index);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: `rounded-2xl border px-3 py-3 text-sm leading-relaxed ${noteClass[block.kind]}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-semibold",
								children: [block.kind, ". "]
							}), block.text]
						}, index);
					})
				})]
			}, section.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/institucional",
					className: "inline-flex min-h-11 items-center font-semibold text-olive",
					children: "Volver a la información institucional"
				})
			})
		]
	});
}
function InstitutionalDocPage() {
	const { slug } = Route$12.useParams();
	const doc = institutionalDoc(slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstitutionalPage, { doc }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-semibold",
			children: "No encontramos ese documento."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm text-muted",
			children: "El enlace no corresponde a una página institucional de CONEX."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/institucional",
			className: "mt-4 inline-flex min-h-11 items-center font-semibold text-olive",
			children: "Ver la información institucional"
		})
	] }) });
}
//#endregion
export { InstitutionalDocPage as component };

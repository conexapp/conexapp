import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as Building2, A as LayoutGrid, B as Gem, C as Paintbrush, E as Monitor, F as Headphones, G as Cpu, H as Factory, I as HardHat, L as Hammer, M as Laptop, N as Landmark, P as HeartPulse, Q as Camera, R as Guitar, S as PawPrint, T as Mountain, U as Dumbbell, V as Gamepad2, W as Droplets, Z as Car, a as Tv, at as Baby, b as Printer, c as Tablet, d as Sparkles, et as Briefcase, f as Sofa, g as Shirt, i as UtensilsCrossed, j as Layers, n as Wrench, nt as Boxes, p as Smartphone, r as Watch, rt as BookOpen, tt as BrickWall, u as Sprout, w as Package, y as Router, z as Gift } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/category-visual-BUjo7Qjd.js
var import_jsx_runtime = require_jsx_runtime();
var ICONS = {
	construccion: HardHat,
	"cementos-y-cales": Boxes,
	mamposteria: BrickWall,
	aridos: Mountain,
	hierros: Layers,
	fijaciones: Wrench,
	aislacion: Layers,
	pinturas: Paintbrush,
	sanitarios: Droplets
};
var GLYPHS = {
	technology: Smartphone,
	fashion: Shirt,
	home: Sofa,
	food: UtensilsCrossed,
	sports: Dumbbell,
	vehicles: Car,
	beauty: Sparkles,
	tools: Hammer,
	kids: Baby,
	pets: PawPrint,
	property: Building2,
	industry: Factory,
	agro: Sprout,
	health: HeartPulse,
	music: Guitar,
	books: BookOpen,
	jewelry: Gem,
	antiques: Landmark,
	parties: Gift,
	services: Briefcase
};
var ROOT_SLUGS = {
	tecnologia: Smartphone,
	moda: Shirt,
	hogar: Sofa,
	alimentos: UtensilsCrossed,
	deportes: Dumbbell,
	vehiculos: Car,
	belleza: Sparkles,
	"herramientas-construccion": Hammer,
	"juguetes-bebes": Baby,
	mascotas: PawPrint,
	inmuebles: Building2,
	"industrias-oficinas": Factory,
	agro: Sprout,
	"salud-medica": HeartPulse,
	"instrumentos-musicales": Guitar,
	"libros-arte": BookOpen,
	"joyas-relojes": Gem,
	antiguedades: Landmark,
	"fiestas-eventos": Gift,
	servicios: Briefcase
};
function glyph(icon) {
	if (!icon) return null;
	return GLYPHS[icon] ?? null;
}
var LEAF_ICONS = {
	celulares: Smartphone,
	computadoras: Laptop,
	notebooks: Laptop,
	"pc-gaming": Cpu,
	"componentes-pc": Cpu,
	monitores: Monitor,
	tablets: Tablet,
	impresoras: Printer,
	televisores: Tv,
	consolas: Gamepad2,
	videojuegos: Gamepad2,
	camaras: Camera,
	audio: Headphones,
	"accesorios-tecnologicos": Smartphone,
	redes: Router,
	relojes: Watch
};
function categoryGlyph(slug, icon, parentIcon) {
	const specific = glyph(icon) ?? LEAF_ICONS[slug] ?? ICONS[slug] ?? ROOT_SLUGS[slug];
	if (specific) return specific;
	return glyph(parentIcon) ?? Package;
}
function categoryIcon(slug) {
	return categoryGlyph(slug);
}
function CategoryGlyph({ slug, icon, parentIcon }) {
	const Icon = categoryGlyph(slug, icon, parentIcon);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		className: "size-4 shrink-0",
		"aria-hidden": true
	});
}
function AllCategoriesGlyph() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, {
		className: "size-4 shrink-0",
		"aria-hidden": true
	});
}
function categoryRowClass(active) {
	return `flex min-h-11 w-full items-center gap-3 border-l-2 px-3 py-2 text-left text-sm font-medium leading-snug whitespace-normal text-ink transition hover:bg-paper ${active ? "border-teal bg-teal/10 font-semibold" : "border-transparent"}`;
}
var HOME_CATEGORY_LIMIT = 6;
function browseCategories(categories) {
	const featured = categories.filter((category) => category.featured && !category.parentId);
	if (featured.length > 0) return featured;
	return categories.filter((category) => !category.parentId).slice(0, HOME_CATEGORY_LIMIT);
}
function CategoryCard({ slug, name, icon, active = false, onSelect }) {
	const className = categoryRowClass(active);
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: active ? "text-teal" : "text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryGlyph, {
			slug,
			icon
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "min-w-0 flex-1 leading-snug",
		children: name
	})] });
	if (onSelect) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": active,
		onClick: onSelect,
		className,
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		search: { categoria: slug },
		hash: "productos",
		className,
		children: body
	});
}
//#endregion
export { categoryIcon as a, browseCategories as i, CategoryCard as n, categoryRowClass as o, CategoryGlyph as r, AllCategoriesGlyph as t };

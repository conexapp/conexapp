import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime, d as require_react_dom } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Minus, X as Check, Y as ChevronDown, x as Plus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/controls-DMCQZUQt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function ConexSelect({ id, name, value, defaultValue = "", onChange, options, placeholder = "Elegir", ariaLabel, describedBy, invalid, disabled, required }) {
	const autoId = (0, import_react.useId)();
	const buttonId = id ?? autoId;
	const listId = `${buttonId}-list`;
	const controlled = value !== void 0;
	const [uncontrolled, setUncontrolled] = (0, import_react.useState)(defaultValue);
	const current = controlled ? value : uncontrolled;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [active, setActive] = (0, import_react.useState)(0);
	const [box, setBox] = (0, import_react.useState)(null);
	const buttonRef = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const selected = options.find((option) => option.value === current) ?? null;
	function commit(next) {
		if (!controlled) setUncontrolled(next);
		onChange?.(next);
		setOpen(false);
		buttonRef.current?.focus();
	}
	function place() {
		const el = buttonRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const gap = 6;
		const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
		const spaceAbove = rect.top - gap - 12;
		const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
		const maxHeight = Math.max(140, Math.min(320, openUp ? spaceAbove : spaceBelow));
		const width = Math.min(Math.max(rect.width, 260), window.innerWidth - 16);
		let left = rect.left;
		if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
		if (left < 8) left = 8;
		const top = openUp ? Math.max(8, rect.top - gap - maxHeight) : rect.bottom + gap;
		setBox({
			top,
			left,
			width,
			maxHeight
		});
	}
	(0, import_react.useEffect)(() => {
		if (!open) return;
		place();
		const index = Math.max(0, options.findIndex((option) => option.value === current));
		setActive(index);
		const onPointer = (event) => {
			const target = event.target;
			if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return;
			setOpen(false);
		};
		const onScroll = () => place();
		window.addEventListener("pointerdown", onPointer);
		window.addEventListener("resize", onScroll);
		window.addEventListener("scroll", onScroll, true);
		return () => {
			window.removeEventListener("pointerdown", onPointer);
			window.removeEventListener("resize", onScroll);
			window.removeEventListener("scroll", onScroll, true);
		};
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		listRef.current?.querySelector("[data-active='true']")?.focus();
	}, [open, active]);
	function onButtonKey(event) {
		if (disabled) return;
		if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			setOpen(true);
		}
	}
	function onListKey(event) {
		if (event.key === "Escape") {
			event.preventDefault();
			setOpen(false);
			buttonRef.current?.focus();
			return;
		}
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActive((index) => Math.min(options.length - 1, index + 1));
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActive((index) => Math.max(0, index - 1));
		} else if (event.key === "Home") {
			event.preventDefault();
			setActive(0);
		} else if (event.key === "End") {
			event.preventDefault();
			setActive(Math.max(0, options.length - 1));
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			const option = options[active];
			if (option) commit(option.value);
		}
	}
	let lastGroup = "";
	const rows = options.map((option, index) => {
		const showGroup = Boolean(option.group && option.group !== lastGroup);
		if (option.group) lastGroup = option.group;
		return {
			option,
			index,
			showGroup
		};
	});
	const menu = open && box && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		ref: listRef,
		id: listId,
		role: "listbox",
		"aria-labelledby": buttonId,
		tabIndex: -1,
		onKeyDown: onListKey,
		className: "cx-menu",
		style: {
			position: "fixed",
			top: box.top,
			left: box.left,
			width: box.width,
			maxHeight: box.maxHeight
		},
		children: rows.map(({ option, index, showGroup }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			role: "presentation",
			children: [showGroup ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "cx-menu-group",
				children: option.group
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				role: "option",
				"data-active": index === active,
				"aria-selected": option.value === current,
				className: "cx-menu-option",
				onMouseEnter: () => setActive(index),
				onClick: () => commit(option.value),
				children: [
					option.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `mt-0.5 shrink-0 ${option.value === current ? "text-teal" : "text-ink"}`,
						"aria-hidden": true,
						children: option.icon
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 text-left text-sm font-medium leading-snug whitespace-normal",
						children: option.label
					}),
					option.value === current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-4 shrink-0 text-olive",
						"aria-hidden": true
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 shrink-0" })
				]
			})]
		}, `${option.group ?? ""}-${option.value}-${index}`))
	}), document.body) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-w-0",
		children: [
			name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name,
				value: current
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				ref: buttonRef,
				id: buttonId,
				type: "button",
				disabled,
				"aria-label": ariaLabel,
				"aria-describedby": describedBy,
				"aria-invalid": invalid || void 0,
				"aria-required": required || void 0,
				"aria-haspopup": "listbox",
				"aria-expanded": open,
				"aria-controls": listId,
				onClick: () => {
					if (disabled) return;
					setOpen((next) => !next);
				},
				onKeyDown: onButtonKey,
				className: "cx-select",
				children: [
					selected?.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 text-teal",
						"aria-hidden": true,
						children: selected.icon
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `min-w-0 flex-1 text-left text-sm font-medium leading-snug whitespace-normal ${selected ? "" : "text-muted"}`,
						children: selected?.label || placeholder
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
						className: `size-4 shrink-0 text-olive transition-transform ${open ? "rotate-180" : ""}`,
						"aria-hidden": true
					})
				]
			}),
			menu
		]
	});
}
function QuantityField({ id, name, value, min, max, disabled, onChange }) {
	const safe = Number.isFinite(value) ? value : min;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "cx-stepper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "cx-stepper-btn",
				"aria-label": "Restar uno",
				disabled: disabled || safe <= min,
				onClick: () => onChange(Math.max(min, safe - 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
					className: "size-4",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				id,
				name,
				type: "number",
				inputMode: "numeric",
				min,
				max,
				disabled,
				value: safe,
				onChange: (event) => {
					const next = Number(event.target.value);
					if (!Number.isFinite(next)) return;
					onChange(Math.min(max, Math.max(min, next)));
				},
				className: "cx-stepper-value"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "cx-stepper-btn",
				"aria-label": "Sumar uno",
				disabled: disabled || safe >= max,
				onClick: () => onChange(Math.min(max, safe + 1)),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					"aria-hidden": true
				})
			})
		]
	});
}
//#endregion
export { QuantityField as n, ConexSelect as t };

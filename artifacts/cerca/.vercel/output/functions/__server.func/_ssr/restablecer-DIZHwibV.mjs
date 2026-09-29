import { o as __toESM } from "../_runtime.mjs";
import { C as useNavigate, Q as require_react, T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as authClient } from "./client-IWHfIGH2.mjs";
import { o as Shell } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/restablecer-DIZHwibV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPage() {
	const navigate = useNavigate();
	const [token, setToken] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setToken(new URLSearchParams(window.location.search).get("token") ?? "");
	}, []);
	async function submit(event) {
		event.preventDefault();
		if (!token) {
			toast.error("El enlace no trae un token. Pedí uno nuevo.");
			return;
		}
		setPending(true);
		try {
			const result = await authClient.resetPassword({
				newPassword: password,
				token
			});
			if (result.error) {
				toast.error(result.error.message ?? "No se cambió la contraseña.");
				return;
			}
			toast.success("Contraseña actualizada. El enlace ya no sirve.");
			await navigate({ to: "/login" });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "No se cambió la contraseña.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		className: "mx-auto grid max-w-md gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl",
				children: "Nueva contraseña"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "El enlace vence a la hora y se consume al usarlo. Las sesiones anteriores se cierran."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				required: true,
				type: "password",
				minLength: 8,
				value: password,
				onChange: (event) => setPassword(event.target.value),
				placeholder: "Nueva contraseña",
				className: "min-h-12 rounded-2xl border border-line bg-foam px-4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: pending,
				className: "min-h-12 rounded-full bg-ink text-paper disabled:opacity-60",
				children: pending ? "Guardando…" : "Guardar contraseña"
			})
		]
	}) });
}
//#endregion
export { ResetPage as component };

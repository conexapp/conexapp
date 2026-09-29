import { o as __toESM } from "../_runtime.mjs";
import { Q as require_react, T as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-CEMEiX9F.mjs";
import { a as RedirectToSignIn, d as getMyAccount, l as createSsrRpc, o as Shell, s as claimAdminIfNone, y as useCurrentUserState } from "./shell-CbJDficC.mjs";
import { r as getPlatformStatus } from "./public-CpGTpZb5.mjs";
import { n as resolveReport, t as listReports } from "./reports-CI9ZyE4B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DOUIFIuR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var adminOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("104d891b307ee121ee6bccd44cc1d85b8e39be92d0d577a9f0d71ba19ad9be4f"));
var setDefaultCommission = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((feeBps) => {
	if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 3e3) throw new Error("La comisión tiene que estar entre 0 y 30,00%.");
	return feeBps;
}).handler(createSsrRpc("43af0442dd74b6ee305d50c4164b3bd385ce3c73ed3178cee79855de92537a31"));
var reviewBusiness = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.businessId || input.decision !== "active" && input.decision !== "suspended") throw new Error("Decisión inválida.");
	return input;
}).handler(createSsrRpc("3485a09735191139808ab58c37f9c05cbfcb00518a2935db449e276d77421d18"));
var resolveDispute = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input?.disputeId || input.outcome !== "buyer" && input.outcome !== "supplier") throw new Error("Resolución inválida.");
	const note = typeof input.note === "string" ? input.note.trim() : "";
	if (note.length < 8) throw new Error("La resolución necesita un fundamento.");
	return {
		disputeId: input.disputeId,
		outcome: input.outcome,
		note: note.slice(0, 2e3)
	};
}).handler(createSsrRpc("f54fad8aea6fd50b0df372575b6454823cac6d9834caba37e95f91e35febe077"));
function AdminPage() {
	const { user, isPending } = useCurrentUserState();
	const [account, setAccount] = (0, import_react.useState)(null);
	const [overview, setOverview] = (0, import_react.useState)(null);
	const [reports, setReports] = (0, import_react.useState)([]);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [bps, setBps] = (0, import_react.useState)("300");
	const [disputeId, setDisputeId] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	function reload() {
		getMyAccount().then(setAccount);
		getPlatformStatus().then(setStatus);
		adminOverview().then(setOverview).catch(() => setOverview(null));
		listReports().then(setReports).catch(() => setReports([]));
	}
	(0, import_react.useEffect)(() => {
		if (user) reload();
	}, [user]);
	if (!isPending && !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-4xl",
			children: "Administración"
		}),
		account?.canClaimAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "mt-4 min-h-11 rounded-full bg-copper px-4 text-ink",
			onClick: () => {
				claimAdminIfNone().then(() => {
					toast.success("Quedaste como administrador. Hacelo apenas haya un operador real.");
					reload();
				}).catch((error) => toast.error(error instanceof Error ? error.message : "No se reclamó."));
			},
			children: "Reclamar administración"
		}) : null,
		account && !account.canClaimAdmin && account.platformRole !== "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 max-w-2xl text-sm text-muted",
			children: ["El alta del primer administrador no es automática. En producción hace falta CERCA_BOOTSTRAP_ADMIN_EMAIL, con ese email ya verificado, y solo mientras no exista otro admin.", status?.adminBootstrap === "dev_claim" ? " En este preview, sin esa variable, el primer usuario todavía puede reclamarla." : ""]
		}) : null,
		account && account.platformRole !== "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-sm text-muted",
			children: [
				"Tu rol es ",
				account.platformRole,
				". Esta pantalla no muestra datos de otros usuarios."
			]
		}) : null,
		status ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 rounded-card border border-line bg-foam p-4 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Integraciones"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2",
					children: [
						"Base: ",
						status.database === "embedded_preview" ? "Postgres embebido de desarrollo" : "Postgres",
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Pagos: ",
					status.payments.configured ? "configurado" : `falta ${status.payments.missing.join(", ")}`,
					"."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Email: ",
					status.email.configured ? "configurado" : `falta ${status.email.missing.join(", ")}`,
					"."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"Mapa: OpenStreetMap (",
					status.maps.id,
					"). Las teselas oficiales alcanzan para esta preview. Con tráfico real conviene un proveedor dedicado. No se usa CARTO ni Google Maps."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: status.storage.note })
			]
		}) : null,
		overview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6 grid gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Usuarios",
							value: overview.metrics.users
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Negocios reales",
							value: overview.metrics.businesses
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "En revisión",
							value: overview.metrics.pending
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Pedidos",
							value: overview.metrics.orders
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-wrap items-center gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						setDefaultCommission({ data: Number(bps) }).then(() => {
							toast.success("La comisión nueva queda para pedidos futuros. Los ya creados no cambian.");
							reload();
						}).catch((error) => toast.error(error instanceof Error ? error.message : "No se guardó."));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-sm",
							children: "Comisión global (basis points, 300 = 3%)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: bps,
							onChange: (event) => setBps(event.target.value),
							className: "min-h-11 w-28 rounded-full border border-line px-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 rounded-full bg-ink px-4 text-paper",
							children: "Guardar"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-2",
					children: overview.businesses.map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [business.trade_name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ml-2 text-sm text-muted",
							children: [
								business.status,
								business.is_demo ? " · ejemplo" : "",
								" · ",
								business.owner_email
							]
						})] }), business.is_demo ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-10 rounded-full bg-olive px-3 text-ink",
								onClick: () => void reviewBusiness({ data: {
									businessId: business.id,
									decision: "active"
								} }).then(reload),
								children: "Publicar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "cx-danger min-h-10 rounded-full border border-line px-3",
								onClick: () => void reviewBusiness({ data: {
									businessId: business.id,
									decision: "suspended"
								} }).then(reload),
								children: "Suspender"
							})]
						})]
					}, business.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						resolveDispute({ data: {
							disputeId,
							outcome: "buyer",
							note
						} }).then((result) => toast.message(result.message)).catch((error) => toast.error(error instanceof Error ? error.message : "No se resolvió."));
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "Resolver disputa a favor del comprador"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: disputeId,
							onChange: (event) => setDisputeId(event.target.value),
							placeholder: "Id de la disputa",
							className: "min-h-11 rounded-2xl border border-line px-3"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: note,
							onChange: (event) => setNote(event.target.value),
							placeholder: "Fundamento",
							className: "min-h-20 rounded-2xl border border-line px-3 py-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "min-h-11 rounded-full border border-ink",
							children: "Registrar resolución sin reembolso automático"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "Reportes"
						}),
						reports.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No hay reportes. El listado queda vacío hasta que un usuario envíe uno."
						}) : null,
						reports.map((report) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-2xl border border-line px-3 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium",
									children: [
										report.target_type,
										" · ",
										report.reason,
										" · ",
										report.status
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: report.details || "Sin detalle."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-10 rounded-full border border-line px-3 text-sm",
											onClick: () => void resolveReport({ data: {
												id: report.id,
												status: "in_review"
											} }).then(reload).catch((error) => toast.error(error instanceof Error ? error.message : "No se actualizó.")),
											children: "En revisión"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-10 rounded-full bg-olive px-3 text-sm",
											onClick: () => void resolveReport({ data: {
												id: report.id,
												status: "resolved"
											} }).then(reload).catch((error) => toast.error(error instanceof Error ? error.message : "No se actualizó.")),
											children: "Resuelto"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "min-h-10 rounded-full border border-line px-3 text-sm",
											onClick: () => void resolveReport({ data: {
												id: report.id,
												status: "dismissed"
											} }).then(reload).catch((error) => toast.error(error instanceof Error ? error.message : "No se actualizó.")),
											children: "Descartado"
										})
									]
								})
							]
						}, report.id))
					]
				})
			]
		}) : null
	] });
}
function Metric({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-card border border-line bg-foam p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-3xl tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { AdminPage as component };

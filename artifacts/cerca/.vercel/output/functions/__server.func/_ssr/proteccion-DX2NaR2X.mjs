import { T as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Shell } from "./shell-CbJDficC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proteccion-DX2NaR2X.js
var import_jsx_runtime = require_jsx_runtime();
function ProtectionPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold text-olive",
			children: "CONEX Protección"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 max-w-3xl text-4xl",
			children: "Si algo sale mal, tiene que poder demostrarse qué ocurrió."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 max-w-3xl text-muted",
			children: "CONEX no promete que una operación nunca tenga un problema, ni que una de las partes siempre tenga razón. La protección depende de lo que quedó registrado: quién vendió, qué se acordó, quién pagó, qué se preparó y quién confirmó la recepción."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 grid gap-3 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl bg-card p-4 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl",
					children: "Lo que el sistema ya hace"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Un proveedor no publica hasta que CONEX aprueba el negocio." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Las consultas, las respuestas y las compras quedan dentro de la plataforma." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "El pago protegido es el que se hace con Mercado Pago desde el pedido. Un arreglo por fuera no entra en este circuito." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "La comisión de CONEX se congela en el pedido. El neto del proveedor solo se muestra si Mercado Pago informa su propia comisión." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "El código de entrega es de un solo uso, vence a los 7 días y el servidor guarda el hash, no el código." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Validar ese código confirma la recepción. No libera el dinero al proveedor." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "El comprador puede abrir una disputa con un motivo ya definido y un texto. Las dos partes pueden dejar mensajes." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Un reembolso no se marca como hecho si Mercado Pago no lo confirma." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Las acciones sensibles quedan en el historial del pedido y en el registro de auditoría." })
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl bg-card p-4 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xl",
						children: "Lo que todavía no está"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No se muestra como si ya existiera."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-3 grid gap-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Verificación de DNI, CUIT o constancia fiscal, y una insignia distinta de “proveedor aprobado”." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Precios por volumen, reputación, ventas completadas o “entrega rápida”." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Chat de negociación adjunto a cada producto." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Fotos o video de preparación, de apertura o de la disputa." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Código visible solo para el comprador. Hoy se genera cuando el proveedor marca la salida y se muestra una sola vez, para entregarlo en mano." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Botón de arrepentimiento de 10 días y una devolución distinta de la disputa." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Plazo prometido comparado con el plazo real." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Liberación automática del dinero después de un período de protección." })
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: "Cadena que sí queda registrada"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-3 grid gap-2 text-sm md:grid-cols-2",
				children: [
					"Cotización o compra, con precio y cantidad de ese momento.",
					"Pago aprobado por Mercado Pago, o pedido sin cobro si faltan credenciales.",
					"Confirmación y preparación del proveedor.",
					"Salida a entrega o listo para retirar, con código de recepción.",
					"Código usado por el comprador: fecha en el historial. El código no se reutiliza.",
					"Cierre del comprador, disputa o cancelación. El dinero no se simula."
				].map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-2xl bg-paper px-4 py-3",
					children: step
				}, step))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Al recibir"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm",
					children: "Conviene grabar la apertura desde el paquete cerrado: etiqueta, embalaje, contenido y, si existe, número de serie. No es obligatorio. Si más adelante hay una disputa, ese registro ayuda. Hoy la disputa guarda motivo y texto, no el archivo."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "Pagar, escribirse y confirmar la entrega fuera de CONEX deja a la plataforma sin esa evidencia."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/pedidos",
					className: "mt-4 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink",
					children: "Ver mis pedidos"
				})
			]
		})
	] });
}
//#endregion
export { ProtectionPage as component };

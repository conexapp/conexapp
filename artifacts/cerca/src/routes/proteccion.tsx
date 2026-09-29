import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";

export const Route = createFileRoute("/proteccion")({ component: ProtectionPage });

function ProtectionPage() {
  return (
    <Shell>
      <p className="text-sm font-semibold text-olive">CONEX Protección</p>
      <h1 className="mt-2 max-w-3xl text-4xl">Si algo sale mal, tiene que poder demostrarse qué ocurrió.</h1>
      <p className="mt-3 max-w-3xl text-muted">
        CONEX no promete que una operación nunca tenga un problema, ni que una de las partes siempre tenga razón.
        La protección depende de lo que quedó registrado: quién vendió, qué se acordó, quién pagó, qué se preparó y quién confirmó la recepción.
      </p>

      <section className="mt-8 grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-xl">Lo que el sistema ya hace</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>Un proveedor no publica hasta que CONEX aprueba el negocio.</li>
            <li>Las consultas, las respuestas y las compras quedan dentro de la plataforma.</li>
            <li>El pago protegido es el que se hace con Mercado Pago desde el pedido. Un arreglo por fuera no entra en este circuito.</li>
            <li>La comisión de CONEX se congela en el pedido. El neto del proveedor solo se muestra si Mercado Pago informa su propia comisión.</li>
            <li>El código de entrega es de un solo uso, vence a los 7 días y el servidor guarda el hash, no el código.</li>
            <li>Validar ese código confirma la recepción. No libera el dinero al proveedor.</li>
            <li>El comprador puede abrir una disputa con un motivo ya definido y un texto. Las dos partes pueden dejar mensajes.</li>
            <li>Un reembolso no se marca como hecho si Mercado Pago no lo confirma.</li>
            <li>Las acciones sensibles quedan en el historial del pedido y en el registro de auditoría.</li>
          </ul>
        </article>
        <article className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="text-xl">Lo que todavía no está</h2>
          <p className="mt-2 text-sm text-muted">No se muestra como si ya existiera.</p>
          <ul className="mt-3 grid gap-2 text-sm">
            <li>Verificación de DNI, CUIT o constancia fiscal, y una insignia distinta de “proveedor aprobado”.</li>
            <li>Precios por volumen, reputación, ventas completadas o “entrega rápida”.</li>
            <li>Chat de negociación adjunto a cada producto.</li>
            <li>Fotos o video de preparación, de apertura o de la disputa.</li>
            <li>Código visible solo para el comprador. Hoy se genera cuando el proveedor marca la salida y se muestra una sola vez, para entregarlo en mano.</li>
            <li>Botón de arrepentimiento de 10 días y una devolución distinta de la disputa.</li>
            <li>Plazo prometido comparado con el plazo real.</li>
            <li>Liberación automática del dinero después de un período de protección.</li>
          </ul>
        </article>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl">Cadena que sí queda registrada</h2>
        <ol className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          {[
            "Cotización o compra, con precio y cantidad de ese momento.",
            "Pago aprobado por Mercado Pago, o pedido sin cobro si faltan credenciales.",
            "Confirmación y preparación del proveedor.",
            "Salida a entrega o listo para retirar, con código de recepción.",
            "Código usado por el comprador: fecha en el historial. El código no se reutiliza.",
            "Cierre del comprador, disputa o cancelación. El dinero no se simula.",
          ].map((step) => (
            <li key={step} className="rounded-2xl bg-paper px-4 py-3">{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-8 max-w-3xl">
        <h2 className="text-2xl">Al recibir</h2>
        <p className="mt-2 text-sm">
          Conviene grabar la apertura desde el paquete cerrado: etiqueta, embalaje, contenido y, si existe, número de serie.
          No es obligatorio. Si más adelante hay una disputa, ese registro ayuda. Hoy la disputa guarda motivo y texto, no el archivo.
        </p>
        <p className="mt-4 text-sm text-muted">
          Pagar, escribirse y confirmar la entrega fuera de CONEX deja a la plataforma sin esa evidencia.
        </p>
        <Link to="/pedidos" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ember px-4 text-sm font-semibold text-ink">
          Ver mis pedidos
        </Link>
      </section>
    </Shell>
  );
}

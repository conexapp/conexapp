# Arquitectura de Cerca

Nombre de trabajo: **Cerca**. Se puede cambiar. La marca no copia a Mercado Libre ni a Google Maps.

## 1. Arquitectura

Monolito modular. Un solo deploy sirve la web y la API. La app móvil futura consume los mismos endpoints y la misma base. No hay microservicios.

Capas:

- Interfaz: React, rutas en `src/routes`.
- Casos de uso: funciones de servidor en `src/lib/cerca/server`. El navegador no escribe SQL.
- Dominio puro, testeado sin base: `src/lib/cerca/domain` y `src/lib/cerca/payments`.
- Persistencia: Postgres, migraciones en `migrations`.
- Adaptadores: Mercado Pago, teselas de mapa, email. Se reemplazan sin tocar pedidos ni comisiones.

## 2. Stack y por qué

| Pieza | Elección | Alternativa | Motivo |
| --- | --- | --- | --- |
| App | TanStack Start + React | Nest separado + Next | Un proceso, tipos compartidos, deploy real. Extraer un API HTTP más adelante no obliga a reescribir el dominio. |
| Base | Postgres (Neon en producción, Postgres embebido en el entorno de vista previa) | MySQL, Mongo | Pedidos, dinero y disputas son relacionales. |
| Consultas | SQL parametrizado | ORM | El dinero y las transiciones se leen mejor en SQL. |
| Auth | Better Auth | Auth propio | Contraseñas con hash del framework, cookies `__Host-`, Google y X. No reinventamos sesiones. |
| Dinero | Enteros en centavos | `numeric` o float | Los floats no entran a un pedido. |
| Mapas | Leaflet + teselas oficiales de OpenStreetMap | Google Maps o CARTO | Sin API key. CARTO pide clave. Con tráfico real, un proveedor de teselas dedicado. |
| Pagos | Mercado Pago Split 1:1, Checkout Pro | Cobro propio, dLocal, Ualá Bis | Es el PSP de marketplace disponible en Argentina. No movemos plata nosotros. |

Desventaja del monolito: la web y la API se despliegan juntas. Para mobile alcanza. Un segundo servicio solo tendría sentido con un equipo que lo opere.

## 3. Estructura

```text
migrations/0001_auth.sql          identidad
migrations/0002_marketplace.sql   dominio
src/lib/cerca/domain              reglas puras
src/lib/cerca/payments            Mercado Pago
src/lib/cerca/server              casos de uso
src/routes                        pantallas y webhooks
```

## 4. Modelo de datos

Decisiones que no copian la lista inicial al pie de la letra:

- El usuario de Better Auth no es el perfil comercial. `profiles.platform_role` es `user` o `admin`.
- Comprador no es un rol excluyente. Cualquier cuenta puede comprar. Proveedor es quien tiene un `business`.
- `products` es el catálogo comparable. `offers` es el precio, el stock y la entrega de un negocio. Dos ferreterías no crean dos “cementos” distintos.
- No hay `cart` todavía. Un pedido sale de una cotización aceptada y es de un solo proveedor, porque el split 1:1 de Mercado Pago no parte un pago entre varios vendedores.
- `order_economics` guarda los basis points aplicados. Cambiar la comisión global no reescribe pedidos viejos.
- `delivery_codes` guarda hash, vencimiento y `used_at`. No guarda el código.
- `payment_events` es la bandeja de webhooks. El estado del pedido no sale del JSON de la notificación.
- `reviews` existe, pero solo tendrá sentido con pedidos `COMPLETED`. No hay estrellas inventadas.
- Chat: no hay tablas todavía. El lugar natural es una conversación colgada de `order_id` o `quote_request_id`, con los dos participantes ya conocidos. No se simuló.

La reputación que sí se puede calcular hoy: operaciones `COMPLETED`, cancelaciones, cantidad de reseñas y promedio, y si `verified_at` está puesto. No mostramos “entregas a tiempo” ni “tiempo de respuesta” hasta guardar el plazo prometido contra el hecho.

## 5. Flujo del comprador

1. Crea cuenta o entra.
2. Busca. Ve productos, ofertas y proveedores activos en el mapa.
3. Pide cotización (producto, cantidad, entrega, dirección).
4. Compara respuestas vigentes.
5. Acepta una. Se crea un pedido `PENDING_PAYMENT` con la comisión ya congelada. No hay débito.
6. Cuando Mercado Pago esté vinculado, “Intentar pago” crea una preferencia real y redirige. Si falta algo, el pedido no cambia.
7. Sigue estados. Al recibir, carga el código de 8 dígitos. El servidor lo valida una vez.
8. Puede cerrar la recepción (`COMPLETED`) o abrir una disputa. `COMPLETED` no liquida dinero: `settlement_status` queda `awaiting_provider`.

## 6. Flujo del proveedor

1. Crea el negocio. Estado `pending_review`. No entra en la búsqueda.
2. Marca latitud y longitud dentro del área de Rosario y publica ofertas sobre el catálogo.
3. Un administrador lo pasa a `active` (queda verificado) o lo suspende.
4. Ve solicitudes de productos que ya ofrece y responde precio, cantidad, envío, plazo y vigencia.
5. Si le aceptan, ve el pedido. Confirmar, preparar y despachar solo son acciones legales para su estado. Al despachar se genera el código, se muestra una vez y se guarda el hash.
6. Los ejemplos de desarrollo no se pueden “aprobar” como negocios reales.

## 7. Flujo de pago

Proveedor: **Mercado Pago Split de Pagos 1:1**, Checkout Pro, Argentina. Esta sección pisa cualquier frase vieja de las secciones 13 a 16 que diga que el cobro no consulta el pago.

Hechos de la documentación oficial, no supuestos:

- La preferencia se crea con el `access_token` OAuth del vendedor, no con el de la plataforma.
- `marketplace_fee` es un **monto en pesos**, tomado de la comisión ya congelada en `order_economics`. No se recalcula con la regla vigente.
- La comisión de Mercado Pago se descuenta primero del vendedor. La de Cerca sale del resto. Si el pago no trae `fee_details` de tipo `mercadopago_fee`, el neto no se muestra.
- El reembolso es `POST /v1/payments/{id}/refunds` con el token del vendedor. Es proporcional y puede fallar si el vendedor no tiene saldo.
- Split 1:1 **no documenta** una liberación de fondos al validar el código de entrega. No hay release inventado. Un pago `approved` deja el pedido en `PAID` y `settlement_status = awaiting_provider`.
- El webhook trae un id. La firma es `x-signature` (`ts` y `v1`, HMAC-SHA256 del manifest `id:{data.id};request-id:{x-request-id};ts:{ts};`, con `data.id` de la query). Después se lee `GET /v1/payments/{id}`. La notificación sola no marca `PAID`.

Implementado:

- OAuth authorization code del vendedor (`/api/payments/mercadopago/callback`). State firmado, de un solo uso, 10 minutos. El código de autorización no se guarda.
- Tokens cifrados con `CERCA_TOKEN_KEY` (AES-256-GCM). En la base embebida, sin esa clave, quedan en texto plano y la UI lo dice. En Postgres de producción, sin la clave, no se guardan.
- Refresh si el token vence en menos de 7 días. Si el refresh falla, no se usa el token muerto: hay que reconectar.
- Preferencia Checkout Pro con `marketplace_fee`, `external_reference` = id del pedido, `notification_url` y vencimiento a 24 horas. Si sigue vigente, se reutiliza. La clave de idempotencia cambia solo cuando hay que crear otra.
- Webhook: firma mala → 401. Firma buena → se guarda `payment_events` y se consulta el pago con el token del vendedor (`user_id` de la notificación). `approved` + mismo vendedor + mismo monto → `PAID`. `pending` / `rejected` / `cancelled` no. Un approved repetido no mueve stock ni crea otro pedido. Una referencia desconocida no inventa un pedido.
- Cancelar un pedido que ya tenía pago approved intenta el reembolso. Solo pasa a `REFUNDED` si Mercado Pago responde `approved` o `refunded`. Si no, queda `CANCELLED` con `refund_status` `failed` o `blocked_unconfigured`. El stock no se devuelve dos veces.
- Límites por proceso de base: webhook, callback OAuth y checkout.

No está listo para producción mientras falte cualquiera de: `MP_CLIENT_ID`, `MP_CLIENT_SECRET`, `MP_REDIRECT_URI`, `MP_WEBHOOK_SECRET`, `MP_WEBHOOK_URL`, `CERCA_TOKEN_KEY`, o el OAuth de ese vendedor. La redirect tiene que ser exactamente `https://<dominio>/api/payments/mercadopago/callback`. El webhook, tema `payment`, `https://<dominio>/api/payments/mercadopago`.

Tampoco está resuelto, porque la documentación no lo da: liberar el dinero al entregar, garantizar el reembolso si el vendedor no tiene saldo, y afirmar que la plata ya está en la cuenta bancaria del proveedor.

## 8. Compra protegida

El código lo genera el servidor al marcar “sale a entrega” o “listo para retirar”. Ocho dígitos de `crypto.randomInt`. El proveedor lo ve una sola vez y se lo da al comprador. El comprador lo envía. El servidor compara el hash con `timingSafeEqual`, exige que no esté usado ni vencido (7 días) y solo entonces pasa el pedido a `DELIVERED`, en la misma sentencia SQL que consume el código.

En producción hace falta `CERCA_DELIVERY_PEPPER` de al menos 16 caracteres. Sin esa variable y con base de producción, no se emiten códigos. En la vista previa hay un pepper de desarrollo, marcado como tal.

Cerrar la recepción no libera la plata.

## 9. Comisiones

La global vive en `platform_settings` (`commission_default_bps`, default 300 = 3%). Un administrador puede cambiarla (0 a 30%). Cada cambio inserta una `commission_rule` y no pisa la anterior.

Resolución al crear el pedido: regla de negocio > regla de categoría > regla global > default. Se guardan `fee_bps`, `marketplace_fee_cents` y el neto **antes** de la comisión de Mercado Pago. `processor_fee_cents` queda vacío hasta que el pago real lo informe. La pantalla no presenta ese neto como liquidación final.

## 10. Disputas

Motivos cerrados: faltante, incorrecto, dañado, incompleto, no recibido, problema de entrega. Hay descripción, mensajes e historial. Las fotos no se aceptan: no hay object storage.

Abrir disputa es una transición de estado, no un flag suelto. Si el administrador falla a favor del comprador, `refund_status` queda `blocked_unconfigured`. No se escribe `REFUNDED`. A favor del proveedor, el pedido puede cerrarse, con liquidación todavía pendiente.

## 11. Seguridad

- Contraseñas y sesiones: Better Auth. El servidor no confía en un `userId` enviado por el cliente; usa la sesión.
- Cada mutación revisa rol y dueño del negocio.
- SQL parametrizado, topes de largo y de cantidad, tope de cotizaciones abiertas por usuario.
- Transiciones de pedido imposibles desde el cliente (un comprador no puede marcar `PAID`).
- Webhook con firma. Idempotencia de notificaciones por id. Aceptar cotización usa una clave de idempotencia y una sola sentencia.
- Auditoría: alta de negocio, comisión, aprobación, cotización, código de entrega, disputa, intento de cobro.
- Secretos solo por variables de entorno. No hay `.env` en el repo.

Falta, y está dicho en la pantalla de integraciones: rate limit distribuido más fino que el tope de cotizaciones, antivirus de adjuntos (cuando existan) y pepper de producción.

## 12. Web y app

La web es el cliente de ahora. La app móvil tiene que ser otro cliente del mismo backend: mismas cuentas, pedidos, ofertas y reputación. No se va a duplicar lógica en el teléfono. React Native o una app nativa llaman a las funciones HTTP que este monolito ya expone. No se empieza la app hasta que el cobro real esté cerrado.

## 13. Servicios externos

| Servicio | Para qué | Estado |
| --- | --- | --- |
| Mercado Pago marketplace | cobro, split, reembolso, webhook | código listo, cuenta ausente |
| Teselas CARTO/OSM | mapa | activo en desarrollo; con tráfico hay que pagar MapTiler o Mapbox |
| Resend | email | avisos internos sí; email no, hasta tener clave y dominio |
| Object storage (R2 o S3) | fotos de producto y de disputa | no hay subida |
| Nominatim / Google Geocoding | dirección → punto | no se usa. El proveedor carga coordenadas. No geocodificamos a ciegas |

## 14. Cuentas y claves que hay que conseguir

1. [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app): aplicación **Pagos online**, producto Checkout Pro, modelo **Marketplace**.
2. Redirect URL pública de OAuth del vendedor.
3. Credenciales: `MERCADOPAGO_CLIENT_ID`, `MERCADOPAGO_CLIENT_SECRET`, `MERCADOPAGO_PUBLIC_KEY`.
4. Webhooks de la aplicación, tema `payment`, URL `https://<dominio>/api/payments/mercadopago`. Copiar el secreto a `MERCADOPAGO_WEBHOOK_SECRET`. Opcional: `MERCADOPAGO_WEBHOOK_URL` para mandarla en cada preferencia.
5. `MERCADOPAGO_REDIRECT_URI` igual a la redirect configurada.
6. Cada proveedor, con cuenta de Mercado Pago, tiene que autorizar la aplicación. Sin eso no hay split.
7. `CERCA_DELIVERY_PEPPER` largo y aleatorio en producción.
8. Email: `RESEND_API_KEY` y `RESEND_FROM` de un dominio verificado.
9. Fotos, más adelante: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.

Requisitos de Mercado Pago que no resuelve el código: la cuenta del marketplace tiene que poder operar como integrador, y cada vendedor necesita una cuenta en regla. Las comisiones, retenciones y la liquidación las hace Mercado Pago, no esta base.

## 15. Qué ya se puede usar

Registro, perfiles, reclamar el primer administrador, publicar un negocio, aprobarlo, cargar ofertas, buscar, ver el mapa, cotizar, aceptar y obtener un pedido impago, recorrer estados cuando corresponda, validar un código de entrega y abrir una disputa. Los tests de dominio cubren permisos, estados, comisión, código, firma de webhook y el monto `marketplace_fee`.

## 16. Qué depende de terceros

Cobrar, reembolsar, liquidar al proveedor, mandar email, subir fotos y un mapa con SLA comercial. También el paso que consulta `GET /v1/payments/{id}` y pasa el pedido a `PAID`: el código de firma ya está, la transición `payment_approved` solo la puede disparar el sistema, y no se ejecuta hasta poder leer el pago con el token del vendedor.

## 17. Roadmap

- Fase 0–2, hecha en lo esencial: fundación, catálogo, ofertas, búsqueda, mapa, cotizaciones.
- Fase 3, a medias: el pedido y el estado existen; el checkout real espera las credenciales y el cierre de OAuth + lectura del pago.
- Fase 4, a medias: código, disputa y reputación calculable. Falta la ventana de disputa automática y el reembolso real.
- Fase 5, a medias: panel de proveedor y admin con métricas de la base. Falta un tablero de conciliación.
- Fase 6: app móvil sobre esta API, después del cobro.

## 18. Riesgos

- Sin cuenta marketplace de Mercado Pago no hay GMV. Es el bloqueo comercial número uno.
- El split 1:1 obliga a un pago por proveedor. Un carrito mezclado hay que partirlo en varios pedidos.
- La comisión de Mercado Pago sale del vendedor y no la conocemos hasta el pago. Mostrarla como neto cerrado sería mentir.
- Las teselas públicas no son un contrato de producción.
- El primer usuario puede reclamar admin si todavía no hay ninguno. Hay que hacerlo y después no compartir esa cuenta.
- La vista previa usa una base embebida que no es la de producción. Los ejemplos no viajan a producción porque el seed se niega si la base no es la de desarrollo.
- Operar un marketplace en Argentina suma obligaciones fiscales y de defensa del consumidor que no están en el código: facturación, IIBB, términos, política de reembolso. Hace falta criterio legal antes de cobrar de verdad.

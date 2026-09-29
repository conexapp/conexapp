# CONEX — copia para otra cuenta de Grok
# Carpeta interna: cerca/. El producto se llama CONEX.

Este archivo va junto con el código. Si estás en un App Builder nuevo, reemplazá el proyecto con esta copia y no reescribas la lógica de negocio.

## Cómo restaurarlo

1. Descomprimí este zip en la raíz del proyecto del App Builder (donde está `package.json`).
2. No borres `node_modules` del sandbox nuevo si ya está instalado. Si falta algo del `package.json`, corré `npm install`.
3. No crees un `.env`. La preview usa PGLite. En deploy, la plataforma inyecta `DATABASE_URL`.
4. Arrancá con `npm run dev` en `0.0.0.0:8080` (el `startup.sh` de esta copia ya lo hace).
5. La base embebida aplica sola `migrations/*.sql` al arrancar el proceso. Si la home no muestra las 10 categorías, el proceso viejo no cargó `0006_seller_categories.sql`: reiniciá el server.
6. No subas `node_modules` ni `.vercel`.

## Qué es

Marketplace de Rosario. Cada proveedor crea su negocio, lo aprueban y publica sus productos. No hay catálogo, proveedores, precios, stock, reseñas ni ventas inventadas.

Stack: TanStack Start, React 19, Tailwind v4, PGLite (preview) / Postgres si hay `DATABASE_URL`, Leaflet + OpenStreetMap, Mercado Pago.

Paleta: `#05AD98` teal, `#FFD600` sun, `#FF7A00` ember, blanco. Texto `#14221f`.

## Qué ya está hecho

- Cuentas, login, confirmación de email, buzón de desarrollo en preview.
- Alta de negocio en revisión. Ubicación solo con lat/lng reales dentro de Rosario.
- Publicaciones del proveedor: precio, stock, foto. Una categoría de producto se puede publicar solo si tiene padre y no tiene hijos (`categoryIsLeaf` en `src/lib/cerca/server/listings.ts`).
- Búsqueda, home, ficha, cotizaciones, pedidos, disputa.
- Código de entrega hasheado. Se muestra una vez al proveedor. El comprador lo ingresa.
- Mercado Pago por negocio. Sin credenciales no se cobra. No hay reembolso ni liberación de plata si MP no lo confirma.
- Mapa “Proveedores cerca tuyo”: Leaflet + teselas oficiales de OpenStreetMap `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`, con atribución © OpenStreetMap contributors. No usar CARTO (pide API key) ni Google Maps. No cachear teselas. Con tráfico de producción, pasar a un proveedor dedicado. Nominatim sigue geocodificando la dirección del proveedor. Sin negocios aprobados el mapa se ve igual, vacío, centrado en Rosario. No inventar pines.
- Admin aprueba negocios. `verified_at` es “el admin aprobó”, no verificación fiscal.
- `/proteccion` dice qué protección existe de verdad y qué no.

## Categorías

Tabla `categories`. Migración `migrations/0006_seller_categories.sql` agrega columnas `icon`, `description`, `is_featured`, `sort_order`, `synonyms` y ~343 categorías nuevas. No borra las 9 de construcción viejas:

- raíz `cat-construccion`
- hojas `cat-cementos`, `cat-mamposteria`, `cat-aridos`, `cat-hierros`, `cat-fijaciones`, `cat-aislacion`, `cat-pinturas`, `cat-sanitarios`

No les agregues hijos ni les cambies `parent_id`: si no, lo ya publicado en esa hoja deja de poder republicarse.

10 raíces destacadas (home y chips): Tecnología, Moda e Indumentaria, Hogar y Muebles, Alimentos y Bebidas, Deportes y Fitness, Vehículos y Accesorios, Belleza y Cuidado Personal, Herramientas y Construcción, Juguetes, Bebés y Niños, Mascotas.

“Otro” no es una categoría. El resto (Inmuebles, Industrias y Oficinas, Agro, Salud, Instrumentos, Libros, Joyas, Antigüedades, Fiestas, Servicios, y Construcción vieja) se busca desde el modal.

“Construcción” hija de Herramientas es el slug `obras` (sinónimo `construccion`) para no chocar con el slug viejo. “Celulares” tiene sinónimo smartphones. “Bloques de encastre” tiene sinónimo `lego`.

Home: solo destacadas. `/categorias`: árbol completo. Vacío no inventa productos.

## Categorías del vendedor

Distintas de la categoría de cada producto. Elegir un rubro no impide publicar en otro.

- Alta en `/panel`: “¿Qué tipo de productos vendés?”. 10 cards + Otro. Multiselección. “n de 10”. Continuar deshabilitado hasta elegir una.
- Otro abre un buscador. No se guarda la palabra Otro.
- Se editan después en el mismo panel. También hay enlace desde `/cuenta`.
- Límite en `platform_settings` clave `seller_category_limit` (jsonb 10). Si falta, default 10. No hardcodear el 10 en la UI.
- Tabla `business_categories`.
- Búsqueda sin acentos, con prefijo y un typo chico. Muestra `Padre → Hijo`.
  - básquet → Deportes y Fitness → Básquet
  - guitarra → Instrumentos Musicales → Guitarras
  - perfume → Belleza y Cuidado Personal → Perfumes
  - construccion → Herramientas y Construcción → Construcción

Archivos: `src/lib/cerca/domain/seller-categories.ts`, `src/lib/cerca/server/seller-categories.ts` (solo server fns), `src/lib/cerca/server/seller-category-store.ts`, `src/components/cerca/seller-category-picker.tsx`, `src/routes/panel/index.tsx`.

## Mercado Pago — no remezclar

La lógica de cobro no se cambió. Las funciones que no son server fn (`completeSellerOAuth`, `settleCancellationRefund`, `createCheckoutPreference`, `processMercadoPagoWebhook`) están en `src/lib/cerca/server/payment-runtime.ts`. `payments.ts` solo exporta server fns. Si volvés a exportar código con `node:crypto` desde un módulo que importa una pantalla, el panel se cae con “API crypto externalized”.

## Qué NO está hecho (no lo marques como hecho)

- Verificación real de DNI/CUIT.
- Precios por volumen.
- Escribir reseñas (se leen, nadie inserta).
- Chat real.
- Evidencia de pedido distinta de las fotos de la publicación.
- Código de entrega visible solo para el comprador (hoy el proveedor lo ve una vez).
- Desistimiento de 10 días separado de la disputa.
- Plazo prometido congelado en el pedido.
- Liberar o devolver plata sin confirmación de Mercado Pago.

## Reglas

- No inventar proveedores, direcciones, coordenadas, productos, precios, stock, reseñas ni ventas.
- No borrar ni reparentar las categorías de construcción viejas.
- No filtrar la categoría del producto según las categorías del vendedor.
- Tests: `npm test`. Typecheck: `npx tsc --noEmit`. Los imports de tests de Node llevan sufijo `.ts`.

# CONEX

Marketplace local de Rosario. Conecta compradores con proveedores. Un negocio nuevo no publica hasta que un administrador lo aprueba. No hay catálogo, precios ni pines inventados.

Frase: **Todo lo que necesitás, cerca tuyo.**

## Instalar y ejecutar

```bash
npm install
npm run dev
```

Dev: `0.0.0.0:8080`. Sin `DATABASE_URL` usa PGLite y aplica `migrations/*.sql` al arrancar.

Otros comandos:

- `npm test`
- `npx tsc --noEmit`
- `npm run build` (producción; necesita `DATABASE_URL` para persistir)

## Variables

Desarrollo: ninguna obligatoria.

Producción:

- `DATABASE_URL` — Postgres
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` — URL pública https
- `VITE_AUTH_ENABLED=true`

Opcionales: `RESEND_API_KEY`, `RESEND_FROM`, `CERCA_TOKEN_KEY`, `CERCA_DELIVERY_PEPPER`, credenciales de Mercado Pago.

Administrador: `CERCA_BOOTSTRAP_ADMIN_EMAIL=conex.app1@gmail.com`. No hay contraseña en el código. La cuenta no se crea sola. Cuando `conex.app1@gmail.com` se registra y confirma el email con Better Auth, y todavía no existe otro administrador, el alta inicial del servidor la reconoce. Un usuario común no puede entrar a `/admin` ni asignarse el rol. Si ya hay un administrador, nadie más puede tomarlo.

Mapa: Leaflet + teselas CARTO/OSM, sin API key. La búsqueda de dirección usa Nominatim (OpenStreetMap) desde el servidor. Si no responde, el proveedor mueve el marcador a mano. No se inventa un punto. `location_visibility` (`exact` o `approximate`, migración `0008_location_privacy.sql`) publica el punto exacto o el centro de la celda de ~1 km. Fotos: en preview se guardan en disco local (`data/uploads`); en producción hacen falta `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY` y `S3_SECRET_KEY` (Cloudflare R2).

## Base de datos

Migraciones en `migrations/` (`0001` a `0008`). No reparentar las categorías viejas de construcción (`cat-construccion` y hojas).

## Deployment

El código está listo para un host con Node y Postgres. No hay URL pública hasta que un hosting la emita.

## Pendiente (no simulado)

- Verificación fiscal DNI/CUIT
- Chat
- Reseñas escritas
- Liberar plata sin confirmación de Mercado Pago
- Desistimiento de 10 días

Documentación técnica: [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)

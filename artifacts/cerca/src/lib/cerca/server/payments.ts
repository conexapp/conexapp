import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { tokenStorageMode } from "../domain/payments";
import { buildSellerAuthorizationUrl, missingMercadoPagoCredentials, readMercadoPagoEnv } from "../payments/mercadopago";
import { packOauthState, stateSigningKey } from "../payments/secrets";
import { bumpRateLimit } from "../domain/rate-limit";
import { audit, id, loadAccess, sql } from "./helpers";
import { PRODUCTION, loadSeller, ownedBusiness } from "./payment-runtime";

export const listSellerPaymentLinks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const env = readMercadoPagoEnv();
    const storage = tokenStorageMode({ productionDatabase: PRODUCTION(), tokenKey: env.tokenKey });
    const rows = await db<{
      id: string;
      trade_name: string;
      status: string | null;
      live_mode: boolean | null;
      expires_at: string | null;
      token_storage: string | null;
      disconnected_at: string | null;
    }>`
      select b.id, b.trade_name, spa.status, spa.live_mode, spa.expires_at::text, spa.token_storage, spa.disconnected_at::text
      from businesses b
      left join seller_payment_accounts spa on spa.business_id = b.id and spa.provider = 'mercadopago'
      where b.owner_user_id = ${context.userId} and b.is_demo = false
      order by b.created_at
    `;
    return {
      missing: missingMercadoPagoCredentials(env),
      warning: storage.ok ? storage.warning : "Falta CERCA_TOKEN_KEY. En producción no se guarda el token.",
      businesses: rows.map((row) => ({
        businessId: row.id,
        tradeName: row.trade_name,
        status: row.disconnected_at ? "disconnected" : (row.status ?? "missing"),
        liveMode: row.live_mode,
        expiresAt: row.expires_at,
        storage: row.token_storage,
        connected: row.status === "connected" && !row.disconnected_at,
      })),
    };
  });

export const startSellerOAuth = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((businessId: string) => {
    if (typeof businessId !== "string" || businessId.length < 8 || businessId.length > 80) {
      throw new Error("Negocio inválido.");
    }
    return businessId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    const hits = await bumpRateLimit(db, `oauth-start:${context.userId}`, 60);
    if (hits > 10) throw new Error("Demasiados intentos de conexión. Esperá un minuto.");
    await loadAccess(db, context.userId);
    const env = readMercadoPagoEnv();
    const missing = missingMercadoPagoCredentials(env);
    const storage = tokenStorageMode({ productionDatabase: PRODUCTION(), tokenKey: env.tokenKey });
    if (!storage.ok) missing.push("CERCA_TOKEN_KEY");
    if (missing.length > 0 || !env.clientId || !env.redirectUri) {
      return {
        url: null as string | null,
        alreadyConnected: false,
        missing,
        message: `No se abrió Mercado Pago. Falta: ${missing.join(", ")}.`,
      };
    }
    const owned = await ownedBusiness(db, context.userId, data);
    if (!owned.ok) throw new Error(owned.error);
    const seller = await loadSeller(db, data);
    const expiresMs = seller?.expires_at ? Date.parse(seller.expires_at) : NaN;
    if (seller?.status === "connected" && seller.access_token && Number.isFinite(expiresMs) && expiresMs > Date.now()) {
      return {
        url: null,
        alreadyConnected: true,
        missing: [] as string[],
        message: "Este negocio ya tiene Mercado Pago conectado y el token sigue vigente.",
      };
    }
    const signing = stateSigningKey(env.tokenKey, PRODUCTION());
    if (!signing) {
      return {
        url: null,
        alreadyConnected: false,
        missing: ["CERCA_TOKEN_KEY"],
        message: "Falta CERCA_TOKEN_KEY. No se firmó el state.",
      };
    }
    const nonce = id();
    const exp = Date.now() + 10 * 60 * 1000;
    const payload = JSON.stringify({ nonce, businessId: data, userId: context.userId, exp });
    await db`
      insert into oauth_states (nonce, business_id, user_id, expires_at)
      values (${nonce}, ${data}, ${context.userId}, ${new Date(exp).toISOString()})
    `;
    const url = buildSellerAuthorizationUrl({
      clientId: env.clientId,
      redirectUri: env.redirectUri,
      state: packOauthState(payload, signing),
    });
    await audit(db, context.userId, "oauth_start", "business", data, {});
    return { url, alreadyConnected: false, missing: [] as string[], message: "Redirigiendo a Mercado Pago." };
  });

export const disconnectSellerPayments = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((businessId: string) => {
    if (typeof businessId !== "string" || businessId.length < 8) throw new Error("Negocio inválido.");
    return businessId;
  })
  .handler(async ({ context, data }) => {
    const db = await sql();
    await loadAccess(db, context.userId);
    const owned = await ownedBusiness(db, context.userId, data);
    if (!owned.ok) throw new Error(owned.error);
    const updated = await db<{ business_id: string }>`
      update seller_payment_accounts
      set status = 'disconnected', disconnected_at = now(), access_token = null, refresh_token = null, updated_at = now()
      where business_id = ${data} and provider = 'mercadopago'
      returning business_id
    `;
    if (!updated[0]) throw new Error("Ese negocio no tenía Mercado Pago conectado.");
    await audit(db, context.userId, "oauth_disconnect", "business", data, {});
    return { ok: true as const, message: "Se desconectó Mercado Pago. Los pagos ya registrados no se borraron." };
  });

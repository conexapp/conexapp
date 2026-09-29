import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Split de Pagos 1:1 — Checkout Pro, Argentina.
 * marketplace_fee es un monto en pesos. La preferencia y el GET del pago
 * usan el access_token OAuth del vendedor. La comisión de Mercado Pago se
 * descuenta del vendedor antes que la del marketplace. El reembolso es
 * proporcional y puede fallar si el vendedor no tiene saldo.
 * No hay, en esa documentación, una llamada para liberar fondos al validar
 * el código de entrega.
 */

export const MP_OAUTH_URL = "https://auth.mercadopago.com.ar/authorization";
export const MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";
export const MP_PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";
export const MP_PAYMENT_URL = "https://api.mercadopago.com/v1/payments";

export type MercadoPagoEnv = {
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  redirectUri?: string;
  webhookUrl?: string;
  tokenKey?: string;
};

function pick(env: NodeJS.ProcessEnv, primary: string, legacy: string): string | undefined {
  const value = env[primary]?.trim() || env[legacy]?.trim();
  return value || undefined;
}

export function readMercadoPagoEnv(env: NodeJS.ProcessEnv = process.env): MercadoPagoEnv {
  return {
    clientId: pick(env, "MP_CLIENT_ID", "MERCADOPAGO_CLIENT_ID"),
    clientSecret: pick(env, "MP_CLIENT_SECRET", "MERCADOPAGO_CLIENT_SECRET"),
    webhookSecret: pick(env, "MP_WEBHOOK_SECRET", "MERCADOPAGO_WEBHOOK_SECRET"),
    redirectUri: pick(env, "MP_REDIRECT_URI", "MERCADOPAGO_REDIRECT_URI"),
    webhookUrl: pick(env, "MP_WEBHOOK_URL", "MERCADOPAGO_WEBHOOK_URL"),
    tokenKey: env.CERCA_TOKEN_KEY?.trim() || undefined,
  };
}

export function missingMercadoPagoCredentials(env: MercadoPagoEnv): string[] {
  const missing: string[] = [];
  if (!env.clientId) missing.push("MP_CLIENT_ID");
  if (!env.clientSecret) missing.push("MP_CLIENT_SECRET");
  if (!env.redirectUri) missing.push("MP_REDIRECT_URI");
  if (!env.webhookSecret) missing.push("MP_WEBHOOK_SECRET");
  if (!env.webhookUrl) missing.push("MP_WEBHOOK_URL");
  return missing;
}

export function buildSellerAuthorizationUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(MP_OAUTH_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("platform_id", "mp");
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  return url.toString();
}

export function buildTokenForm(input: {
  clientId: string;
  clientSecret: string;
  grant: "authorization_code" | "refresh_token";
  code?: string;
  redirectUri?: string;
  state?: string;
  refreshToken?: string;
}): URLSearchParams {
  const form = new URLSearchParams();
  form.set("client_id", input.clientId);
  form.set("client_secret", input.clientSecret);
  form.set("grant_type", input.grant);
  if (input.grant === "authorization_code") {
    form.set("code", input.code ?? "");
    form.set("redirect_uri", input.redirectUri ?? "");
    if (input.state) form.set("state", input.state);
  } else {
    form.set("refresh_token", input.refreshToken ?? "");
  }
  return form;
}

export type PreferenceItem = {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

/** Cuerpo documentado de POST /checkout/preferences para marketplace 1:1. */
export function buildPreferenceBody(input: {
  items: PreferenceItem[];
  marketplaceFee: number;
  externalReference: string;
  notificationUrl?: string;
  expirationDateTo?: string;
}): Record<string, unknown> {
  if (!(input.marketplaceFee >= 0)) throw new Error("marketplace_fee inválido.");
  return {
    items: input.items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      currency_id: "ARS",
    })),
    marketplace_fee: input.marketplaceFee,
    external_reference: input.externalReference,
    ...(input.notificationUrl ? { notification_url: input.notificationUrl } : {}),
    ...(input.expirationDateTo
      ? { expires: true, expiration_date_to: input.expirationDateTo }
      : {}),
  };
}

export type MpPayment = {
  id?: string | number;
  status?: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  external_reference?: string;
  collector_id?: string | number;
  fee_details?: Array<{ type?: string; amount?: number; fee_payer?: string }>;
};

export function paymentSnapshot(payment: MpPayment): MpPayment {
  return {
    id: payment.id,
    status: payment.status,
    status_detail: payment.status_detail,
    transaction_amount: payment.transaction_amount,
    currency_id: payment.currency_id,
    external_reference: payment.external_reference,
    collector_id: payment.collector_id,
    fee_details: payment.fee_details ?? null,
  } as MpPayment;
}

export function refundConfirmed(status: number, body: { status?: string } | null): boolean {
  if (status !== 200 && status !== 201) return false;
  return body?.status === "approved" || body?.status === "refunded";
}

/**
 * Manifest oficial:
 * id:[data.id];request-id:[x-request-id];ts:[ts];
 * data.id se toma de la query. Si es alfanumérico, va en minúsculas.
 * Si falta data.id o x-request-id, ese par se omite.
 */
export function mercadoPagoManifest(input: {
  dataId?: string | null;
  requestId?: string | null;
  ts: string;
}): string {
  const parts: string[] = [];
  if (input.dataId) parts.push(`id:${input.dataId.toLowerCase()}`);
  if (input.requestId) parts.push(`request-id:${input.requestId}`);
  parts.push(`ts:${input.ts}`);
  return `${parts.join(";")};`;
}

export function signMercadoPagoManifest(manifest: string, secret: string): string {
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

export function parseSignatureHeader(header: string | null): { ts: string; v1: string } | null {
  if (!header) return null;
  const found: Record<string, string> = {};
  for (const piece of header.split(",")) {
    const [key, value] = piece.split("=");
    if (key && value) found[key.trim()] = value.trim();
  }
  if (!found.ts || !found.v1) return null;
  return { ts: found.ts, v1: found.v1 };
}

export function verifyMercadoPagoSignature(input: {
  header: string | null;
  dataId?: string | null;
  requestId?: string | null;
  secret: string;
}): boolean {
  const parsed = parseSignatureHeader(input.header);
  if (!parsed) return false;
  const manifest = mercadoPagoManifest({
    dataId: input.dataId,
    requestId: input.requestId,
    ts: parsed.ts,
  });
  const expected = signMercadoPagoManifest(manifest, input.secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(parsed.v1);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function safePaymentId(value: string | null): string | null {
  if (!value || !/^[A-Za-z0-9_-]{1,48}$/.test(value)) return null;
  return value;
}

/** Decisiones de cobro sin red ni base. El pedido no se marca pagado desde el cliente. */

export const MP_ENV_NAMES = [
  "MP_CLIENT_ID",
  "MP_CLIENT_SECRET",
  "MP_REDIRECT_URI",
  "MP_WEBHOOK_SECRET",
  "MP_WEBHOOK_URL",
] as const;

export function centsToPesos(cents: number): number {
  if (!Number.isInteger(cents) || cents < 0) throw new Error("Monto inválido.");
  return Number((cents / 100).toFixed(2));
}

/** La preferencia usa la comisión ya congelada en el pedido, no la regla vigente. */
export function feeForPreference(frozenCents: number): number {
  return centsToPesos(frozenCents);
}

export function centsFromAmount(amount: number): number | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  const cents = Math.round(amount * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}

export function mayApplyPaid(input: { signatureOk: boolean; fetchedStatus: string | null }): boolean {
  return input.signatureOk === true && input.fetchedStatus === "approved";
}

export type PaymentDecision = "mark_paid" | "mark_refunded" | "record_only" | "reject_mismatch";

/**
 * El id de la notificación no alcanza. Hace falta el objeto del pago,
 * el mismo vendedor y el mismo total. Un approved repetido no vuelve a reservar stock.
 */
export function paymentApplication(input: {
  paymentStatus: string;
  externalReference: string | null;
  collectorId: string | null;
  amountCents: number | null;
  orderId: string;
  orderStatus: string;
  orderTotalCents: number;
  sellerMpUserId: string | null;
}): PaymentDecision {
  if (!input.externalReference || input.externalReference !== input.orderId) return "reject_mismatch";
  if (!input.collectorId || !input.sellerMpUserId || input.collectorId !== input.sellerMpUserId) return "reject_mismatch";
  if (input.amountCents == null || input.amountCents !== input.orderTotalCents) return "reject_mismatch";
  if (input.paymentStatus === "approved") {
    return input.orderStatus === "PENDING_PAYMENT" ? "mark_paid" : "record_only";
  }
  if (input.paymentStatus === "refunded") {
    return input.orderStatus === "PAID" || input.orderStatus === "CANCELLED" ? "mark_refunded" : "record_only";
  }
  return "record_only";
}

/** El webhook no mueve stock. La reserva ocurre al aceptar la cotización. */
export function stockDeltaForPayment(): 0 {
  return 0;
}

export function checkoutBlock(input: {
  missingCredentials: string[];
  sellerConnected: boolean;
  tokenUsable: boolean;
}): "ok" | "PAYMENTS_NOT_CONFIGURED" | "SELLER_NOT_LINKED" | "SELLER_TOKEN_EXPIRED" {
  if (input.missingCredentials.length > 0) return "PAYMENTS_NOT_CONFIGURED";
  if (!input.sellerConnected) return "SELLER_NOT_LINKED";
  if (!input.tokenUsable) return "SELLER_TOKEN_EXPIRED";
  return "ok";
}

export function reusePreference(input: { initPoint: string | null; expiresAt: string | null; nowMs: number }): boolean {
  if (!input.initPoint || !input.expiresAt) return false;
  const expires = Date.parse(input.expiresAt);
  return Number.isFinite(expires) && expires > input.nowMs;
}

export function refundDecision(input: {
  configured: boolean;
  confirmed: boolean;
}): { orderBecomesRefunded: boolean; refundStatus: "blocked_unconfigured" | "failed" | "refunded" } {
  if (!input.configured) return { orderBecomesRefunded: false, refundStatus: "blocked_unconfigured" };
  if (!input.confirmed) return { orderBecomesRefunded: false, refundStatus: "failed" };
  return { orderBecomesRefunded: true, refundStatus: "refunded" };
}

export function tokenStorageMode(input: {
  productionDatabase: boolean;
  tokenKey: string | undefined;
}):
  | { ok: true; mode: "encrypted" | "dev_plaintext"; warning: string | null }
  | { ok: false; missing: ["CERCA_TOKEN_KEY"] } {
  const key = input.tokenKey?.trim() ?? "";
  if (key.length >= 16) return { ok: true, mode: "encrypted", warning: null };
  if (!input.productionDatabase) {
    return {
      ok: true,
      mode: "dev_plaintext",
      warning:
        "Falta CERCA_TOKEN_KEY. En esta base embebida el token del vendedor queda en texto plano. No sirve para producción.",
    };
  }
  return { ok: false, missing: ["CERCA_TOKEN_KEY"] };
}

export function shouldRefreshToken(expiresAtMs: number | null, nowMs: number): boolean {
  if (expiresAtMs == null || !Number.isFinite(expiresAtMs)) return true;
  return expiresAtMs - nowMs < 7 * 24 * 60 * 60 * 1000;
}

export function processorFeeCents(details: Array<{ type?: string; amount?: number }> | null | undefined): number | null {
  if (!details) return null;
  const fee = details.find((item) => item.type === "mercadopago_fee");
  if (!fee || typeof fee.amount !== "number") return null;
  return centsFromAmount(fee.amount);
}

/** Solo hay neto si Mercado Pago informó su comisión. Cero inventado no cuenta. */
export function supplierNetCents(input: {
  grossCents: number;
  marketplaceFeeCents: number;
  processorFeeCents: number | null;
}): number | null {
  if (input.processorFeeCents == null) return null;
  return input.grossCents - input.marketplaceFeeCents - input.processorFeeCents;
}

export function notificationSellerId(body: { user_id?: string | number | null } | null): string | null {
  if (!body || body.user_id == null) return null;
  const value = String(body.user_id).trim();
  return value || null;
}

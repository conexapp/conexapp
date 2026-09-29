import { getSql } from "@/lib/db";
import { normalizeAccountEmail } from "@/lib/cerca/domain/text";
import { isEmailSignUpPath } from "./signup-path";

export { isEmailSignUpPath };

export async function emailAlreadyRegistered(rawEmail: unknown): Promise<boolean> {
  if (typeof rawEmail !== "string") return false;
  const email = normalizeAccountEmail(rawEmail);
  if (!email) return false;
  const sql = await getSql();
  const rows = await sql.query<{ id: string }>(
    `select id from "user" where lower(email) = $1 limit 1`,
    [email],
  );
  return Boolean(rows[0]);
}

export async function guardEmailSignUp(
  request: Request,
  next: (request: Request) => Promise<Response> | Response,
): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (request.method === "POST" && isEmailSignUpPath(path)) {
    const clone = request.clone();
    let raw: unknown = null;
    try {
      raw = await clone.json();
    } catch {
      raw = null;
    }
    const email = raw && typeof raw === "object" && "email" in raw ? (raw as { email: unknown }).email : undefined;
    if (await emailAlreadyRegistered(email)) {
      return Response.json(
        { message: "No se pudo crear la cuenta con esos datos.", code: "EMAIL_TAKEN" },
        { status: 422 },
      );
    }
  }
  return next(request);
}

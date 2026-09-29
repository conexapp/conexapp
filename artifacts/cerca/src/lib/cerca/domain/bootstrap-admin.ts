export type BootstrapDecision = "allow" | "already_exists" | "not_configured" | "email_mismatch" | "unverified";

/**
 * El alta del primer admin no es "el primero que apriete el botón".
 * Producción exige CERCA_BOOTSTRAP_ADMIN_EMAIL y un correo ya verificado.
 * El preview (PGLite) sin esa variable conserva el reclamo de desarrollo.
 * Si ya hay un admin, la decisión es siempre already_exists.
 */
export function bootstrapAdminDecision(input: {
  adminCount: number;
  callerEmail: string;
  emailVerified: boolean;
  bootstrapEmail: string | null;
  devClaimAllowed: boolean;
}): BootstrapDecision {
  if (input.adminCount > 0) return "already_exists";
  const bootstrap = normalizeEmail(input.bootstrapEmail);
  if (!bootstrap) {
    return input.devClaimAllowed ? "allow" : "not_configured";
  }
  if (normalizeEmail(input.callerEmail) !== bootstrap) return "email_mismatch";
  if (!input.emailVerified) return "unverified";
  return "allow";
}

export function bootstrapAdminMessage(decision: Exclude<BootstrapDecision, "allow">): string {
  switch (decision) {
    case "already_exists":
      return "Ya existe un administrador. Nadie más puede autoasignarse el rol.";
    case "not_configured":
      return "En producción el primer administrador se define con CERCA_BOOTSTRAP_ADMIN_EMAIL durante el deploy.";
    case "email_mismatch":
      return "Esta cuenta no está autorizada para el alta inicial.";
    case "unverified":
      return "Confirmá el email antes de tomar la administración.";
  }
}

export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

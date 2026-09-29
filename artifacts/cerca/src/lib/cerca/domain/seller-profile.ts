export const SELLER_GOALS = ["vender", "comprar", "ambos"] as const;
export const SELLER_ACTIVITIES = ["fabrico", "importo", "distribuyo", "revendo"] as const;
export const SELLER_CHANNELS = ["mayorista", "minorista", "empresas", "consumidor"] as const;
export const SELLER_SIZES = ["empezando", "local", "deposito", "sin_local"] as const;

export type SellerGoal = (typeof SELLER_GOALS)[number];
export type SellerSize = (typeof SELLER_SIZES)[number];

export type SellerIntent = {
  goal: SellerGoal;
  productKinds: string;
  activities: string[];
  channels: string[];
  size: SellerSize;
  ships: boolean;
  seeking: string;
  declaresMinor: boolean;
};

export const MINOR_SELL_BLOCK =
  "Declaraste ser menor de edad. Vender, publicar y cobrar quedan bloqueados hasta que exista un flujo de representante legal. No uses el documento de otra persona.";

const GOAL_LABEL: Record<SellerGoal, string> = {
  vender: "Vender",
  comprar: "Comprar",
  ambos: "Vender y comprar",
};

const ACTIVITY_LABEL: Record<(typeof SELLER_ACTIVITIES)[number], string> = {
  fabrico: "Fabrico",
  importo: "Importo",
  distribuyo: "Distribuyo",
  revendo: "Revendo",
};

const CHANNEL_LABEL: Record<(typeof SELLER_CHANNELS)[number], string> = {
  mayorista: "Mayorista",
  minorista: "Minorista",
  empresas: "A empresas",
  consumidor: "Al consumidor final",
};

const SIZE_LABEL: Record<SellerSize, string> = {
  empezando: "Estoy comenzando",
  local: "Tengo local",
  deposito: "Tengo depósito",
  sin_local: "Opero sin local",
};

export function goalLabel(goal: SellerGoal): string {
  return GOAL_LABEL[goal];
}

export function activityLabel(id: string): string {
  return ACTIVITY_LABEL[id as keyof typeof ACTIVITY_LABEL] ?? id;
}

export function channelLabel(id: string): string {
  return CHANNEL_LABEL[id as keyof typeof CHANNEL_LABEL] ?? id;
}

export function sizeLabel(size: SellerSize): string {
  return SIZE_LABEL[size];
}

function asText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function picked(value: unknown, allowed: readonly string[]): string[] {
  if (!Array.isArray(value)) return [];
  const set = new Set<string>();
  for (const item of value) {
    if (typeof item === "string" && allowed.includes(item)) set.add(item);
  }
  return [...set];
}

export function parseSellerIntent(input: unknown): SellerIntent {
  const raw = typeof input === "string" ? safeJson(input) : input;
  if (!raw || typeof raw !== "object") throw new Error("Falta la declaración.");
  const record = raw as Record<string, unknown>;
  const goal = record.goal;
  if (goal !== "vender" && goal !== "comprar" && goal !== "ambos") {
    throw new Error("Elegí si querés vender, comprar o las dos cosas.");
  }
  const size = record.size;
  if (size !== "empezando" && size !== "local" && size !== "deposito" && size !== "sin_local") {
    throw new Error("Elegí cómo operás hoy.");
  }
  return {
    goal,
    productKinds: asText(record.productKinds, 120),
    activities: picked(record.activities, SELLER_ACTIVITIES),
    channels: picked(record.channels, SELLER_CHANNELS),
    size,
    ships: record.ships === true,
    seeking: asText(record.seeking, 200),
    declaresMinor: record.declaresMinor === true,
  };
}

export function readSellerIntent(value: unknown): SellerIntent | null {
  if (value == null || value === "") return null;
  try {
    return parseSellerIntent(value);
  } catch {
    return null;
  }
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export type SellerStanding = {
  code: "menor_bloqueado" | "con_historial" | "negocio_aprobado" | "en_revision" | "actividad_declarada" | "sin_verificar";
  label: string;
  detail: string;
};

export function sellerStanding(input: {
  intent: SellerIntent | null;
  businessStatus: string | null;
  completedOrders: number;
}): SellerStanding {
  if (input.intent?.declaresMinor) {
    return {
      code: "menor_bloqueado",
      label: "Venta no habilitada",
      detail: "Declaraste ser menor de edad. No hay flujo de representante legal, así que vender y cobrar siguen bloqueados.",
    };
  }
  if (input.businessStatus === "active" && input.completedOrders > 0) {
    return {
      code: "con_historial",
      label: "Proveedor con historial",
      detail: "Hay operaciones completadas en CONEX. No es una afirmación de confianza.",
    };
  }
  if (input.businessStatus === "active") {
    return {
      code: "negocio_aprobado",
      label: "Negocio aprobado para publicar",
      detail: "CONEX revisó el alta del negocio. Eso no verifica identidad ni situación fiscal.",
    };
  }
  if (input.businessStatus === "pending_review") {
    return {
      code: "en_revision",
      label: "Alta en revisión",
      detail: "El negocio todavía no aparece en la búsqueda.",
    };
  }
  if (input.businessStatus === "suspended") {
    return {
      code: "sin_verificar",
      label: "Negocio suspendido",
      detail: "No se publica ni se opera hasta una revisión.",
    };
  }
  if (input.intent) {
    return {
      code: "actividad_declarada",
      label: "Actividad comercial declarada",
      detail: "Contaste qué hacés. Todavía no enviaste un negocio a revisión.",
    };
  }
  return {
    code: "sin_verificar",
    label: "Sin verificar",
    detail: "Todavía no declaraste una actividad ni hay un negocio aprobado.",
  };
}

export function publicStandingLabel(completedOrders: number): { label: string; detail: string } {
  if (completedOrders > 0) {
    return {
      label: "Proveedor con historial",
      detail: "Hay operaciones completadas registradas. No es una nota de confianza.",
    };
  }
  return {
    label: "Negocio aprobado para publicar",
    detail: "CONEX revisó el alta. No verifica identidad ni situación fiscal.",
  };
}

/** Solo cuando hay cierres reales. No inventa un porcentaje sobre cero. */
export function completionShare(completed: number, cancelled: number): string | null {
  if (!Number.isInteger(completed) || !Number.isInteger(cancelled) || completed < 0 || cancelled < 0) return null;
  const total = completed + cancelled;
  if (total <= 0) return null;
  const pct = Math.round((completed / total) * 100);
  return `${pct}% de ${total} ${total === 1 ? "operación cerrada" : "operaciones cerradas"} figura como completada`;
}

export function panelLead(intent: SellerIntent | null): string {
  if (!intent) return "Contanos qué querés hacer. En este paso no pedimos DNI, CUIT ni documentos.";
  if (intent.declaresMinor) return MINOR_SELL_BLOCK;
  if (intent.goal === "comprar") return "Tu cuenta está para comprar. Si más adelante querés vender, se declara acá, sin crear otro usuario.";
  if (intent.size === "empezando") return "Estás comenzando: podés publicar de a un producto. La carga masiva no existe todavía.";
  if (intent.ships) return "Marcaste que hacés envíos. La entrega se define en cada producto y en el mapa, no con una zona inventada.";
  return `Declaraste que querés ${goalLabel(intent.goal).toLocaleLowerCase("es")}. El negocio se revisa antes de aparecer en la búsqueda.`;
}

export const UNAVAILABLE_VERIFICATION = [
  "Identidad iniciada",
  "Identidad pendiente",
  "Identidad verificada",
  "Actividad comercial verificada",
  "Empresa verificada",
] as const;

export const LEGAL_REVIEW = [
  {
    topic: "Identidad",
    detail: "Nombre, apellido, DNI, fecha de nacimiento y un proveedor de verificación. No se piden ni se guardan en esta versión.",
  },
  {
    topic: "Actividad fiscal y sociedades",
    detail: "CUIT, condición fiscal, razón social societaria, representante y documentos. Tiene que verlo un contador y un abogado antes de pedirlo.",
  },
  {
    topic: "Menores",
    detail: "Hoy solo se puede declarar ser menor, y eso bloquea vender. Falta el circuito de representante, autorización, límites de pago y contratación. No se acepta el documento de un adulto como si fuera del menor.",
  },
  {
    topic: "Pagos y consumidores",
    detail: "Mercado Pago sigue como está. No hay billetera, escrow ni cobro a nombre de un menor. Las promesas al consumidor tienen que coincidir con lo que el sistema hace.",
  },
  {
    topic: "Sanciones y comisión",
    detail: "No hay detección automática ni castigos. Definir evasión, advertencia, apelación y suspensión requiere revisión legal. Una sospecha no alcanza para sancionar.",
  },
  {
    topic: "Datos de las comunicaciones",
    detail: "Un chat con archivos y conservación de evidencia necesita una política de privacidad y plazos de guarda. Hoy el registro es la consulta y la respuesta.",
  },
] as const;

export type FeeRule = {
  id: string;
  scope: "global" | "category" | "business";
  categoryId: string | null;
  businessId: string | null;
  feeBps: number;
  validFrom: string;
};

const RANK = { business: 3, category: 2, global: 1 } as const;

/**
 * La regla más específica gana. Dentro del mismo alcance, gana la más nueva.
 * El resultado se congela en el pedido: cambiar la comisión global no reescribe historia.
 */
export function resolveFeeBps(input: {
  rules: FeeRule[];
  businessId: string;
  categoryId: string | null;
  fallbackBps: number;
  now?: Date;
}): { feeBps: number; ruleId: string | null } {
  const now = (input.now ?? new Date()).toISOString();
  const applicable = input.rules.filter((rule) => {
    if (rule.validFrom > now) return false;
    if (rule.scope === "business") return rule.businessId === input.businessId;
    if (rule.scope === "category") return rule.categoryId !== null && rule.categoryId === input.categoryId;
    return rule.scope === "global";
  });
  applicable.sort((a, b) => {
    const byScope = RANK[b.scope] - RANK[a.scope];
    if (byScope !== 0) return byScope;
    return a.validFrom < b.validFrom ? 1 : -1;
  });
  const winner = applicable[0];
  if (!winner) return { feeBps: input.fallbackBps, ruleId: null };
  return { feeBps: winner.feeBps, ruleId: winner.id };
}

import { Landmark } from "lucide-react";
import {
  PAYMENT_CATALOG_DISCLAIMERS,
  PAYMENT_METHODS,
  RETIRED_PAYMENT_LABEL,
  paymentMethodByCode,
  type PaymentMethod,
} from "@/lib/cerca/domain/payment-methods";

const GROUP_LABEL: Record<PaymentMethod["group"], string> = {
  plataforma: "Plataforma",
  tarjeta: "Tarjetas",
  transferencia: "Transferencia",
};

/** Abreviatura propia de CONEX. No imita el logo, el color ni la forma de la marca. */
const NEUTRAL_MARK: Record<string, string> = {
  mercadopago: "MP",
  visa_debito: "V",
  visa_credito: "V",
  mastercard_debito: "MC",
  mastercard_credito: "MC",
  amex: "AE",
  cabal: "C",
  naranja: "NX",
};

function Mark({ method }: { method: PaymentMethod }) {
  if (method.code === "transferencia") return <Landmark className="size-4 shrink-0 text-ink" aria-hidden />;
  const letters = NEUTRAL_MARK[method.code];
  if (!letters) return null;
  return (
    <span
      aria-hidden
      className="grid h-5 min-w-5 shrink-0 place-items-center rounded-md border border-line bg-paper px-0.5 text-[10px] leading-none font-semibold tracking-tight text-ink"
    >
      {letters}
    </span>
  );
}

function MethodLabel({ method }: { method: PaymentMethod }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Mark method={method} />
      <span className="whitespace-normal break-words">{method.name}</span>
    </span>
  );
}

export function PaymentMethodName({ code }: { code: string }) {
  return paymentMethodByCode(code)?.name ?? RETIRED_PAYMENT_LABEL;
}

export function PaymentMethodInline({ code }: { code: string }) {
  const method = paymentMethodByCode(code);
  if (!method) return <span>{RETIRED_PAYMENT_LABEL}</span>;
  return <MethodLabel method={method} />;
}

export function PaymentMethodChips({ codes }: { codes: string[] }) {
  if (codes.length === 0) {
    return <p className="text-sm text-muted">Medios de pago: consultar con el proveedor.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {codes.map((code) => {
        const method = paymentMethodByCode(code);
        if (!method) return null;
        return (
          <li key={code} className="max-w-full">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-sm font-medium">
              <MethodLabel method={method} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function PaymentMethodToggles({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (codes: string[]) => void;
}) {
  const groups = ["plataforma", "tarjeta", "transferencia"] as const;
  return (
    <div className="grid gap-4">
      {groups.map((group) => (
        <fieldset key={group} className="grid min-w-0 gap-2">
          <legend className="text-sm font-semibold">{GROUP_LABEL[group]}</legend>
          <ul className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.filter((method) => method.group === group).map((method) => {
              const on = selected.includes(method.code);
              return (
                <li key={method.code} className="max-w-full">
                  <label className={`inline-flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-medium ${on ? "border-teal bg-teal/10" : "border-line bg-paper"}`}>
                    <input
                      type="checkbox"
                      className="size-4 shrink-0"
                      checked={on}
                      onChange={() => {
                        onChange(on ? selected.filter((code) => code !== method.code) : [...selected, method.code]);
                      }}
                    />
                    <MethodLabel method={method} />
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}

export function PaymentMethodRadios({
  name,
  codes,
  value,
  onChange,
}: {
  name: string;
  codes: string[];
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Cómo querés pagar" className="flex flex-wrap gap-2">
      {codes.map((code) => {
        const method = paymentMethodByCode(code);
        if (!method) return null;
        const on = value === code;
        return (
          <label
            key={code}
            className={`inline-flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-medium ${on ? "border-teal bg-teal/10" : "border-line bg-paper"}`}
          >
            <input type="radio" name={name} className="size-4 shrink-0" checked={on} onChange={() => onChange(code)} />
            <MethodLabel method={method} />
          </label>
        );
      })}
    </div>
  );
}

/** Lista informativa del footer. Sale del mismo catálogo. No selecciona ni cobra. */
export function PaymentMethodsNotice() {
  return (
    <div className="grid min-w-0 gap-3">
      <ul className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PAYMENT_METHODS.map((method) => (
          <li key={method.code} className="min-w-0">
            <p className="text-sm font-medium text-ink">
              <MethodLabel method={method} />
            </p>
            <p className="mt-1 text-sm leading-snug break-words text-muted">{method.notice}</p>
          </li>
        ))}
      </ul>
      {PAYMENT_CATALOG_DISCLAIMERS.map((text) => (
        <p key={text} className="text-sm leading-snug break-words text-muted">
          {text}
        </p>
      ))}
    </div>
  );
}

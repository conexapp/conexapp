import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Minus, Plus } from "lucide-react";

export type ConexOption = { value: string; label: string; group?: string; icon?: ReactNode };

export function ConexSelect({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  options,
  placeholder = "Elegir",
  ariaLabel,
  describedBy,
  invalid,
  disabled,
  required,
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: ConexOption[];
  placeholder?: string;
  ariaLabel?: string;
  describedBy?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
}) {
  const autoId = useId();
  const buttonId = id ?? autoId;
  const listId = `${buttonId}-list`;
  const controlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = controlled ? value : uncontrolled;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((option) => option.value === current) ?? null;

  function commit(next: string) {
    if (!controlled) setUncontrolled(next);
    onChange?.(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function place() {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(140, Math.min(320, openUp ? spaceAbove : spaceBelow));
    const width = Math.min(Math.max(rect.width, 260), window.innerWidth - 16);
    let left = rect.left;
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - width - 8);
    if (left < 8) left = 8;
    const top = openUp ? Math.max(8, rect.top - gap - maxHeight) : rect.bottom + gap;
    setBox({ top, left, width, maxHeight });
  }

  useEffect(() => {
    if (!open) return;
    place();
    const index = Math.max(0, options.findIndex((option) => option.value === current));
    setActive(index);
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = () => place();
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
    // Se posiciona al abrir. No se vuelve a enganchar en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>("[data-active='true']")?.focus();
  }, [open, active]);

  function onButtonKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function onListKey(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(0, options.length - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[active];
      if (option) commit(option.value);
    }
  }

  let lastGroup = "";
  const rows = options.map((option, index) => {
    const showGroup = Boolean(option.group && option.group !== lastGroup);
    if (option.group) lastGroup = option.group;
    return { option, index, showGroup };
  });

  const menu =
    open && box && typeof document !== "undefined"
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={buttonId}
            tabIndex={-1}
            onKeyDown={onListKey}
            className="cx-menu"
            style={{ position: "fixed", top: box.top, left: box.left, width: box.width, maxHeight: box.maxHeight }}
          >
            {rows.map(({ option, index, showGroup }) => (
              <li key={`${option.group ?? ""}-${option.value}-${index}`} role="presentation">
                {showGroup ? <p className="cx-menu-group">{option.group}</p> : null}
                <button
                  type="button"
                  role="option"
                  data-active={index === active}
                  aria-selected={option.value === current}
                  className="cx-menu-option"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => commit(option.value)}
                >
                  {option.icon ? (
                    <span className={`mt-0.5 shrink-0 ${option.value === current ? "text-teal" : "text-ink"}`} aria-hidden>
                      {option.icon}
                    </span>
                  ) : null}
                  <span className="min-w-0 flex-1 text-left text-sm font-medium leading-snug whitespace-normal">{option.label}</span>
                  {option.value === current ? <Check className="size-4 shrink-0 text-olive" aria-hidden /> : <span className="size-4 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div className="relative min-w-0">
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (disabled) return;
          setOpen((next) => !next);
        }}
        onKeyDown={onButtonKey}
        className="cx-select"
      >
        {selected?.icon ? (
          <span className="shrink-0 text-teal" aria-hidden>
            {selected.icon}
          </span>
        ) : null}
        <span className={`min-w-0 flex-1 text-left text-sm font-medium leading-snug whitespace-normal ${selected ? "" : "text-muted"}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`size-4 shrink-0 text-olive transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {menu}
    </div>
  );
}

export function QuantityField({
  id,
  name,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  id: string;
  name?: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  const safe = Number.isFinite(value) ? value : min;
  return (
    <div className="cx-stepper">
      <button type="button" className="cx-stepper-btn" aria-label="Restar uno" disabled={disabled || safe <= min} onClick={() => onChange(Math.max(min, safe - 1))}>
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        id={id}
        name={name}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        disabled={disabled}
        value={safe}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max, Math.max(min, next)));
        }}
        className="cx-stepper-value"
      />
      <button type="button" className="cx-stepper-btn" aria-label="Sumar uno" disabled={disabled || safe >= max} onClick={() => onChange(Math.min(max, safe + 1))}>
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

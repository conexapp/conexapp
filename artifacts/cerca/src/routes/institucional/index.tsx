import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { institutionalDocs, institutionalGroups, LEGAL_UPDATED, LEGAL_VERIFIED } from "@/lib/cerca/institutional";

export const Route = createFileRoute("/institucional/")({ component: InstitutionalHome });

function InstitutionalHome() {
  return (
    <Shell>
      <p className="text-sm font-semibold text-olive">CONEX</p>
      <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">Información institucional</h1>
      <p className="mt-3 max-w-3xl text-sm text-muted">Redacción vigente: {LEGAL_UPDATED}. {LEGAL_VERIFIED}</p>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed">
        Estas páginas explican cómo funciona CONEX, qué hace el sistema hoy y qué normas se consultaron.
        No dicen que CONEX cumpla toda la legislación. Donde falta un dato de la empresa, un abogado o un contador, está marcado.
      </p>
      <div className="mt-8 grid gap-6">
        {institutionalGroups.map((group) => {
          const items = institutionalDocs.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group} aria-labelledby={`grupo-${group}`}>
              <h2 id={`grupo-${group}`} className="text-lg font-semibold">{group}</h2>
              <ul className="mt-2 overflow-hidden rounded-2xl border border-line bg-card">
                {items.map((item) => (
                  <li key={item.slug} className="border-b border-line last:border-b-0">
                    <Link
                      to="/institucional/$slug"
                      params={{ slug: item.slug }}
                      className="flex min-h-11 flex-col justify-center px-3 py-3 hover:bg-paper"
                    >
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="mt-0.5 text-sm font-normal text-muted">{item.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Shell>
  );
}

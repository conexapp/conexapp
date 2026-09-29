import { Link } from "@tanstack/react-router";
import { LEGAL_UPDATED, LEGAL_VERIFIED, type InstitutionalDoc, type NoteKind } from "@/lib/cerca/institutional";

const noteClass: Record<NoteKind, string> = {
  "Obligación legal": "border-olive/30 bg-teal/10",
  "Buena práctica": "border-line bg-paper",
  "Regla interna": "border-line bg-paper",
  Implementado: "border-olive/30 bg-teal/10",
  Documentado: "border-line bg-card",
  "Pendiente de información legal": "border-line bg-sun/20",
  "Pendiente de abogado": "border-line bg-sun/20",
  "Pendiente de contador": "border-line bg-sun/20",
  "Pendiente de configuración técnica": "border-line bg-sun/20",
};

export function InstitutionalPage({ doc }: { doc: InstitutionalDoc }) {
  return (
    <article className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-olive">{doc.group}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{doc.title}</h1>
      <p className="mt-3 text-sm text-muted">Última actualización y vigencia de esta redacción: {LEGAL_UPDATED}.</p>
      <p className="mt-1 text-sm text-muted">{LEGAL_VERIFIED}</p>
      <p className="mt-4 text-base leading-relaxed">{doc.summary}</p>
      <nav aria-label="Contenido" className="mt-6 rounded-2xl border border-line bg-card p-4">
        <p className="text-sm font-semibold">En esta página</p>
        <ul className="mt-2 grid gap-1">
          {doc.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="inline-flex min-h-11 items-center text-sm font-medium text-olive hover:underline">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {doc.sections.map((section) => (
        <section key={section.id} id={section.id} className="mt-8 scroll-mt-28">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <div className="mt-3 grid gap-3">
            {section.blocks.map((block, index) => {
              if (block.type === "p") return <p key={index} className="text-sm leading-relaxed">{block.text}</p>;
              if (block.type === "ul") {
                return (
                  <ul key={index} className="grid list-disc gap-2 pl-5 text-sm leading-relaxed">
                    {block.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                );
              }
              return (
                <p key={index} className={`rounded-2xl border px-3 py-3 text-sm leading-relaxed ${noteClass[block.kind]}`}>
                  <span className="font-semibold">{block.kind}. </span>
                  {block.text}
                </p>
              );
            })}
          </div>
        </section>
      ))}
      <p className="mt-10 text-sm">
        <Link to="/institucional" className="inline-flex min-h-11 items-center font-semibold text-olive">
          Volver a la información institucional
        </Link>
      </p>
    </article>
  );
}

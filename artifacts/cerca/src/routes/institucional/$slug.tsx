import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/cerca/shell";
import { InstitutionalPage } from "@/components/cerca/institutional-page";
import { institutionalDoc } from "@/lib/cerca/institutional";

export const Route = createFileRoute("/institucional/$slug")({ component: InstitutionalDocPage });

function InstitutionalDocPage() {
  const { slug } = Route.useParams();
  const doc = institutionalDoc(slug);
  return (
    <Shell>
      {doc ? <InstitutionalPage doc={doc} /> : (
        <div>
          <h1 className="text-3xl font-semibold">No encontramos ese documento.</h1>
          <p className="mt-3 text-sm text-muted">El enlace no corresponde a una página institucional de CONEX.</p>
          <Link to="/institucional" className="mt-4 inline-flex min-h-11 items-center font-semibold text-olive">
            Ver la información institucional
          </Link>
        </div>
      )}
    </Shell>
  );
}

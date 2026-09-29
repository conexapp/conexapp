import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BadgeCheck, ChevronDown, ClipboardList, MapPin, Search, Shield, ShoppingBag } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PaymentMethodsNotice } from "@/components/cerca/payment-methods";
import { getMyAccount } from "@/lib/cerca/server/account";

const HEADER_SEARCH_PLACEHOLDER = "Buscar productos, proveedores o servicios";
const footerLinkClass =
  "inline-flex min-h-11 w-full items-center rounded-xl px-2 text-sm font-medium text-ink hover:bg-paper hover:text-olive";

function HeaderSearchControl({
  id,
  value,
  onChange,
  tabIndex,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  tabIndex?: number;
}) {
  return (
    <label className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 focus-within:border-teal">
      <Search className="size-4 shrink-0 text-muted" aria-hidden />
      <span className="sr-only">Buscar en CONEX</span>
      <span className="relative block min-w-0 flex-1">
        {value ? null : (
          <span
            aria-hidden="true"
            className="pointer-events-none block text-base leading-snug text-[color:color-mix(in_oklab,currentcolor_50%,transparent)]"
          >
            {HEADER_SEARCH_PLACEHOLDER}
          </span>
        )}
        <input
          id={id}
          name="q"
          type="search"
          autoComplete="off"
          tabIndex={tabIndex}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={HEADER_SEARCH_PLACEHOLDER}
          className={`w-full min-w-0 max-w-full bg-transparent outline-none placeholder:text-transparent ${value ? "relative" : "absolute inset-x-0 top-0 h-[1.375rem]"}`}
        />
      </span>
    </label>
  );
}

function FooterGroup({ title, render }: { title: string; render: () => ReactNode }) {
  return (
    <div className="min-w-0">
      <details className="group border-b border-line lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
          {title}
          <ChevronDown className="conex-chevron size-4 shrink-0 text-muted transition-transform" aria-hidden />
        </summary>
        <div className="pb-3">{render()}</div>
      </details>
      <div className="hidden lg:block">
        <p className="text-sm font-semibold">{title}</p>
        <div className="mt-2">{render()}</div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const locationSearch = useRouterState({
    select: (state) => state.location.search as { q?: string },
  });
  const [headerQ, setHeaderQ] = useState(typeof locationSearch?.q === "string" ? locationSearch.q : "");
  const [isAdmin, setIsAdmin] = useState(false);
  const [canClaimAdmin, setCanClaimAdmin] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    if (typeof locationSearch?.q === "string") setHeaderQ(locationSearch.q);
  }, [locationSearch?.q]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setCanClaimAdmin(false);
      setHasBusiness(false);
      return;
    }
    void getMyAccount()
      .then((account) => {
        setIsAdmin(account.platformRole === "admin");
        setCanClaimAdmin(account.canClaimAdmin);
        setHasBusiness(account.businesses.length > 0);
      })
      .catch(() => {
        setIsAdmin(false);
        setCanClaimAdmin(false);
        setHasBusiness(false);
      });
  }, [user]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void navigate({ to: "/", search: { q: headerQ.trim() || undefined, categoria: undefined }, hash: "productos" });
  }

  function buyerLinks() {
    return (
      <ul className="grid">
        <li>
          <Link to="/cotizaciones" className={footerLinkClass}>
            Mis consultas
          </Link>
        </li>
        <li>
          <Link to="/pedidos" className={footerLinkClass}>
            Mis compras
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "ayuda" }} className={footerLinkClass}>
            Cómo comprar
          </Link>
        </li>
        <li>
          <Link to="/proteccion" className={footerLinkClass}>
            Protección CONEX
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "cancelaciones" }} className={footerLinkClass}>
            Cancelaciones
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "devoluciones" }} className={footerLinkClass}>
            Devoluciones
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "arrepentimiento" }} className={footerLinkClass}>
            Arrepentimiento
          </Link>
        </li>
        {user ? (
          <li>
            <Link to="/cuenta" className={footerLinkClass}>
              Mi cuenta
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/login" className={footerLinkClass}>
              Entrar
            </Link>
          </li>
        )}
      </ul>
    );
  }

  function sellerLinks() {
    return (
      <ul className="grid">
        <li>
          <Link to="/institucional/$slug" params={{ slug: "ayuda" }} className={footerLinkClass}>
            Cómo vender
          </Link>
        </li>
        <li>
          <Link to="/panel" className={footerLinkClass}>
            {hasBusiness ? "Mi negocio" : "Crear mi negocio"}
          </Link>
        </li>
        <li>
          <Link to="/panel/productos/$listingId" params={{ listingId: "nuevo" }} className={footerLinkClass}>
            Publicar productos
          </Link>
        </li>
        <li>
          <Link to="/panel" hash="consultas" className={footerLinkClass}>
            Consultas recibidas
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "proveedores" }} className={footerLinkClass}>
            Reglas para proveedores
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "prohibidos" }} className={footerLinkClass}>
            Productos prohibidos
          </Link>
        </li>
        <li>
          <Link to="/institucional/$slug" params={{ slug: "reputacion" }} className={footerLinkClass}>
            Reputación
          </Link>
        </li>
      </ul>
    );
  }

  function protectionLinks() {
    return (
      <ul className="grid">
        <li><Link to="/proteccion" className={footerLinkClass}>Protección CONEX</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "reclamos" }} className={footerLinkClass}>Reclamos</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "disputas" }} className={footerLinkClass}>Disputas</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "seguridad" }} className={footerLinkClass}>Seguridad</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "reportar" }} className={footerLinkClass}>Reportar un problema</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "comunicaciones" }} className={footerLinkClass}>Comunicaciones</Link></li>
      </ul>
    );
  }

  function helpLinks() {
    return (
      <ul className="grid">
        <li><Link to="/institucional/$slug" params={{ slug: "ayuda" }} className={footerLinkClass}>Centro de ayuda</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "compradores" }} className={footerLinkClass}>Reglas para compradores</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "proveedores" }} className={footerLinkClass}>Reglas para proveedores</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "seguridad" }} className={footerLinkClass}>Seguridad de la cuenta</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "reclamos" }} className={footerLinkClass}>Reclamos</Link></li>
      </ul>
    );
  }

  function legalLinks() {
    return (
      <ul className="grid">
        <li><Link to="/institucional/$slug" params={{ slug: "terminos" }} className={footerLinkClass}>Términos y condiciones</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "privacidad" }} className={footerLinkClass}>Privacidad</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "cookies" }} className={footerLinkClass}>Cookies</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "comerciales" }} className={footerLinkClass}>Reglas comerciales</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "propiedad-intelectual" }} className={footerLinkClass}>Propiedad intelectual</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "publicaciones" }} className={footerLinkClass}>Publicaciones</Link></li>
        <li><Link to="/institucional/$slug" params={{ slug: "informacion-legal" }} className={footerLinkClass}>Información legal</Link></li>
      </ul>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-line bg-paper">
        <nav aria-label="Derechos de consumo" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 px-4 py-1">
          <Link to="/institucional/$slug" params={{ slug: "arrepentimiento" }} className="inline-flex min-h-11 items-center text-sm font-semibold text-olive">
            BOTÓN DE ARREPENTIMIENTO
          </Link>
          <Link to="/institucional/$slug" params={{ slug: "baja" }} className="inline-flex min-h-11 items-center text-sm font-semibold text-olive">
            BOTÓN DE BAJA DE SERVICIO
          </Link>
        </nav>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          <Link to="/" search={{ q: undefined, categoria: undefined }} className="shrink-0 leading-none">
            <span className="font-display text-2xl font-semibold tracking-tight text-olive">CONEX</span>
          </Link>
          <span className="hidden shrink-0 items-center gap-1 text-sm text-muted md:inline-flex">
            <MapPin className="size-4 text-teal" aria-hidden />
            Rosario
          </span>
          <form onSubmit={submitSearch} className="mx-2 hidden min-w-0 max-w-md flex-1 lg:flex" role="search">
            <HeaderSearchControl id="conex-header-search" value={headerQ} onChange={setHeaderQ} />
          </form>
          <nav className="ml-auto hidden min-w-0 items-center gap-0.5 overflow-x-auto lg:flex" aria-label="Principal">
            <Link to="/" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper">Inicio</Link>
            <Link to="/" hash="productos" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper">Productos</Link>
            <Link to="/proveedores" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper">Proveedores</Link>
            <Link to="/categorias" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper">Categorías</Link>
            <Link to="/" hash="mapa" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-2.5 text-sm font-medium hover:bg-paper">Mapa</Link>
          </nav>
          <div className="ml-auto flex items-center gap-1 lg:ml-1">
            <details className="relative">
              <summary className="flex min-h-11 list-none items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-paper">
                <ShoppingBag className="size-4" aria-hidden />
                <span className="sr-only">Consultas y compras</span>
              </summary>
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-card p-4 shadow-card">
                <p className="font-display text-lg font-semibold">Tus consultas y compras</p>
                <p className="mt-1 text-sm text-muted">
                  Acá ves lo que consultaste y lo que compraste. Una compra se arma cuando aceptás la respuesta de un proveedor.
                </p>
                <div className="mt-3 grid gap-2">
                  <Link to="/cotizaciones" className="inline-flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-medium">
                    Mis consultas
                  </Link>
                  <Link to="/pedidos" className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
                    Mis compras
                  </Link>
                </div>
              </div>
            </details>
            <SignedOut>
              <Link to="/login" className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-paper">
                Entrar
              </Link>
            </SignedOut>
            <SignedIn>
              <details className="relative">
                <summary className="flex min-h-11 list-none items-center rounded-full px-3 text-sm font-medium hover:bg-paper">
                  Cuenta
                </summary>
                <div className="absolute right-0 z-50 mt-2 grid w-64 gap-1 rounded-2xl border border-line bg-card p-2 shadow-card">
                  <UserButton />
                  <Link to="/cuenta" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper">
                    Mi cuenta
                  </Link>
                  <Link to="/panel" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper">
                    {hasBusiness ? "Mi negocio" : "Crear mi negocio"}
                  </Link>
                  <Link to="/cotizaciones" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper">
                    Mis consultas
                  </Link>
                  <Link to="/solicitudes" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper">
                    Lo que necesito
                  </Link>
                  <Link to="/pedidos" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper">
                    Mis compras
                  </Link>
                  {isAdmin || canClaimAdmin ? (
                    <Link to="/admin" className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm hover:bg-paper">
                      Administración
                    </Link>
                  ) : null}
                </div>
              </details>
            </SignedIn>
          </div>
        </div>
        <form onSubmit={submitSearch} className="min-w-0 px-4 pb-2 lg:hidden" role="search">
          <HeaderSearchControl id="conex-header-search-mobile" value={headerQ} onChange={setHeaderQ} tabIndex={0} />
        </form>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden" aria-label="Secciones">
          <Link to="/" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper">
            Inicio
          </Link>
          <Link to="/" hash="productos" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper">
            Productos
          </Link>
          <Link to="/proveedores" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper">
            Proveedores
          </Link>
          <Link to="/categorias" className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper">
            Categorías
          </Link>
          <Link to="/" hash="mapa" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-sm font-medium hover:bg-paper">
            Mapa
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">{children}</main>
      <footer className="conex-footer mt-8 border-t border-line bg-card">
        <div className="mx-auto max-w-7xl px-4">
          <ul className="grid gap-2 border-b border-line py-6 md:grid-cols-3 md:gap-4 md:py-8">
            <li>
              <Link to="/proveedores" className="flex h-full min-h-11 gap-3 rounded-2xl p-3 hover:bg-paper">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                  <BadgeCheck className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">Proveedores aprobados</span>
                  <span className="mt-1 block text-sm font-normal leading-snug text-muted">
                    Un negocio nuevo queda en revisión hasta que se aprueba. Recién entonces puede publicar y aparecer.
                  </span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/" hash="productos" search={{ q: undefined, categoria: undefined }} className="flex h-full min-h-11 gap-3 rounded-2xl p-3 hover:bg-paper">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                  <ClipboardList className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">Consultá antes de avanzar</span>
                  <span className="mt-1 block text-sm font-normal leading-snug text-muted">
                    Consultás un producto o publicás lo que necesitás. Si aceptás una respuesta sobre un producto, se arma una compra con ese proveedor.
                  </span>
                </span>
              </Link>
            </li>
            <li>
              <Link to="/proteccion" className="flex h-full min-h-11 gap-3 rounded-2xl p-3 hover:bg-paper">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal/10 text-teal">
                  <Shield className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">Protección CONEX</span>
                  <span className="mt-1 block text-sm font-normal leading-snug text-muted">
                    CONEX no da la razón de antemano. La protección sigue la evidencia que quedó en el pedido.
                  </span>
                </span>
              </Link>
            </li>
          </ul>
          <div className="grid gap-8 py-8 lg:grid-cols-3 xl:grid-cols-4">
            <div className="min-w-0">
              <Link to="/" search={{ q: undefined, categoria: undefined }} className="inline-flex min-h-11 items-center font-display text-xl font-semibold text-olive">
                CONEX
              </Link>
              <p className="text-sm text-ink">Todo lo que necesitás, cerca tuyo.</p>
              <p className="mt-1 text-sm text-muted">Rosario, Santa Fe, Argentina.</p>
              <Link to="/institucional/$slug" params={{ slug: "como-funciona" }} className={footerLinkClass}>Cómo funciona</Link>
              <Link to="/institucional/$slug" params={{ slug: "informacion-legal" }} className={footerLinkClass}>Información legal</Link>
            </div>
            <FooterGroup title="Compradores" render={buyerLinks} />
            <FooterGroup title="Proveedores" render={sellerLinks} />
            <FooterGroup title="Protección" render={protectionLinks} />
            <FooterGroup title="Ayuda" render={helpLinks} />
            <FooterGroup title="Legal" render={legalLinks} />
            <div className="min-w-0 lg:col-span-3 xl:col-span-4">
              <FooterGroup title="Medios de pago" render={() => <PaymentMethodsNotice />} />
            </div>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="mx-auto grid max-w-7xl gap-1 px-4 py-4 text-sm text-muted">
            <p>© 2026 CONEX. Todos los derechos reservados.</p>
            <p>CONEX no da la razón de antemano. La protección sigue la evidencia que quedó en el pedido.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

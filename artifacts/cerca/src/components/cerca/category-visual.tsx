import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Baby,
  BookOpen,
  Briefcase,
  Building2,
  Camera,
  Car,
  Cpu,
  Dumbbell,
  Factory,
  Gamepad2,
  Gem,
  Gift,
  Guitar,
  Hammer,
  Headphones,
  HeartPulse,
  Landmark,
  Laptop,
  LayoutGrid,
  Monitor,
  Package,
  PawPrint,
  Printer,
  Router,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Sprout,
  Tablet,
  Tv,
  UtensilsCrossed,
  Watch,
  Boxes,
  BrickWall,
  Droplets,
  HardHat,
  Layers,
  Mountain,
  Paintbrush,
  Wrench,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  construccion: HardHat,
  "cementos-y-cales": Boxes,
  mamposteria: BrickWall,
  aridos: Mountain,
  hierros: Layers,
  fijaciones: Wrench,
  aislacion: Layers,
  pinturas: Paintbrush,
  sanitarios: Droplets,
};

const GLYPHS: Record<string, LucideIcon> = {
  technology: Smartphone,
  fashion: Shirt,
  home: Sofa,
  food: UtensilsCrossed,
  sports: Dumbbell,
  vehicles: Car,
  beauty: Sparkles,
  tools: Hammer,
  kids: Baby,
  pets: PawPrint,
  property: Building2,
  industry: Factory,
  agro: Sprout,
  health: HeartPulse,
  music: Guitar,
  books: BookOpen,
  jewelry: Gem,
  antiques: Landmark,
  parties: Gift,
  services: Briefcase,
};

const ROOT_SLUGS: Record<string, LucideIcon> = {
  tecnologia: Smartphone,
  moda: Shirt,
  hogar: Sofa,
  alimentos: UtensilsCrossed,
  deportes: Dumbbell,
  vehiculos: Car,
  belleza: Sparkles,
  "herramientas-construccion": Hammer,
  "juguetes-bebes": Baby,
  mascotas: PawPrint,
  inmuebles: Building2,
  "industrias-oficinas": Factory,
  agro: Sprout,
  "salud-medica": HeartPulse,
  "instrumentos-musicales": Guitar,
  "libros-arte": BookOpen,
  "joyas-relojes": Gem,
  antiguedades: Landmark,
  "fiestas-eventos": Gift,
  servicios: Briefcase,
};

export function glyph(icon: string | null | undefined): LucideIcon | null {
  if (!icon) return null;
  return GLYPHS[icon] ?? null;
}

const LEAF_ICONS: Record<string, LucideIcon> = {
  celulares: Smartphone,
  computadoras: Laptop,
  notebooks: Laptop,
  "pc-gaming": Cpu,
  "componentes-pc": Cpu,
  monitores: Monitor,
  tablets: Tablet,
  impresoras: Printer,
  televisores: Tv,
  consolas: Gamepad2,
  videojuegos: Gamepad2,
  camaras: Camera,
  audio: Headphones,
  "accesorios-tecnologicos": Smartphone,
  redes: Router,
  relojes: Watch,
};

export function categoryGlyph(slug: string, icon?: string | null, parentIcon?: string | null): LucideIcon {
  const specific = glyph(icon) ?? LEAF_ICONS[slug] ?? ICONS[slug] ?? ROOT_SLUGS[slug];
  if (specific) return specific;
  return glyph(parentIcon) ?? Package;
}

export function categoryIcon(slug: string): LucideIcon {
  return categoryGlyph(slug);
}

export function CategoryGlyph({
  slug,
  icon,
  parentIcon,
}: {
  slug: string;
  icon?: string | null;
  parentIcon?: string | null;
}) {
  const Icon = categoryGlyph(slug, icon, parentIcon);
  return <Icon className="size-4 shrink-0" aria-hidden />;
}

export function AllCategoriesGlyph() {
  return <LayoutGrid className="size-4 shrink-0" aria-hidden />;
}

export function categoryRowClass(active: boolean) {
  return `flex min-h-11 w-full items-center gap-3 border-l-2 px-3 py-2 text-left text-sm font-medium leading-snug whitespace-normal text-ink transition hover:bg-paper ${active ? "border-teal bg-teal/10 font-semibold" : "border-transparent"}`;
}

const HOME_CATEGORY_LIMIT = 6;

export function browseCategories<T extends { featured?: boolean; parentId?: string | null }>(categories: T[]): T[] {
  const featured = categories.filter((category) => category.featured && !category.parentId);
  if (featured.length > 0) return featured;
  return categories.filter((category) => !category.parentId).slice(0, HOME_CATEGORY_LIMIT);
}

export function CategoryCard({
  slug,
  name,
  icon,
  active = false,
  onSelect,
}: {
  slug: string;
  name: string;
  icon?: string | null;
  active?: boolean;
  compact?: boolean;
  onSelect?: () => void;
}) {
  const className = categoryRowClass(active);
  const body = (
    <>
      <span className={active ? "text-teal" : "text-ink"}>
        <CategoryGlyph slug={slug} icon={icon} />
      </span>
      <span className="min-w-0 flex-1 leading-snug">{name}</span>
    </>
  );
  if (onSelect) {
    return (
      <button type="button" aria-pressed={active} onClick={onSelect} className={className}>
        {body}
      </button>
    );
  }
  return (
    <Link to="/" search={{ categoria: slug }} hash="productos" className={className}>
      {body}
    </Link>
  );
}

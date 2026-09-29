-- Cerca: esquema del marketplace. Referencia de rubro (categorías y productos
-- canónicos de construcción en Rosario). No incluye negocios ni usuarios de ejemplo.

create table if not exists profiles (
  user_id text primary key references "user" (id) on delete cascade,
  platform_role text not null default 'user' check (platform_role in ('user', 'admin')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into platform_settings (key, value)
values
  ('commission_default_bps', '300'::jsonb),
  ('service_area', '{"country":"AR","province":"Santa Fe","city":"Rosario","lat":-32.944242,"lng":-60.650539}'::jsonb)
on conflict (key) do nothing;

create table if not exists categories (
  id text primary key,
  parent_id text references categories (id),
  slug text not null unique,
  name text not null,
  vertical text not null default 'construccion',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  category_id text not null references categories (id),
  slug text not null unique,
  name text not null,
  unit text not null,
  description text not null default '',
  search_text text not null,
  status text not null default 'active' check (status in ('proposed', 'active', 'archived')),
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists businesses (
  id text primary key,
  owner_user_id text not null references "user" (id),
  legal_name text not null,
  trade_name text not null,
  slug text not null unique,
  cuit text,
  phone text,
  email text,
  description text not null default '',
  status text not null default 'pending_review' check (status in ('draft', 'pending_review', 'active', 'suspended')),
  address_line text,
  neighborhood text,
  city text not null default 'Rosario',
  province text not null default 'Santa Fe',
  country text not null default 'AR',
  lat double precision,
  lng double precision,
  offers_delivery boolean not null default false,
  offers_pickup boolean not null default true,
  is_demo boolean not null default false,
  search_text text not null default '',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists offers (
  id text primary key,
  business_id text not null references businesses (id) on delete cascade,
  product_id text not null references products (id),
  price_cents bigint not null check (price_cents > 0),
  stock_units integer not null check (stock_units >= 0),
  min_order_qty integer not null default 1 check (min_order_qty > 0),
  delivery boolean not null default false,
  pickup boolean not null default true,
  lead_time_hours integer,
  status text not null default 'active' check (status in ('active', 'paused')),
  updated_at timestamptz not null default now(),
  unique (business_id, product_id)
);

create table if not exists commission_rules (
  id text primary key,
  scope text not null check (scope in ('global', 'category', 'business')),
  category_id text references categories (id),
  business_id text references businesses (id),
  fee_bps integer not null check (fee_bps >= 0 and fee_bps <= 10000),
  active boolean not null default true,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists quote_requests (
  id text primary key,
  buyer_user_id text not null references "user" (id),
  product_id text references products (id),
  category_id text references categories (id),
  title text not null,
  notes text not null default '',
  quantity integer not null check (quantity > 0),
  delivery_required boolean not null default true,
  address_line text,
  city text not null default 'Rosario',
  status text not null default 'open' check (status in ('open', 'answered', 'accepted', 'cancelled', 'expired')),
  expires_at timestamptz not null,
  accepted_quote_id text,
  created_at timestamptz not null default now()
);

create table if not exists quotes (
  id text primary key,
  request_id text not null references quote_requests (id) on delete cascade,
  business_id text not null references businesses (id),
  unit_price_cents bigint not null check (unit_price_cents > 0),
  quantity integer not null check (quantity > 0),
  shipping_cents bigint not null default 0 check (shipping_cents >= 0),
  total_cents bigint not null check (total_cents > 0),
  lead_time_hours integer,
  notes text not null default '',
  valid_until timestamptz not null,
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (request_id, business_id)
);

create table if not exists orders (
  id text primary key,
  buyer_user_id text not null references "user" (id),
  business_id text not null references businesses (id),
  quote_id text references quotes (id),
  status text not null check (status in (
    'PENDING_PAYMENT', 'PAID', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED'
  )),
  fulfillment text not null check (fulfillment in ('delivery', 'pickup')),
  currency text not null default 'ARS',
  subtotal_cents bigint not null,
  shipping_cents bigint not null default 0,
  total_cents bigint not null,
  settlement_status text not null default 'not_started' check (settlement_status in (
    'not_started', 'awaiting_provider', 'released', 'failed'
  )),
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  product_id text not null references products (id),
  offer_id text references offers (id),
  title text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents bigint not null,
  line_cents bigint not null
);

create table if not exists order_events (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_user_id text,
  actor_kind text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists order_economics (
  order_id text primary key references orders (id) on delete cascade,
  gross_cents bigint not null,
  fee_bps integer not null,
  fee_rule_id text,
  marketplace_fee_cents bigint not null,
  supplier_before_processor_cents bigint not null,
  processor_fee_cents bigint,
  currency text not null default 'ARS'
);

create table if not exists payments (
  id text primary key,
  order_id text not null references orders (id),
  provider text not null,
  provider_payment_id text,
  status text not null,
  amount_cents bigint,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_events (
  id text primary key,
  provider text not null,
  notification_id text,
  provider_resource_id text,
  topic text,
  signature_ok boolean not null,
  payload jsonb not null,
  processing_status text not null,
  created_at timestamptz not null default now(),
  unique (provider, notification_id)
);

create table if not exists delivery_codes (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by text,
  created_at timestamptz not null default now()
);

create table if not exists disputes (
  id text primary key,
  order_id text not null references orders (id),
  opened_by text not null references "user" (id),
  reason text not null,
  description text not null,
  status text not null default 'open' check (status in (
    'open', 'awaiting_supplier', 'under_review', 'resolved_buyer', 'resolved_supplier', 'closed'
  )),
  resolution text,
  refund_status text not null default 'not_requested' check (refund_status in (
    'not_requested', 'blocked_unconfigured', 'requested', 'refunded'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dispute_messages (
  id text primary key,
  dispute_id text not null references disputes (id) on delete cascade,
  author_user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id text primary key,
  order_id text not null unique references orders (id),
  business_id text not null references businesses (id),
  author_user_id text not null references "user" (id),
  rating integer not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  email_status text not null default 'skipped_unconfigured',
  email_error text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id text primary key,
  actor_user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists seller_payment_accounts (
  business_id text primary key references businesses (id) on delete cascade,
  provider text not null,
  provider_user_id text,
  access_token text,
  refresh_token text,
  public_key text,
  expires_at timestamptz,
  live_mode boolean,
  updated_at timestamptz not null default now()
);

create index if not exists businesses_status_idx on businesses (status);
create index if not exists offers_product_idx on offers (product_id, status);
create index if not exists products_search_idx on products (search_text);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);
create index if not exists orders_buyer_idx on orders (buyer_user_id, created_at desc);
create index if not exists orders_business_idx on orders (business_id, created_at desc);

insert into categories (id, slug, name, vertical) values
  ('cat-cementos', 'cementos-y-cales', 'Cementos y cales', 'construccion'),
  ('cat-mamposteria', 'mamposteria', 'Mampostería', 'construccion'),
  ('cat-aridos', 'aridos', 'Áridos', 'construccion'),
  ('cat-hierros', 'hierros', 'Hierros', 'construccion'),
  ('cat-fijaciones', 'fijaciones', 'Fijaciones', 'construccion'),
  ('cat-aislacion', 'aislacion', 'Aislación', 'construccion'),
  ('cat-pinturas', 'pinturas', 'Pinturas', 'construccion'),
  ('cat-sanitarios', 'sanitarios', 'Sanitarios', 'construccion')
on conflict (id) do nothing;

insert into products (id, category_id, slug, name, unit, description, search_text) values
  ('prod-cemento-50', 'cat-cementos', 'cemento-portland-50kg', 'Cemento Portland 50 kg', 'bolsa', 'Bolsa de cemento Portland de 50 kg.', 'cemento portland 50 kg bolsa'),
  ('prod-cal-25', 'cat-cementos', 'cal-hidratada-25kg', 'Cal hidratada 25 kg', 'bolsa', 'Bolsa de cal hidratada de 25 kg.', 'cal hidratada 25 kg bolsa'),
  ('prod-ladrillo-hueco', 'cat-mamposteria', 'ladrillo-hueco-12', 'Ladrillo hueco 12x18x33', 'unidad', 'Ladrillo hueco portante de 12 cm.', 'ladrillo hueco 12 18 33 unidad'),
  ('prod-ladrillo-comun', 'cat-mamposteria', 'ladrillo-comun', 'Ladrillo común', 'unidad', 'Ladrillo común de barro cocido.', 'ladrillo comun unidad'),
  ('prod-arena', 'cat-aridos', 'arena-gruesa-m3', 'Arena gruesa', 'm3', 'Metro cúbico de arena gruesa.', 'arena gruesa m3'),
  ('prod-piedra', 'cat-aridos', 'piedra-partida-m3', 'Piedra partida', 'm3', 'Metro cúbico de piedra partida.', 'piedra partida m3'),
  ('prod-hierro-8', 'cat-hierros', 'hierro-8mm-12m', 'Hierro Ø 8 mm x 12 m', 'barra', 'Barra de acero de 8 mm y 12 metros.', 'hierro 8 mm 12 m barra'),
  ('prod-tornillo', 'cat-fijaciones', 'tornillo-autoperforante', 'Tornillo autoperforante', 'unidad', 'Tornillo autoperforante para chapa.', 'tornillo autoperforante unidad'),
  ('prod-membrana', 'cat-aislacion', 'membrana-asfaltica-4mm', 'Membrana asfáltica 4 mm', 'rollo', 'Rollo de membrana asfáltica de 4 mm.', 'membrana asfaltica 4 mm rollo'),
  ('prod-latex', 'cat-pinturas', 'latex-interior-20l', 'Látex interior 20 l', 'balde', 'Balde de látex interior de 20 litros.', 'latex interior 20 l balde pintura'),
  ('prod-pvc-110', 'cat-sanitarios', 'cano-pvc-110', 'Caño PVC 110 mm', 'tira', 'Tira de caño PVC de 110 mm.', 'cano pvc 110 mm tira'),
  ('prod-disco', 'cat-fijaciones', 'disco-corte-metal', 'Disco de corte para metal', 'unidad', 'Disco de corte para amoladora.', 'disco corte metal unidad')
on conflict (id) do nothing;

-- Publicaciones del proveedor. El catálogo global deja de venderse.
-- products, offers y los pedidos ya creados no se borran.

create table if not exists standard_products (
  id text primary key,
  category_id text references categories (id),
  slug text not null unique,
  name text not null,
  unit text not null,
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into standard_products (id, category_id, slug, name, unit, description)
select id, category_id, slug, name, unit, description
from products
on conflict (id) do nothing;

insert into categories (id, slug, name, vertical)
values ('cat-construccion', 'construccion', 'Construcción', 'construccion')
on conflict (id) do nothing;

update categories
set parent_id = 'cat-construccion'
where parent_id is null
  and id <> 'cat-construccion'
  and vertical = 'construccion';

update products set status = 'archived' where status = 'active';

create table if not exists listings (
  id text primary key,
  business_id text not null references businesses (id),
  category_id text not null references categories (id),
  standard_product_id text references standard_products (id),
  slug text not null,
  name text not null,
  description text not null default '',
  brand text not null default '',
  model text not null default '',
  sku text not null default '',
  price_cents bigint not null check (price_cents > 0),
  unit text not null,
  reference_unit text,
  reference_price_cents bigint check (reference_price_cents is null or reference_price_cents > 0),
  stock_units integer not null check (stock_units >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  pickup boolean not null default true,
  delivery boolean not null default false,
  shipping_cents bigint not null default 0 check (shipping_cents >= 0),
  lead_time_hours integer check (lead_time_hours is null or lead_time_hours >= 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'out_of_stock', 'archived')),
  search_text text not null default '',
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug)
);

create table if not exists listing_images (
  id text primary key,
  listing_id text not null references listings (id) on delete cascade,
  storage_key text not null unique,
  content_type text not null,
  byte_size integer not null check (byte_size > 0 and byte_size <= 4194304),
  position integer not null default 0,
  is_primary boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'ready', 'deleted')),
  created_at timestamptz not null default now()
);

insert into listings (
  id, business_id, category_id, standard_product_id, slug, name, description, brand, model, sku,
  price_cents, unit, stock_units, min_stock, pickup, delivery, shipping_cents, lead_time_hours,
  status, search_text, is_demo
)
select
  o.id,
  o.business_id,
  p.category_id,
  p.id,
  p.slug || '-' || substr(o.id, 1, 12),
  p.name,
  'Ejemplo migrado desde una oferta de desarrollo. No es una publicación de un proveedor real.',
  '',
  '',
  '',
  o.price_cents,
  p.unit,
  o.stock_units,
  0,
  o.pickup,
  o.delivery,
  0,
  o.lead_time_hours,
  case when b.is_demo then 'published' else 'draft' end,
  lower(p.name || ' ' || b.trade_name || ' ' || coalesce(b.neighborhood, '')),
  b.is_demo
from offers o
join products p on p.id = o.product_id
join businesses b on b.id = o.business_id
on conflict (id) do nothing;

alter table quote_requests add column if not exists listing_id text references listings (id);

alter table orders add column if not exists stock_reserved boolean not null default false;

alter table order_items alter column product_id drop not null;
alter table order_items add column if not exists listing_id text references listings (id);
alter table order_items add column if not exists brand text not null default '';
alter table order_items add column if not exists model text not null default '';
alter table order_items add column if not exists sku text not null default '';
alter table order_items add column if not exists unit text not null default '';
alter table order_items add column if not exists image_key text;

create index if not exists listings_business_status_idx on listings (business_id, status);
create index if not exists listings_public_idx on listings (status) where status = 'published';
create index if not exists listings_standard_idx on listings (standard_product_id);
create index if not exists listing_images_listing_idx on listing_images (listing_id, position);
create index if not exists quote_requests_listing_idx on quote_requests (listing_id);
create index if not exists order_items_listing_idx on order_items (listing_id);

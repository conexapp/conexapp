-- Medios que el proveedor declara. No verifica terminales ni cuentas.
-- El array vacío no inventa métodos. NULL en la publicación significa heredar el negocio.
-- payment_declared distingue un pedido nuevo (aunque no haya medio) de uno anterior a esta columna.

alter table businesses
  add column if not exists payment_methods jsonb not null default '[]'::jsonb;

alter table listings
  add column if not exists payment_methods jsonb;

alter table orders
  add column if not exists payment_method text;

alter table orders
  add column if not exists payment_declared boolean not null default false;

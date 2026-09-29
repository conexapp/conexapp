-- Cobro Split 1:1. No borra pedidos ni publicaciones.

alter table seller_payment_accounts add column if not exists status text not null default 'connected';
alter table seller_payment_accounts add column if not exists scope text not null default '';
alter table seller_payment_accounts add column if not exists disconnected_at timestamptz;
alter table seller_payment_accounts add column if not exists token_storage text not null default 'encrypted';

alter table orders add column if not exists refund_status text not null default 'not_requested';

alter table payments add column if not exists expires_at timestamptz;

alter table payment_events add column if not exists processing_error text;

create table if not exists oauth_states (
  nonce text primary key,
  business_id text not null references businesses (id),
  user_id text not null,
  expires_at timestamptz not null,
  used_at timestamptz
);

create unique index if not exists payments_mp_id_idx
  on payments (provider, provider_payment_id)
  where provider_payment_id is not null;

create index if not exists oauth_states_expiry_idx on oauth_states (expires_at);

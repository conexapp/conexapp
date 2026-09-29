-- Hardening: límites, tokens de correo de un solo uso y buzón de desarrollo.
-- No toca pagos.

create table if not exists rate_limits (
  bucket text primary key,
  hits integer not null check (hits >= 0),
  window_started_at timestamptz not null
);

create table if not exists auth_tokens (
  token_hash text primary key,
  email text not null,
  kind text not null check (kind in ('verify', 'reset')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists auth_tokens_email_idx on auth_tokens (email, created_at desc);

create table if not exists auth_outbox (
  id text primary key,
  email text not null,
  kind text not null check (kind in ('verify', 'reset')),
  url text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_outbox_email_idx on auth_outbox (email, created_at desc);

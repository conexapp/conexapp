-- Reportes de contenido. No inventa filas.
create table if not exists content_reports (
  id text primary key,
  reporter_user_id text not null references "user" (id),
  target_type text not null check (target_type in ('listing', 'business', 'user', 'other')),
  target_id text not null,
  reason text not null,
  details text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_review', 'resolved', 'dismissed')),
  admin_note text,
  resolved_by text references "user" (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_reports_status_idx on content_reports (status, created_at desc);
create index if not exists content_reports_target_idx on content_reports (target_type, target_id);

-- Declaración comercial del proveedor. No guarda DNI, CUIT ni documentos.

alter table profiles add column if not exists seller_intent jsonb;

alter table businesses add column if not exists coverage_note text not null default '';
alter table businesses add column if not exists min_order_note text not null default '';
alter table businesses add column if not exists sells_wholesale boolean;
alter table businesses add column if not exists sells_retail boolean;

-- Public pin can be the exact stored point or the center of its ~1 km cell.
alter table businesses
  add column if not exists location_visibility text not null default 'exact';

alter table businesses drop constraint if exists businesses_location_visibility_check;
alter table businesses
  add constraint businesses_location_visibility_check
  check (location_visibility in ('exact', 'approximate'));

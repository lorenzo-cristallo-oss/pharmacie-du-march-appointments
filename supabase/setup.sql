create extension if not exists pgcrypto;

create table if not exists public.reservations (
 id uuid primary key default gen_random_uuid(), type text not null, service text not null,
 appointment_date date not null, start_time time not null, first_name text not null,
 last_name text not null, phone text not null, email text, notes text,
 status text not null default 'pending', created_at timestamptz not null default now()
);
create table if not exists public.blocked_slots (
 id uuid primary key default gen_random_uuid(), type text not null, blocked_date date not null,
 start_time time, end_time time, reason text, created_at timestamptz not null default now()
);
alter table public.reservations add column if not exists notes text;
alter table public.reservations drop constraint if exists reservations_type_check;
alter table public.reservations add constraint reservations_type_check check(type in ('vaccin','prestation'));
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check check(status in ('pending','accepted','refused'));
alter table public.blocked_slots drop constraint if exists blocked_slots_type_check;
alter table public.blocked_slots add constraint blocked_slots_type_check check(type in ('vaccin','prestation','all'));
drop index if exists public.unique_active_reservation_slot;
create unique index unique_active_reservation_slot on public.reservations(type,appointment_date,start_time) where status in ('pending','accepted');
alter table public.reservations enable row level security;
alter table public.blocked_slots enable row level security;
revoke all on public.reservations from anon,authenticated;
revoke all on public.blocked_slots from anon,authenticated;

create or replace function public.admin_check_password(p_password text) returns boolean language sql security definer set search_path=public as $$ select p_password='159753'; $$;
create or replace function public.get_unavailable_slots(p_type text,p_date date) returns text[] language sql security definer set search_path=public as $$
 select coalesce(array_agg(distinct slot order by slot),'{}'::text[]) from (
  select to_char(start_time,'HH24:MI') slot from reservations where type=p_type and appointment_date=p_date and status in ('pending','accepted')
  union
  select to_char(gs,'HH24:MI') from blocked_slots b, lateral generate_series(p_date::timestamp+coalesce(b.start_time,time '00:00'),p_date::timestamp+coalesce(b.end_time,time '23:59')-interval '1 minute',interval '30 minutes') gs where b.blocked_date=p_date and b.type in (p_type,'all')
 ) x;
$$;
create or replace function public.create_reservation(p_type text,p_service text,p_date date,p_time time,p_first_name text,p_last_name text,p_phone text,p_email text default null,p_notes text default null) returns uuid language plpgsql security definer set search_path=public as $$
declare v uuid; begin
 if p_type not in ('vaccin','prestation') then raise exception 'Type invalide'; end if;
 if p_date<current_date then raise exception 'Date invalide'; end if;
 if exists(select 1 from blocked_slots where blocked_date=p_date and type in(p_type,'all') and (start_time is null or (p_time>=start_time and p_time<end_time))) then raise exception 'Ce créneau est indisponible'; end if;
 insert into reservations(type,service,appointment_date,start_time,first_name,last_name,phone,email,notes) values(p_type,trim(p_service),p_date,p_time,trim(p_first_name),trim(p_last_name),trim(p_phone),nullif(trim(p_email),''),nullif(trim(p_notes),'')) returning id into v; return v;
 exception when unique_violation then raise exception 'Ce créneau vient d’être réservé'; end; $$;
create or replace function public.admin_list_reservations(p_password text) returns setof public.reservations language plpgsql security definer set search_path=public as $$ begin if not admin_check_password(p_password) then raise exception 'Mot de passe incorrect'; end if; return query select * from reservations order by appointment_date desc,start_time desc,created_at desc; end; $$;
create or replace function public.admin_list_blocks(p_password text) returns setof public.blocked_slots language plpgsql security definer set search_path=public as $$ begin if not admin_check_password(p_password) then raise exception 'Mot de passe incorrect'; end if; return query select * from blocked_slots order by blocked_date desc,start_time nulls first; end; $$;
create or replace function public.admin_set_reservation_status(p_password text,p_id uuid,p_status text) returns boolean language plpgsql security definer set search_path=public as $$ begin if not admin_check_password(p_password) then raise exception 'Mot de passe incorrect'; end if; if p_status not in('pending','accepted','refused') then raise exception 'Statut invalide'; end if; update reservations set status=p_status where id=p_id; return found; end; $$;
create or replace function public.admin_add_block(p_password text,p_type text,p_date date,p_start_time time default null,p_end_time time default null,p_reason text default null) returns uuid language plpgsql security definer set search_path=public as $$ declare v uuid; begin if not admin_check_password(p_password) then raise exception 'Mot de passe incorrect'; end if; if p_type not in('vaccin','prestation','all') then raise exception 'Type invalide'; end if; if (p_start_time is null)<>(p_end_time is null) then raise exception 'Plage incomplète'; end if; if p_start_time is not null and p_end_time<=p_start_time then raise exception 'Plage invalide'; end if; insert into blocked_slots(type,blocked_date,start_time,end_time,reason) values(p_type,p_date,p_start_time,p_end_time,nullif(trim(p_reason),'')) returning id into v; return v; end; $$;
create or replace function public.admin_delete_block(p_password text,p_id uuid) returns boolean language plpgsql security definer set search_path=public as $$ begin if not admin_check_password(p_password) then raise exception 'Mot de passe incorrect'; end if; delete from blocked_slots where id=p_id; return found; end; $$;
grant execute on function public.admin_check_password(text) to anon;
grant execute on function public.get_unavailable_slots(text,date) to anon;
grant execute on function public.create_reservation(text,text,date,time,text,text,text,text,text) to anon;
grant execute on function public.admin_list_reservations(text) to anon;
grant execute on function public.admin_list_blocks(text) to anon;
grant execute on function public.admin_set_reservation_status(text,uuid,text) to anon;
grant execute on function public.admin_add_block(text,text,date,time,time,text) to anon;
grant execute on function public.admin_delete_block(text,uuid) to anon;

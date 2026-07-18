-- Multi-monitor support: label each screenshot with which display it came from
-- ("Monitor 1", "Monitor 2", ...). A worker with two screens can otherwise
-- evade capture by keeping activity on the second monitor.

alter table screenshots add column if not exists label text;

-- Replace ingest_screenshot with a version that accepts the monitor label.
-- Drop the old 6-argument version first so there is no ambiguous overload.
drop function if exists public.ingest_screenshot(text, text, timestamptz, int, int, int);

create or replace function public.ingest_screenshot(
  p_device_id text,
  p_file_path text,
  p_captured_at timestamptz default now(),
  p_file_size int default null,
  p_width int default null,
  p_height int default null,
  p_label text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from workers where device_id = p_device_id;
  if v_id is null then
    raise exception 'device not registered';
  end if;
  insert into screenshots (worker_id, file_path, captured_at, file_size, width, height, label)
  values (v_id, p_file_path, coalesce(p_captured_at, now()), p_file_size, p_width, p_height, p_label);
end;
$$;

grant execute on function public.ingest_screenshot(text, text, timestamptz, int, int, int, text) to anon, authenticated;

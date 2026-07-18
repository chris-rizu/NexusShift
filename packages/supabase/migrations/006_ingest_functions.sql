-- Secure ingest layer for the worker agent.
--
-- The agent runs on untrusted employee machines and carries only the PUBLIC
-- (publishable/anon) key. It must never hold the service-role key. These
-- SECURITY DEFINER functions run with the definer's privileges, so the agent
-- can WRITE its own monitoring data without us exposing the tables directly.
-- Crucially, none of these functions return other workers' data, and there is
-- no anon SELECT grant on the tables — so a public-key holder can write, but
-- can never read employee data back.
--
-- NOTE ON THREAT MODEL: without per-device authentication tokens, a holder of
-- the public key could submit fabricated rows for an arbitrary device_id. That
-- is the accepted MVP tradeoff; the hardened version issues a signed per-device
-- token at enrollment and checks it inside these functions.

-- 1. Look up a worker id by device (no registration, no data exposure).
create or replace function public.get_worker_id(p_device_id text)
returns uuid
language sql security definer set search_path = public
as $$
  select id from workers where device_id = p_device_id;
$$;

-- 2. Register the device on first run (idempotent) and return its worker id.
create or replace function public.get_or_register_worker(
  p_device_id text,
  p_name text,
  p_email text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id from workers where device_id = p_device_id;
  if v_id is null then
    insert into workers (name, email, device_id)
    values (coalesce(nullif(p_name, ''), 'Unknown'), nullif(p_email, ''), p_device_id)
    returning id into v_id;
  end if;
  return v_id;
end;
$$;

-- 3. Record a screenshot row (the file itself goes to storage).
create or replace function public.ingest_screenshot(
  p_device_id text,
  p_file_path text,
  p_captured_at timestamptz default now(),
  p_file_size int default null,
  p_width int default null,
  p_height int default null
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
  insert into screenshots (worker_id, file_path, captured_at, file_size, width, height)
  values (v_id, p_file_path, coalesce(p_captured_at, now()), p_file_size, p_width, p_height);
end;
$$;

-- 4. Record an activity transition (active / idle_start / idle_end).
create or replace function public.log_activity(
  p_device_id text,
  p_event_type text,
  p_metadata jsonb default '{}'::jsonb
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
  insert into activity_logs (worker_id, event_type, metadata)
  values (v_id, p_event_type, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

-- 5. Clock in: create a time_log row and return its id.
create or replace function public.start_time_log(
  p_device_id text,
  p_clock_in timestamptz default now()
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_log uuid;
begin
  select id into v_id from workers where device_id = p_device_id;
  if v_id is null then
    raise exception 'device not registered';
  end if;
  insert into time_logs (worker_id, clock_in)
  values (v_id, coalesce(p_clock_in, now()))
  returning id into v_log;
  return v_log;
end;
$$;

-- 6. Clock out: close a time_log with active/idle totals.
create or replace function public.stop_time_log(
  p_time_log_id uuid,
  p_clock_out timestamptz default now(),
  p_active_seconds int default 0,
  p_idle_seconds int default 0
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update time_logs
     set clock_out = coalesce(p_clock_out, now()),
         total_active_seconds = coalesce(p_active_seconds, 0),
         total_idle_seconds = coalesce(p_idle_seconds, 0)
   where id = p_time_log_id;
end;
$$;

-- Only the public roles need EXECUTE; nothing else is granted to anon.
grant execute on function public.get_worker_id(text) to anon, authenticated;
grant execute on function public.get_or_register_worker(text, text, text) to anon, authenticated;
grant execute on function public.ingest_screenshot(text, text, timestamptz, int, int, int) to anon, authenticated;
grant execute on function public.log_activity(text, text, jsonb) to anon, authenticated;
grant execute on function public.start_time_log(text, timestamptz) to anon, authenticated;
grant execute on function public.stop_time_log(uuid, timestamptz, int, int) to anon, authenticated;

-- Storage: allow the agent (anon) to UPLOAD screenshot files, but not read them.
-- The bucket is private; reads happen admin-side via signed URLs.
drop policy if exists "agent can upload screenshots" on storage.objects;
create policy "agent can upload screenshots"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'screenshots');

-- Dashboard read access.
--
-- The dashboard authenticates an admin via Supabase Auth, then reads employee
-- monitoring data. The original migrations only granted reads to a JWT with a
-- custom role='admin' claim that was never issued, so standard authenticated
-- users (role='authenticated') could not read anything. These permissive
-- SELECT policies grant read access to any authenticated (logged-in) user.
--
-- ACCESS CONTROL: this treats "logged in" as "is an admin", so you must control
-- who can create accounts. In the Supabase dashboard, turn OFF public signups
-- (Authentication -> Providers -> Email -> "Allow new users to sign up") and
-- create admin accounts manually. The agent uses the anon key (NOT
-- authenticated), so it remains unable to read any of this data.

drop policy if exists "authenticated can read workers" on workers;
create policy "authenticated can read workers"
  on workers for select to authenticated using (true);

drop policy if exists "authenticated can read screenshots" on screenshots;
create policy "authenticated can read screenshots"
  on screenshots for select to authenticated using (true);

drop policy if exists "authenticated can read activity_logs" on activity_logs;
create policy "authenticated can read activity_logs"
  on activity_logs for select to authenticated using (true);

drop policy if exists "authenticated can read time_logs" on time_logs;
create policy "authenticated can read time_logs"
  on time_logs for select to authenticated using (true);

-- Allow authenticated admins to read screenshot files (for signed URLs).
drop policy if exists "authenticated can read screenshot files" on storage.objects;
create policy "authenticated can read screenshot files"
  on storage.objects for select to authenticated using (bucket_id = 'screenshots');

-- Add ON DELETE CASCADE foreign keys from the child tables to workers.
--
-- The live tables were created without these foreign keys, so deleting a worker
-- left their screenshots / activity / time-log rows behind as orphans. These
-- statements (re)create the constraints with ON DELETE CASCADE, so removing a
-- worker now cleanly removes all of their monitoring data.
--
-- Safe to run more than once: each constraint is dropped if present, then added.

alter table screenshots drop constraint if exists screenshots_worker_id_fkey;
alter table screenshots
  add constraint screenshots_worker_id_fkey
  foreign key (worker_id) references workers(id) on delete cascade;

alter table activity_logs drop constraint if exists activity_logs_worker_id_fkey;
alter table activity_logs
  add constraint activity_logs_worker_id_fkey
  foreign key (worker_id) references workers(id) on delete cascade;

alter table time_logs drop constraint if exists time_logs_worker_id_fkey;
alter table time_logs
  add constraint time_logs_worker_id_fkey
  foreign key (worker_id) references workers(id) on delete cascade;

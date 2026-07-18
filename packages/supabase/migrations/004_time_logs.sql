-- Time logs table: Clock in/out records
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  total_active_seconds INTEGER DEFAULT 0,
  total_idle_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_time_logs_worker_id ON time_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_clock_in ON time_logs(clock_in DESC);
CREATE INDEX IF NOT EXISTS idx_time_logs_worker_clock_in ON time_logs(worker_id, clock_in DESC);

-- Update timestamp trigger
CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE
  ON time_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
-- Admins can read all time logs
CREATE POLICY "Admins can read all time_logs"
  ON time_logs FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Workers can only insert their own time logs
CREATE POLICY "Workers can insert own time_logs"
  ON time_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE device_id = auth.jwt() ->> 'device_id'
    )
  );

-- Workers can update their own time_logs (for clock out)
CREATE POLICY "Workers can update own time_logs"
  ON time_logs FOR UPDATE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE device_id = auth.jwt() ->> 'device_id'
    )
  )
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE device_id = auth.jwt() ->> 'device_id'
    )
  );

-- Workers cannot read time_logs
CREATE POLICY "Workers cannot read time_logs"
  ON time_logs FOR SELECT
  TO authenticated
  USING (false);

-- Only admins can delete time_logs
CREATE POLICY "Admins can delete time_logs"
  ON time_logs FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

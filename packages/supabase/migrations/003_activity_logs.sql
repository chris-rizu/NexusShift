-- Activity logs table: Keyboard/mouse activity tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('active', 'idle_start', 'idle_end')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_worker_id ON activity_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_worker_timestamp ON activity_logs(worker_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);

-- RLS Policies
-- Admins can read all activity logs
CREATE POLICY "Admins can read all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Workers can only insert their own activity logs
CREATE POLICY "Workers can insert own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE device_id = auth.jwt() ->> 'device_id'
    )
  );

-- Workers cannot read activity logs
CREATE POLICY "Workers cannot read activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (false);

-- Only admins can delete activity logs
CREATE POLICY "Admins can delete activity logs"
  ON activity_logs FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

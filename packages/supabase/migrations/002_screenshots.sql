-- Screenshots table: Captured screen images
CREATE TABLE IF NOT EXISTS screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  file_size INTEGER,
  width INTEGER,
  height INTEGER
);

-- Enable RLS
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_screenshots_worker_id ON screenshots(worker_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_captured_at ON screenshots(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_screenshots_worker_captured ON screenshots(worker_id, captured_at DESC);

-- RLS Policies
-- Admins can read all screenshots
CREATE POLICY "Admins can read all screenshots"
  ON screenshots FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Workers can only insert their own screenshots
CREATE POLICY "Workers can insert own screenshots"
  ON screenshots FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE device_id = auth.jwt() ->> 'device_id'
    )
  );

-- Workers cannot read screenshots (stealth mode)
CREATE POLICY "Workers cannot read screenshots"
  ON screenshots FOR SELECT
  TO authenticated
  USING (false);

-- Only admins can delete screenshots
CREATE POLICY "Admins can delete screenshots"
  ON screenshots FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'service_role'
  );

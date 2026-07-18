-- Create admin users table for dashboard authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only authenticated admin users can read admin_users
CREATE POLICY "Admins can read admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Only service role can insert admin_users
CREATE POLICY "Service role can insert admin_users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Only service role can delete admin_users
CREATE POLICY "Service role can delete admin_users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to create admin user (call this with service role)
CREATE OR REPLACE FUNCTION create_admin_user(email TEXT, password TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    email,
    crypt(password, gen_salt('bf')),
    NOW(),
    '{"role": "admin"}',
    '{"provider": "email", "role": "admin"}',
    NOW(),
    NOW()
  )
  RETURNING id INTO user_id;

  -- Add to admin_users table
  INSERT INTO admin_users (id, email)
  VALUES (user_id, email);

  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

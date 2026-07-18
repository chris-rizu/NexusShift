# Supabase Setup Guide

This directory contains the Supabase database migrations and setup instructions for the Espionage system.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Navigate to your project's SQL Editor in the dashboard
3. Run each migration file in order (001 through 005)

## Quick Setup

### Step 1: Enable Required Extensions

Run this in your Supabase SQL Editor:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### Step 2: Run Migrations

Run each migration file in order:
1. `001_workers.sql`
2. `002_screenshots.sql`
3. `003_activity_logs.sql`
4. `004_time_logs.sql`
5. `005_admins.sql`

### Step 3: Create Storage Bucket

Navigate to **Storage** > **Create a new bucket**:
- Bucket name: `screenshots`
- Public bucket: **No** (uncheck)
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`

Then set up bucket RLS policies in the SQL Editor:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('screenshots', 'screenshots', false, 5242880, ARRAY['image/jpeg', 'image/png']);

-- Allow admins to read all screenshots
CREATE POLICY "Admins can read screenshots"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'screenshots' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role')
  );

-- Allow workers to upload screenshots
CREATE POLICY "Workers can upload screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'screenshots' AND
    auth.role() = 'authenticated'
  );

-- Only admins can delete screenshots
CREATE POLICY "Admins can delete screenshots"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'screenshots' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role')
  );
```

### Step 4: Create Admin User

Create an admin account by calling the function:

```sql
SELECT create_admin_user('admin@company.com', 'your-secure-password');
```

**⚠️ IMPORTANT:** Change the password immediately after first login!

### Step 5: Get API Keys

Navigate to **Project Settings** > **API** and copy:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 6: Configure Environment Variables

Create `.env` files:

**`packages/worker-agent/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SCREENSHOT_INTERVAL_MINUTES=5
IDLE_THRESHOLD_SECONDS=600
```

**`packages/admin-dashboard/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Worker Registration Flow

Workers are registered via their device ID:

1. Admin generates registration code in dashboard (manual for MVP)
2. Worker agent generates unique device ID on first launch
3. Agent registers with Supabase using device ID
4. Dashboard shows new worker

**Manual worker registration (for MVP):**

```sql
INSERT INTO workers (name, email, device_id)
VALUES ('John Doe', 'john@company.com', 'device-abc123');
```

## Realtime Setup

Enable realtime for worker status updates in Supabase:

1. Navigate to **Database** > **Replication**
2. Enable realtime for tables: `workers`, `screenshots`, `activity_logs`
3. Workers will subscribe to these tables for live updates

## Security Notes

- **Never** commit `SUPABASE_SERVICE_ROLE_KEY` to version control
- Use `.env` files and add to `.gitignore`
- Rotate service role keys periodically
- Enable MFA for Supabase admin accounts
- Review RLS policies before production

## Troubleshooting

### Permission Denied Errors

Check RLS policies in SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Storage Upload Failures

Verify bucket policies:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'screenshots';
```

### Realtime Not Working

Check replication status:
```sql
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

// Database setup script
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Values come from your .env (never hardcode the service-role key).
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your .env');
  process.exit(1);
}

// Use service role client for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  console.log('📡 Supabase URL:', supabaseUrl ? 'configured' : 'MISSING');
  console.log('🔑 Service Role Key:', supabaseKey ? 'configured' : 'MISSING');

  try {
    // Create Workers table
    console.log('\n📋 Creating workers table...');
    const { error: workersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS workers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          device_id TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_workers_device_id ON workers(device_id);
        CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
      `
    });

    if (workersError) {
      console.log('⚠️  Workers table creation returned error (might exist):', workersError.message);
    } else {
      console.log('✅ Workers table created successfully');
    }

    // Create Screenshots table
    console.log('📋 Creating screenshots table...');
    const { error: screenshotsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS screenshots (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          worker_id UUID NOT NULL,
          file_path TEXT NOT NULL,
          captured_at TIMESTAMPTZ DEFAULT NOW(),
          file_size INTEGER,
          width INTEGER,
          height INTEGER
        );

        CREATE INDEX IF NOT EXISTS idx_screenshots_worker_id ON screenshots(worker_id);
        CREATE INDEX IF NOT EXISTS idx_screenshots_captured_at ON screenshots(captured_at DESC);
      `
    });

    if (screenshotsError) {
      console.log('⚠️  Screenshots table creation returned error:', screenshotsError.message);
    } else {
      console.log('✅ Screenshots table created successfully');
    }

    // Create Activity Logs table
    console.log('📋 Creating activity_logs table...');
    const { error: activityError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          worker_id UUID NOT NULL,
          event_type TEXT NOT NULL CHECK (event_type IN ('active', 'idle_start', 'idle_end')),
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          metadata JSONB DEFAULT '{}'::jsonb
        );

        CREATE INDEX IF NOT EXISTS idx_activity_logs_worker_id ON activity_logs(worker_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
      `
    });

    if (activityError) {
      console.log('⚠️  Activity logs table creation returned error:', activityError.message);
    } else {
      console.log('✅ Activity logs table created successfully');
    }

    // Create Time Logs table
    console.log('📋 Creating time_logs table...');
    const { error: timeError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS time_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          worker_id UUID NOT NULL,
          clock_in TIMESTAMPTZ NOT NULL,
          clock_out TIMESTAMPTZ,
          total_active_seconds INTEGER DEFAULT 0,
          total_idle_seconds INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_time_logs_worker_id ON time_logs(worker_id);
        CREATE INDEX IF NOT EXISTS idx_time_logs_clock_in ON time_logs(clock_in DESC);
      `
    });

    if (timeError) {
      console.log('⚠️  Time logs table creation returned error:', timeError.message);
    } else {
      console.log('✅ Time logs table created successfully');
    }

    // Test the connection
    console.log('\n🧪 Testing database connection...');
    const { data, error } = await supabase.from('workers').select('*').limit(1);

    if (error) {
      console.log('❌ Database test failed:', error.message);
    } else {
      console.log('✅ Database connection successful!');
      console.log('📊 Current workers:', data.length === 0 ? 'No workers yet (expected)' : `${data.length} worker(s) found`);
    }

    console.log('\n🎉 Database setup complete!');
    console.log('🌐 You can now access your dashboard at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Alternative: Run SQL commands directly in Supabase SQL Editor');
    console.log('🔗 your Supabase project -> SQL Editor');
  }
}

// Alternative: Use raw SQL via PostgreSQL connection
async function setupDatabaseDirect() {
  console.log('🚀 Using direct SQL approach...');

  const tables = [
    {
      name: 'workers',
      sql: `CREATE TABLE IF NOT EXISTS workers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        device_id TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    },
    {
      name: 'screenshots',
      sql: `CREATE TABLE IF NOT EXISTS screenshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        worker_id UUID NOT NULL,
        file_path TEXT NOT NULL,
        captured_at TIMESTAMPTZ DEFAULT NOW(),
        file_size INTEGER,
        width INTEGER,
        height INTEGER
      )`
    },
    {
      name: 'activity_logs',
      sql: `CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        worker_id UUID NOT NULL,
        event_type TEXT NOT NULL CHECK (event_type IN ('active', 'idle_start', 'idle_end')),
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'::jsonb
      )`
    },
    {
      name: 'time_logs',
      sql: `CREATE TABLE IF NOT EXISTS time_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        worker_id UUID NOT NULL,
        clock_in TIMESTAMPTZ NOT NULL,
        clock_out TIMESTAMPTZ,
        total_active_seconds INTEGER DEFAULT 0,
        total_idle_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Creating ${table.name} table...`);

      // Try using direct SQL execution
      const { error } = await supabase.from(table.name).select('*').limit(0);

      if (error && error.code === '42P01') {
        // Table doesn't exist, we need to create it via SQL Editor
        console.log(`⚠️  ${table.name} table doesn't exist. Please create it manually in SQL Editor.`);
      } else if (error) {
        console.log(`⚠️  ${table.name} table error:`, error.message);
      } else {
        console.log(`✅ ${table.name} table exists and is accessible!`);
      }
    } catch (err) {
      console.log(`⚠️  ${table.name} check failed:`, err.message);
    }
  }
}

// Run the setup
console.log('🔧 Espionage Database Setup Script');
console.log('=====================================\n');

setupDatabaseDirect().then(() => {
  console.log('\n💡 If tables don\'t exist, please run these SQL commands in Supabase SQL Editor:');
  console.log('🔗 your Supabase project -> SQL Editor\n');

  console.log('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  console.log('CREATE TABLE IF NOT EXISTS workers (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name TEXT NOT NULL, email TEXT UNIQUE, device_id TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), is_active BOOLEAN DEFAULT TRUE, updated_at TIMESTAMPTZ DEFAULT NOW());');
  console.log('CREATE TABLE IF NOT EXISTS screenshots (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), worker_id UUID NOT NULL, file_path TEXT NOT NULL, captured_at TIMESTAMPTZ DEFAULT NOW(), file_size INTEGER, width INTEGER, height INTEGER);');
  console.log('CREATE TABLE IF NOT EXISTS activity_logs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), worker_id UUID NOT NULL, event_type TEXT NOT NULL CHECK (event_type IN (\'active\', \'idle_start\', \'idle_end\')), timestamp TIMESTAMPTZ DEFAULT NOW(), metadata JSONB DEFAULT \'{}\'::jsonb);');
  console.log('CREATE TABLE IF NOT EXISTS time_logs (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), worker_id UUID NOT NULL, clock_in TIMESTAMPTZ NOT NULL, clock_out TIMESTAMPTZ, total_active_seconds INTEGER DEFAULT 0, total_idle_seconds INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());');
});
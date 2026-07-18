// Load environment variables first
require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize Supabase from environment (see .env.example).
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('Supabase URL:', supabaseUrl ? 'configured' : 'MISSING');
console.log('Supabase Key:', supabaseKey ? 'configured' : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: 'Nexus Shift Admin Dashboard',
    version: '1.0.0'
  });
});

// Get all workers
app.get('/api/workers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch workers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get worker by ID
app.get('/api/workers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch worker:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create worker
app.post('/api/workers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to create worker:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update worker
app.put('/api/workers/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to update worker:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete worker
app.delete('/api/workers/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete worker:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get screenshots for worker
app.get('/api/workers/:id/screenshots', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('worker_id', req.params.id)
      .order('captured_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch screenshots:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get activity logs for worker
app.get('/api/workers/:id/activity', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('worker_id', req.params.id)
      .gte('timestamp', since)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get time logs for worker
app.get('/api/workers/:id/time-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('worker_id', req.params.id)
      .order('clock_in', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Failed to fetch time logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Nexus Shift Admin Dashboard v1.0                    ║
║              Workforce Management Platform                  ║
╠════════════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:${PORT}                     ║
║  📊 Environment: ${process.env.NODE_ENV || 'development'}              ║
║  🔗 Database: ${supabaseUrl ? '✓ Connected' : '✗ Not configured'}              ║
║  ⏰ Started: ${new Date().toLocaleTimeString()}                       ║
╚════════════════════════════════════════════════════════════════╝

  Dashboard: http://localhost:${PORT}
  API Health: http://localhost:${PORT}/api/health
  Workers API: http://localhost:${PORT}/api/workers
  `);
});

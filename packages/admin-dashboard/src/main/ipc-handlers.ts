import { ipcMain } from 'electron';
import { createClient } from '@supabase/supabase-js';
import type {
  Worker,
  Screenshot,
  ActivityLog,
  TimeLog,
} from '@espionage/shared';

/**
 * Create IPC handlers for renderer-main communication
 */
export function createIPCHandlers(): void {
  // Initialize Supabase client
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Authentication handlers
  ipcMain.handle('auth:sign-in', async (_, { email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });

  ipcMain.handle('auth:sign-up', async (_, { email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });

  ipcMain.handle('auth:sign-out', async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return true;
  });

  ipcMain.handle('auth:get-session', async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  });

  // Worker handlers
  ipcMain.handle('workers:get-all', async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as Worker[];
  });

  ipcMain.handle('workers:get-by-id', async (_, workerId: string) => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Worker;
  });

  ipcMain.handle('workers:create', async (_, workerData) => {
    const { data, error } = await supabase
      .from('workers')
      .insert(workerData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Worker;
  });

  ipcMain.handle('workers:update', async (_, workerId: string, updates) => {
    const { data, error } = await supabase
      .from('workers')
      .update(updates)
      .eq('id', workerId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Worker;
  });

  ipcMain.handle('workers:delete', async (_, workerId: string) => {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', workerId);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  });

  // Screenshot handlers
  ipcMain.handle('screenshots:get-by-worker', async (_, workerId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('screenshots')
      .select('*')
      .eq('worker_id', workerId)
      .order('captured_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as Screenshot[];
  });

  ipcMain.handle('screenshots:get-url', async (_, filePath: string) => {
    const { data, error } = await supabase.storage
      .from('screenshots')
      .createSignedUrl(filePath, 60); // 60 seconds expiry

    if (error) {
      throw new Error(error.message);
    }

    return data.signedUrl;
  });

  // Activity log handlers
  ipcMain.handle('activity-logs:get-by-worker', async (_, workerId: string, hours = 24) => {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('worker_id', workerId)
      .gte('timestamp', since)
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data as ActivityLog[];
  });

  // Time log handlers
  ipcMain.handle('time-logs:get-by-worker', async (_, workerId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('time_logs')
      .select('*')
      .eq('worker_id', workerId)
      .order('clock_in', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data as TimeLog[];
  });

  // Realtime subscription handlers
  ipcMain.handle('realtime:subscribe-workers', (event) => {
    const channel = supabase
      .channel('workers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workers',
        },
        (payload) => {
          event.sender.send('realtime:workers-update', payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'screenshots',
        },
        (payload) => {
          event.sender.send('realtime:screenshot-insert', payload);
        }
      )
      .subscribe();

    return channel.topic;
  });

  ipcMain.handle('realtime:unsubscribe', async (_, topic: string) => {
    await supabase.removeChannel(topic);
    return true;
  });

  console.log('IPC handlers registered');
}

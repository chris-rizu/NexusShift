import { createClient, SupabaseClient as SupabaseClientBase } from '@supabase/supabase-js';
import WebSocket from 'ws';
import {
  WorkerInsert,
  ScreenshotInsert,
  ActivityLogInsert,
  TimeLogInsert,
  Worker,
} from '@espionage/shared';
import { SUPABASE_CONFIG } from './config';

/**
 * Supabase Client for the Worker Agent.
 *
 * Uses ONLY the public (anon) key. All writes go through SECURITY DEFINER
 * database functions (see migration 006), so the agent can record its own
 * data without holding elevated credentials and without any read access to
 * other employees' data.
 */
export class SupabaseClient {
  private client: SupabaseClientBase | null = null;
  private deviceId: string;
  private enabled: boolean = false;

  constructor(deviceId: string) {
    this.deviceId = deviceId;

    const { url, anonKey } = SUPABASE_CONFIG;
    if (!url || !anonKey) {
      console.warn('Supabase not configured. Running in local-only mode; nothing will be uploaded.');
      return;
    }

    this.client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Electron's Node 18 has no native WebSocket; supabase-js needs one for
      // its realtime client even though this agent only uses RPC + storage.
      realtime: { transport: WebSocket as unknown as never },
    });
    this.enabled = true;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Look up this device's worker id (no registration). */
  async getWorkerIdByDeviceId(deviceId: string): Promise<string | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.rpc('get_worker_id', { p_device_id: deviceId });
    if (error) {
      console.error('get_worker_id failed:', error.message);
      return null;
    }
    return (data as string) ?? null;
  }

  /** Register this device on first run (idempotent); returns the worker id. */
  async registerWorker(workerData: WorkerInsert): Promise<Worker | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.rpc('get_or_register_worker', {
      p_device_id: workerData.device_id,
      p_name: workerData.name,
      p_email: workerData.email ?? null,
    });
    if (error || !data) {
      console.error('Failed to register worker:', error?.message);
      return null;
    }
    return { id: data as string } as Worker;
  }

  /** Upload a screenshot file to the private storage bucket. */
  async uploadScreenshot(storagePath: string, fileBuffer: Buffer, _fileSize: number): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.storage
      .from('screenshots')
      // Paths are unique (uuid + timestamp), so a plain insert is correct.
      // upsert:true would be treated as an UPDATE and rejected by the
      // insert-only storage policy the agent's public key is granted.
      .upload(storagePath, fileBuffer, { contentType: 'image/png', upsert: false });
    if (error) {
      throw new Error(`Failed to upload screenshot: ${error.message}`);
    }
  }

  /** Record a screenshot row via the ingest function. */
  async logScreenshot(screenshot: ScreenshotInsert & { label?: string }): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.rpc('ingest_screenshot', {
      p_device_id: this.deviceId,
      p_file_path: screenshot.file_path,
      p_captured_at: screenshot.captured_at,
      p_file_size: screenshot.file_size ?? null,
      p_width: screenshot.width ?? null,
      p_height: screenshot.height ?? null,
      p_label: screenshot.label ?? null,
    });
    if (error) {
      throw new Error(`Failed to log screenshot: ${error.message}`);
    }
  }

  /** Record an activity transition. */
  async logActivity(activity: ActivityLogInsert): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.rpc('log_activity', {
      p_device_id: this.deviceId,
      p_event_type: activity.event_type,
      p_metadata: activity.metadata ?? {},
    });
    if (error) {
      console.error('Failed to log activity:', error.message);
    }
  }

  /** Clock in; returns the new time_log id. */
  async createTimeLog(timeLog: TimeLogInsert): Promise<string> {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client.rpc('start_time_log', {
      p_device_id: this.deviceId,
      p_clock_in: timeLog.clock_in,
    });
    if (error || !data) {
      throw new Error(`Failed to create time log: ${error?.message}`);
    }
    return data as string;
  }

  /** Clock out; closes the time_log with active/idle totals. */
  async updateTimeLog(timeLogId: string, updates: Partial<TimeLogInsert>): Promise<void> {
    if (!this.client) return;
    const { error } = await this.client.rpc('stop_time_log', {
      p_time_log_id: timeLogId,
      p_clock_out: updates.clock_out ?? new Date().toISOString(),
      p_active_seconds: updates.total_active_seconds ?? 0,
      p_idle_seconds: updates.total_idle_seconds ?? 0,
    });
    if (error) {
      throw new Error(`Failed to update time log: ${error.message}`);
    }
  }

  /** Update worker status by logging an activity event. */
  async updateWorkerStatus(status: 'online' | 'idle' | 'offline'): Promise<void> {
    await this.logActivity({
      worker_id: '',
      event_type: status === 'idle' ? 'idle_start' : 'active',
      metadata: { status },
    });
  }

  async disconnect(): Promise<void> {
    if (!this.client) return;
    await this.client.removeAllChannels();
  }
}

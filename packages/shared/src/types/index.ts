/**
 * Database schema types matching Supabase tables
 */

// Worker table
export interface Worker {
  id: string;
  name: string;
  email: string | null;
  device_id: string;
  created_at: string;
  is_active: boolean;
}

export interface WorkerInsert {
  name: string;
  email?: string;
  device_id: string;
  is_active?: boolean;
}

// Screenshot table
export interface Screenshot {
  id: string;
  worker_id: string;
  file_path: string;
  captured_at: string;
  file_size: number | null;
  width: number | null;
  height: number | null;
}

export interface ScreenshotInsert {
  worker_id: string;
  file_path: string;
  captured_at: string;
  file_size?: number;
  width?: number;
  height?: number;
}

// Activity log types
export type ActivityEventType = 'active' | 'idle_start' | 'idle_end';

export interface ActivityLog {
  id: string;
  worker_id: string;
  event_type: ActivityEventType;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export interface ActivityLogInsert {
  worker_id: string;
  event_type: ActivityEventType;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

// Time log table
export interface TimeLog {
  id: string;
  worker_id: string;
  clock_in: string;
  clock_out: string | null;
  total_active_seconds: number;
  total_idle_seconds: number;
}

export interface TimeLogInsert {
  worker_id: string;
  clock_in: string;
  clock_out?: string;
  total_active_seconds?: number;
  total_idle_seconds?: number;
}

// Worker status for real-time updates
export type WorkerStatus = 'online' | 'idle' | 'offline' | 'active';

export interface WorkerStatusUpdate {
  worker_id: string;
  status: WorkerStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// App configuration
export interface AppConfig {
  screenshot_interval_minutes: number;
  idle_threshold_seconds: number;
  auto_start: boolean;
  max_screenshot_queue_size: number;
  upload_retry_attempts: number;
  upload_retry_delay_ms: number;
}

// Database row with Supabase metadata
export type DatabaseRow<T> = T & {
  id: string;
  created_at: string;
  updated_at?: string;
};

import { SupabaseClient } from './supabase-client';

/**
 * Time Logger
 * Tracks clock-in/clock-out times and session duration
 */

export interface TimeLoggerStatus {
  isRunning: boolean;
  clockInAt: Date | null;
  clockOutAt: Date | null;
  sessionActiveMs: number;
  totalActiveSeconds: number;
  totalIdleSeconds: number;
}

/** Provides real active/idle totals, e.g. from the ActivityTracker. */
export type ActivityStatsProvider = () => { totalActiveTimeMs: number; totalIdleTimeMs: number };

export class TimeLogger {
  private supabaseClient: SupabaseClient;
  private deviceId: string;
  private workerId: string | null = null;
  private clockInAt: Date | null = null;
  private clockOutAt: Date | null = null;
  private timeLogId: string | null = null;
  private isRunning: boolean = false;
  private activityStatsProvider: ActivityStatsProvider | null;

  constructor(
    supabaseClient: SupabaseClient,
    deviceId: string,
    activityStatsProvider: ActivityStatsProvider | null = null
  ) {
    this.supabaseClient = supabaseClient;
    this.deviceId = deviceId;
    this.activityStatsProvider = activityStatsProvider;
  }

  /**
   * Start time logging (clock in)
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Time logger already running');
      return;
    }

    console.log('Starting time logger (clock in)...');

    // Get worker ID
    this.workerId = await this.supabaseClient.getWorkerIdByDeviceId(this.deviceId);

    if (!this.workerId) {
      console.error('Worker ID not found for device:', this.deviceId);
      throw new Error('Device not registered');
    }

    // Clock in
    this.clockInAt = new Date();

    // Create time log entry
    this.timeLogId = await this.supabaseClient.createTimeLog({
      worker_id: this.workerId,
      clock_in: this.clockInAt.toISOString(),
      total_active_seconds: 0,
      total_idle_seconds: 0,
    });

    this.isRunning = true;
    console.log('Clocked in at:', this.clockInAt.toISOString());
  }

  /**
   * Stop time logging (clock out)
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Time logger not running');
      return;
    }

    console.log('Stopping time logger (clock out)...');

    // Clock out
    this.clockOutAt = new Date();

    // Calculate session stats
    const stats = this.getSessionStats();

    // Update time log
    if (this.timeLogId) {
      await this.supabaseClient.updateTimeLog(this.timeLogId, {
        clock_out: this.clockOutAt.toISOString(),
        total_active_seconds: Math.floor(stats.totalActiveSeconds),
        total_idle_seconds: Math.floor(stats.totalIdleSeconds),
      });
    }

    this.isRunning = false;
    console.log('Clocked out at:', this.clockOutAt.toISOString());
    console.log('Session duration:', stats.sessionDurationHuman);
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    sessionDurationMs: number;
    totalActiveSeconds: number;
    totalIdleSeconds: number;
    sessionDurationHuman: string;
  } {
    if (!this.clockInAt) {
      return {
        sessionDurationMs: 0,
        totalActiveSeconds: 0,
        totalIdleSeconds: 0,
        sessionDurationHuman: '0s',
      };
    }

    const endTime = this.clockOutAt || new Date();
    const sessionDurationMs = endTime.getTime() - this.clockInAt.getTime();
    const sessionDurationSeconds = Math.floor(sessionDurationMs / 1000);

    // Use real active/idle totals from the activity tracker when available;
    // otherwise fall back to attributing the whole session to active time.
    let totalActiveSeconds: number;
    let totalIdleSeconds: number;
    if (this.activityStatsProvider) {
      const { totalActiveTimeMs, totalIdleTimeMs } = this.activityStatsProvider();
      totalActiveSeconds = Math.floor(totalActiveTimeMs / 1000);
      totalIdleSeconds = Math.floor(totalIdleTimeMs / 1000);
    } else {
      totalActiveSeconds = sessionDurationSeconds;
      totalIdleSeconds = 0;
    }

    // Format duration
    const hours = Math.floor(sessionDurationSeconds / 3600);
    const minutes = Math.floor((sessionDurationSeconds % 3600) / 60);
    const seconds = sessionDurationSeconds % 60;

    let sessionDurationHuman = '';
    if (hours > 0) sessionDurationHuman += `${hours}h `;
    if (minutes > 0) sessionDurationHuman += `${minutes}m `;
    sessionDurationHuman += `${seconds}s`;

    return {
      sessionDurationMs,
      totalActiveSeconds,
      totalIdleSeconds,
      sessionDurationHuman: sessionDurationHuman.trim(),
    };
  }

  /**
   * Get current status
   */
  getStatus(): TimeLoggerStatus {
    const stats = this.getSessionStats();

    return {
      isRunning: this.isRunning,
      clockInAt: this.clockInAt,
      clockOutAt: this.clockOutAt,
      sessionActiveMs: stats.sessionDurationMs,
      totalActiveSeconds: stats.totalActiveSeconds,
      totalIdleSeconds: stats.totalIdleSeconds,
    };
  }
}

/**
 * Initialize time logger
 */
export function initializeTimeLogger(
  supabaseClient: SupabaseClient,
  deviceId: string,
  activityStatsProvider: ActivityStatsProvider | null = null
): TimeLogger {
  return new TimeLogger(supabaseClient, deviceId, activityStatsProvider);
}

import { EventEmitter } from 'events';
import { powerMonitor } from 'electron';
import { ACTIVITY_EVENT_TYPE_VALUES, WORKER_AGENT_DEFAULTS } from '@espionage/shared';

/**
 * Activity Tracker
 * Uses Electron's built-in powerMonitor to detect real keyboard/mouse idle time.
 * powerMonitor.getSystemIdleTime() returns the number of seconds the system has
 * been idle (no input) — this is real OS-level input detection, no native modules.
 */

export interface ActivityTrackerStatus {
  isActive: boolean;
  lastActivityAt: Date | null;
  idleTimeMs: number;
  totalActiveTimeMs: number;
  totalIdleTimeMs: number;
}

const CHECK_INTERVAL_MS = 5000;

export class ActivityTracker extends EventEmitter {
  private lastActivityAt: Date | null = null;
  private isActive: boolean = true;
  private idleCheckInterval: NodeJS.Timeout | null = null;
  private idleThresholdSeconds: number;
  private totalActiveTimeMs: number = 0;
  private totalIdleTimeMs: number = 0;
  private sessionStartTime: Date;
  private running: boolean = false;

  constructor(idleThresholdSeconds: number = WORKER_AGENT_DEFAULTS.IDLE_THRESHOLD_SECONDS) {
    super();
    this.idleThresholdSeconds = idleThresholdSeconds;
    this.sessionStartTime = new Date();
    this.lastActivityAt = new Date();
  }

  /**
   * Start tracking activity using the OS idle timer.
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    console.log('Activity tracker started (powerMonitor idle detection)');

    this.idleCheckInterval = setInterval(() => {
      this.checkIdleState();
    }, CHECK_INTERVAL_MS);
  }

  /**
   * Stop tracking activity
   */
  stop(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
    this.running = false;
    console.log('Activity tracker stopped');
  }

  /**
   * Poll the OS idle timer and emit activity-change events on transitions.
   */
  private checkIdleState(): void {
    // Real idle time from the operating system, in seconds.
    const idleSeconds = powerMonitor.getSystemIdleTime();
    const idleMs = idleSeconds * 1000;

    if (idleSeconds < this.idleThresholdSeconds) {
      // There has been input more recently than the threshold => active.
      this.lastActivityAt = new Date(Date.now() - idleMs);
      this.totalActiveTimeMs += CHECK_INTERVAL_MS;

      if (!this.isActive) {
        this.isActive = true;
        this.emit('activity-change', {
          type: ACTIVITY_EVENT_TYPE_VALUES.IDLE_END,
          timestamp: new Date(),
        });
      }
    } else {
      // Idle beyond the threshold.
      this.totalIdleTimeMs += CHECK_INTERVAL_MS;

      if (this.isActive) {
        this.isActive = false;
        this.emit('activity-change', {
          type: ACTIVITY_EVENT_TYPE_VALUES.IDLE_START,
          timestamp: new Date(),
          idleTimeMs: idleMs,
        });
      }
    }
  }

  /**
   * Get current status
   */
  getStatus(): ActivityTrackerStatus {
    const idleTimeMs = powerMonitor.getSystemIdleTime() * 1000;

    return {
      isActive: this.isActive,
      lastActivityAt: this.lastActivityAt,
      idleTimeMs,
      totalActiveTimeMs: this.totalActiveTimeMs,
      totalIdleTimeMs: this.totalIdleTimeMs,
    };
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    sessionDurationMs: number;
    totalActiveTimeMs: number;
    totalIdleTimeMs: number;
    activePercentage: number;
  } {
    const sessionDurationMs = Date.now() - this.sessionStartTime.getTime();
    const trackedMs = this.totalActiveTimeMs + this.totalIdleTimeMs;
    const activePercentage = trackedMs > 0
      ? (this.totalActiveTimeMs / trackedMs) * 100
      : 0;

    return {
      sessionDurationMs,
      totalActiveTimeMs: this.totalActiveTimeMs,
      totalIdleTimeMs: this.totalIdleTimeMs,
      activePercentage,
    };
  }
}

/**
 * Initialize activity tracker with configuration
 */
export function initializeActivityTracker(
  idleThresholdSeconds?: number
): ActivityTracker {
  return new ActivityTracker(idleThresholdSeconds);
}

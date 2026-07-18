import { desktopCapturer } from 'electron';
import { writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SCREENSHOT_SETTINGS, WORKER_AGENT_DEFAULTS } from '@espionage/shared';
import { SupabaseClient } from './supabase-client';
import { readFile } from 'node:fs/promises';

/**
 * Screen Capture Manager
 * Captures screenshots at intervals and uploads to Supabase
 */

export interface ScreenshotData {
  id: string;
  filePath: string;
  capturedAt: Date;
  fileSize: number;
  width: number;
  height: number;
  label: string; // e.g. "Monitor 1"
}

export interface ScreenCaptureStatus {
  isRunning: boolean;
  lastCaptureAt: Date | null;
  totalCaptures: number;
  uploadQueueSize: number;
  failedUploads: number;
}

export class ScreenCaptureManager {
  private captureInterval: NodeJS.Timeout | null = null;
  private intervalMs: number;
  private supabaseClient: SupabaseClient;
  private deviceId: string;
  private workerId: string | null = null;
  private isRunning: boolean = false;
  private lastCaptureAt: Date | null = null;
  private totalCaptures: number = 0;
  private uploadQueue: Array<ScreenshotData> = [];
  private maxQueueSize: number;
  private failedUploads: number = 0;
  private captureDir: string;

  constructor(
    supabaseClient: SupabaseClient,
    deviceId: string,
    intervalMs: number = WORKER_AGENT_DEFAULTS.SCREENSHOT_INTERVAL_MINUTES * 60 * 1000,
    maxQueueSize: number = WORKER_AGENT_DEFAULTS.MAX_SCREENSHOT_QUEUE_SIZE
  ) {
    this.supabaseClient = supabaseClient;
    this.deviceId = deviceId;
    this.intervalMs = intervalMs;
    this.maxQueueSize = maxQueueSize;
    this.captureDir = join(process.env.APPDATA || process.env.HOME || '', '.espionage', 'screenshots');
  }

  /**
   * Start capturing screenshots
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Screen capture already running');
      return;
    }

    console.log('Starting screen capture...');
    this.isRunning = true;

    // Ensure the local capture directory exists before writing to it.
    mkdirSync(this.captureDir, { recursive: true });

    // Get worker ID from Supabase
    this.workerId = await this.supabaseClient.getWorkerIdByDeviceId(this.deviceId);

    if (!this.workerId) {
      console.error('Worker ID not found for device:', this.deviceId);
      throw new Error('Device not registered');
    }

    // Capture immediately on start
    await this.captureAndUpload();

    // Set up interval
    this.captureInterval = setInterval(() => {
      this.captureAndUpload().catch(error => {
        console.error('Screenshot capture failed:', error);
      });
    }, this.intervalMs);

    console.log(`Screen capture started (interval: ${this.intervalMs}ms)`);
  }

  /**
   * Stop capturing screenshots
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping screen capture...');
    this.isRunning = false;

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    // Try to upload remaining queued screenshots
    await this.flushUploadQueue();

    console.log('Screen capture stopped');
  }

  /**
   * Capture screenshot and upload to Supabase
   */
  private async captureAndUpload(): Promise<void> {
    try {
      // Capture every connected monitor, not just the primary one — otherwise a
      // worker could evade monitoring by keeping activity on a second screen.
      const screenshots = await this.captureAllScreens();

      for (const screenshot of screenshots) {
        this.uploadQueue.push(screenshot);
        this.totalCaptures++;
        this.lastCaptureAt = screenshot.capturedAt;
      }

      if (screenshots.length > 0) {
        await this.processUploadQueue();
      }
    } catch (error) {
      console.error('Failed to capture screenshots:', error);
    }
  }

  /**
   * Capture one screenshot per connected monitor.
   */
  private async captureAllScreens(): Promise<ScreenshotData[]> {
    try {
      // One 'screen' source is returned per physical display.
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: SCREENSHOT_SETTINGS.MAX_WIDTH,
          height: SCREENSHOT_SETTINGS.MAX_HEIGHT,
        },
      });

      if (sources.length === 0) {
        console.warn('No screen sources found');
        return [];
      }

      const results: ScreenshotData[] = [];
      const capturedAt = new Date();

      sources.forEach((source, index) => {
        if (!source.thumbnail || source.thumbnail.isEmpty()) {
          console.warn(`No thumbnail for display ${index + 1}`);
          return;
        }

        const pngBuffer = source.thumbnail.toPNG();
        const screenshotId = randomUUID();
        const timestamp = Date.now();
        const fileName = `${screenshotId}-${timestamp}.png`;
        const filePath = join(this.captureDir, fileName);
        writeFileSync(filePath, pngBuffer);

        const size = source.thumbnail.getSize();
        results.push({
          id: screenshotId,
          filePath,
          capturedAt,
          fileSize: pngBuffer.length,
          width: size.width,
          height: size.height,
          label: `Monitor ${index + 1}`,
        });
      });

      return results;
    } catch (error) {
      console.error('Failed to capture screens:', error);
      return [];
    }
  }

  /**
   * Process upload queue
   */
  private async processUploadQueue(): Promise<void> {
    // Process a snapshot of the queue exactly once. Failed items are re-queued
    // for the NEXT interval — never retried inline, which would spin forever on
    // a persistent failure and block the caller.
    const batch = this.uploadQueue;
    this.uploadQueue = [];

    for (const screenshot of batch) {
      try {
        await this.uploadScreenshot(screenshot);
        // Clean up local file after successful upload
        try {
          unlinkSync(screenshot.filePath);
        } catch {
          // File may have already been deleted
        }
      } catch (error) {
        console.error('Failed to upload screenshot:', error);
        this.failedUploads++;

        // Re-queue for a later interval (bounded), not an inline retry.
        if (this.uploadQueue.length < this.maxQueueSize) {
          this.uploadQueue.push(screenshot);
        } else {
          console.warn('Upload queue full, dropping screenshot');
        }
      }
    }
  }

  /**
   * Upload screenshot to Supabase
   */
  private async uploadScreenshot(screenshot: ScreenshotData): Promise<void> {
    if (!this.workerId) {
      throw new Error('Worker ID not set');
    }

    // Read file
    const fileBuffer = await readFile(screenshot.filePath);

    // Upload to Supabase Storage
    const storagePath = `${this.workerId}/${screenshot.id}-${Date.now()}.png`;

    await this.supabaseClient.uploadScreenshot(
      storagePath,
      fileBuffer,
      screenshot.fileSize
    );

    // Log to database
    await this.supabaseClient.logScreenshot({
      worker_id: this.workerId,
      file_path: storagePath,
      captured_at: screenshot.capturedAt.toISOString(),
      file_size: screenshot.fileSize,
      width: screenshot.width,
      height: screenshot.height,
      label: screenshot.label,
    });

    console.log(`Screenshot uploaded (${screenshot.label}): ${storagePath}`);
  }

  /**
   * Flush upload queue
   */
  private async flushUploadQueue(): Promise<void> {
    console.log('Flushing upload queue...');
    await this.processUploadQueue();
  }

  /**
   * Get current status
   */
  getStatus(): ScreenCaptureStatus {
    return {
      isRunning: this.isRunning,
      lastCaptureAt: this.lastCaptureAt,
      totalCaptures: this.totalCaptures,
      uploadQueueSize: this.uploadQueue.length,
      failedUploads: this.failedUploads,
    };
  }
}

/**
 * Initialize screen capture manager
 */
export async function initializeScreenCapture(
  supabaseClient: SupabaseClient,
  deviceId: string,
  intervalMs?: number
): Promise<ScreenCaptureManager> {
  const manager = new ScreenCaptureManager(supabaseClient, deviceId, intervalMs);
  return manager;
}

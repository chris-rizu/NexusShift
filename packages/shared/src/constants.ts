/**
 * Application-wide constants
 */

// Worker Agent defaults
export const WORKER_AGENT_DEFAULTS = {
  SCREENSHOT_INTERVAL_MINUTES: 5,
  IDLE_THRESHOLD_SECONDS: 600, // 10 minutes
  AUTO_START: true,
  MAX_SCREENSHOT_QUEUE_SIZE: 100,
  UPLOAD_RETRY_ATTEMPTS: 3,
  UPLOAD_RETRY_DELAY_MS: 5000,
} as const;

// Admin Dashboard defaults
export const ADMIN_DASHBOARD_DEFAULTS = {
  WORKER_STATUS_REFRESH_INTERVAL_MS: 5000, // 5 seconds
  SCREENSHOT_GALLERY_LOAD_COUNT: 20,
  ACTIVITY_LOG_HOURS_TO_SHOW: 24,
} as const;

// Worker status states (constant values)
export const WORKER_STATUS_VALUES = {
  ONLINE: 'online',
  IDLE: 'idle',
  OFFLINE: 'offline',
  ACTIVE: 'active',
} as const;

// Activity event types (constant values)
export const ACTIVITY_EVENT_TYPE_VALUES = {
  ACTIVE: 'active',
  IDLE_START: 'idle_start',
  IDLE_END: 'idle_end',
} as const;

// Supabase table names
export const SUPABASE_TABLES = {
  WORKERS: 'workers',
  SCREENSHOTS: 'screenshots',
  ACTIVITY_LOGS: 'activity_logs',
  TIME_LOGS: 'time_logs',
} as const;

// Supabase storage
export const SUPABASE_STORAGE = {
  SCREENSHOTS_BUCKET: 'screenshots',
} as const;

// Realtime channels
export const REALTIME_CHANNELS = {
  WORKER_PREFIX: 'worker:',
  ALL_WORKERS: 'workers:all',
  STATUS_UPDATES: 'status_updates',
} as const;

// Screenshot settings
export const SCREENSHOT_SETTINGS = {
  QUALITY: 75, // JPEG quality (0-100)
  FORMAT: 'image/jpeg',
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
} as const;

// Error codes
export const ERROR_CODES = {
  AUTH_FAILED: 'AUTH_FAILED',
  DEVICE_NOT_REGISTERED: 'DEVICE_NOT_REGISTERED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  CAPTURE_FAILED: 'CAPTURE_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Time formats
export const TIME_FORMATS = {
  DISPLAY_DATE: 'MMM d, yyyy',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_DATETIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;

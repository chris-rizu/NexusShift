import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, powerMonitor } from 'electron';
import { join } from 'node:path';
import { initializeActivityTracker, ActivityTracker } from './activity-tracker';
import { initializeScreenCapture, ScreenCaptureManager } from './screen-capture';
import { initializeTimeLogger, TimeLogger } from './time-logger';
import { SupabaseClient } from './supabase-client';
import { WORKER_AGENT_DEFAULTS } from '@espionage/shared';
import Store from 'electron-store';

// Persistent store for configuration
const store = new Store<{
  deviceId: string;
  workerId?: string;
  consentGiven: boolean;
  config: {
    screenshotIntervalMinutes: number;
    idleThresholdSeconds: number;
    autoStart: boolean;
  };
}>({
  defaults: {
    deviceId: generateDeviceId(),
    consentGiven: false,
    config: {
      screenshotIntervalMinutes: WORKER_AGENT_DEFAULTS.SCREENSHOT_INTERVAL_MINUTES,
      idleThresholdSeconds: WORKER_AGENT_DEFAULTS.IDLE_THRESHOLD_SECONDS,
      autoStart: WORKER_AGENT_DEFAULTS.AUTO_START,
    },
  },
});

// Generate device ID if not exists
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `device-${timestamp}-${randomPart}`;
}

// Global managers
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let activityTracker: ActivityTracker | null = null;
let screenCaptureManager: ScreenCaptureManager | null = null;
let timeLogger: TimeLogger | null = null;
let supabaseClient: SupabaseClient | null = null;
let monitoring = false;

// Initialize services (does not start monitoring — that waits for consent).
async function initializeServices(): Promise<void> {
  const deviceId = store.get('deviceId') as string;

  supabaseClient = new SupabaseClient(deviceId);

  activityTracker = initializeActivityTracker(
    store.get('config.idleThresholdSeconds', WORKER_AGENT_DEFAULTS.IDLE_THRESHOLD_SECONDS)
  );

  screenCaptureManager = await initializeScreenCapture(
    supabaseClient,
    deviceId,
    store.get('config.screenshotIntervalMinutes', WORKER_AGENT_DEFAULTS.SCREENSHOT_INTERVAL_MINUTES) * 60 * 1000
  );

  timeLogger = initializeTimeLogger(supabaseClient, deviceId, () => {
    const s = activityTracker?.getStatus();
    return {
      totalActiveTimeMs: s?.totalActiveTimeMs ?? 0,
      totalIdleTimeMs: s?.totalIdleTimeMs ?? 0,
    };
  });

  // Persist activity transitions to the backend when one is configured.
  activityTracker.on('activity-change', (event: { type: string }) => {
    supabaseClient?.logActivity({
      worker_id: store.get('workerId') as string,
      event_type: event.type as 'active' | 'idle_start' | 'idle_end',
    }).catch((err) => console.error('Failed to log activity:', err));
  });

  console.log('Services initialized');
}

// Begin monitoring. Only called after the user has given consent.
async function startMonitoring(): Promise<void> {
  if (monitoring) return;
  try {
    activityTracker?.start();
    await timeLogger?.start();
    await screenCaptureManager?.start();
    monitoring = true;
    updateTrayMenu();
    console.log('Monitoring started');
  } catch (error) {
    console.error('Failed to start monitoring:', error);
  }
}

async function stopMonitoring(): Promise<void> {
  if (!monitoring) return;
  try {
    await screenCaptureManager?.stop();
    activityTracker?.stop();
    await timeLogger?.stop();
    monitoring = false;
    updateTrayMenu();
    console.log('Monitoring stopped');
  } catch (error) {
    console.error('Failed to stop monitoring:', error);
  }
}

// A small tray icon generated at runtime so we never depend on a missing file.
function buildTrayIcon(): Electron.NativeImage {
  // 16x16 solid dark-grey square (base64 PNG).
  const dataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAJklEQVR42mNgGAWjYBSMglEwCkbBKBgFo2AUjIJRMApGwSgAAAoAAAF8yQ5cAAAAAElFTkSuQmCC';
  return nativeImage.createFromDataURL(dataUrl);
}

function updateTrayMenu(): void {
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Workforce Monitor', enabled: false },
    { label: monitoring ? '● Monitoring active' : '○ Monitoring paused', enabled: false },
    { type: 'separator' },
    { label: 'Show Window', click: () => showWindow() },
    monitoring
      ? { label: 'Pause Monitoring', click: () => stopMonitoring() }
      : { label: 'Resume Monitoring', click: () => startMonitoring() },
    { type: 'separator' },
    { label: 'Quit', click: () => cleanupAndQuit() },
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip(monitoring ? 'Workforce Monitor — monitoring active' : 'Workforce Monitor — paused');
}

function createTray(): void {
  try {
    tray = new Tray(buildTrayIcon());
    updateTrayMenu();
    tray.on('double-click', () => showWindow());
  } catch (error) {
    console.error('Failed to create tray icon:', error);
    // Continue without a tray; the app still has a visible window.
  }
}

function showWindow(): void {
  if (!mainWindow) {
    createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

// Create the main window. Visible by design — the monitored user should be
// able to see the app is installed and running.
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 640,
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    title: 'Workforce Monitor',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
  if (!app.isPackaged && rendererUrl) {
    mainWindow.loadURL(rendererUrl);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Cleanup and quit
async function cleanupAndQuit(): Promise<void> {
  console.log('Cleaning up...');
  try {
    await stopMonitoring();
    await supabaseClient?.disconnect();
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
  app.exit(0);
}

// ---- IPC: the renderer (consent / status UI) talks to the main process here ----

function currentState() {
  return {
    consentGiven: store.get('consentGiven', false),
    registered: !!store.get('workerId'),
    deviceId: store.get('deviceId'),
    backendEnabled: supabaseClient?.isEnabled() ?? false,
    monitoring,
    config: store.get('config'),
  };
}

ipcMain.handle('get-state', () => currentState());

ipcMain.handle('get-status', () => ({
  activityTracker: activityTracker?.getStatus() ?? null,
  screenCapture: screenCaptureManager?.getStatus() ?? null,
  timeLogger: timeLogger?.getStatus() ?? null,
  monitoring,
}));

ipcMain.handle('get-config', () => store.get('config'));

ipcMain.handle('update-config', (_e, config: Record<string, unknown>) => {
  store.set('config', { ...store.get('config'), ...config });
  return store.get('config');
});

// The consent gate: monitoring cannot start until the user accepts here.
ipcMain.handle('give-consent', async (_e, workerData: { name: string; email?: string }) => {
  // Record consent and return immediately so the UI advances. Registration and
  // monitoring startup run in the background — network work must never block the
  // consent response (a failure there previously froze the UI on "Starting…").
  store.set('consentGiven', true);
  void (async () => {
    try {
      if (supabaseClient?.isEnabled() && !store.get('workerId')) {
        const worker = await supabaseClient.registerWorker({
          name: workerData.name,
          email: workerData.email,
          device_id: store.get('deviceId') as string,
        });
        if (worker?.id) store.set('workerId', worker.id);
      }
      await startMonitoring();
    } catch (error) {
      console.error('Post-consent startup failed:', error);
    }
  })();
  return currentState();
});

ipcMain.handle('revoke-consent', async () => {
  store.set('consentGiven', false);
  await stopMonitoring();
  return currentState();
});

// Pause / resume without changing consent (consent stays granted).
ipcMain.handle('pause-monitoring', async () => {
  await stopMonitoring();
  return currentState();
});

ipcMain.handle('resume-monitoring', async () => {
  if (store.get('consentGiven', false)) await startMonitoring();
  return currentState();
});

ipcMain.handle('quit-app', () => cleanupAndQuit());

// ---- App lifecycle ----

app.on('window-all-closed', () => {
  // Keep running in the tray so scheduled monitoring continues, except on macOS
  // where apps conventionally stay open until Cmd+Q anyway.
  if (!tray && process.platform !== 'darwin') {
    cleanupAndQuit();
  }
});

app.whenReady().then(async () => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.nexusshift.worker-agent');
  }

  // powerMonitor must be accessed after the app is ready.
  powerMonitor.on('suspend', () => stopMonitoring());
  powerMonitor.on('resume', () => {
    if (store.get('consentGiven', false)) startMonitoring();
  });

  await initializeServices();
  createTray();
  createMainWindow();

  // Auto-start monitoring only if the user has previously consented.
  if (store.get('consentGiven', false)) {
    await startMonitoring();
  }

  if (store.get('config.autoStart', WORKER_AGENT_DEFAULTS.AUTO_START)) {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: false,
      name: 'Workforce Monitor',
    });
  }

  console.log('Worker Agent started. Device ID:', store.get('deviceId'));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

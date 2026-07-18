import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose protected methods that allow the renderer process to use
 * IPC communication safely
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  authSignIn: (email: string, password: string) =>
    ipcRenderer.invoke('auth:sign-in', { email, password }),
  authSignUp: (email: string, password: string) =>
    ipcRenderer.invoke('auth:sign-up', { email, password }),
  authSignOut: () => ipcRenderer.invoke('auth:sign-out'),
  authGetSession: () => ipcRenderer.invoke('auth:get-session'),

  // Workers
  workersGetAll: () => ipcRenderer.invoke('workers:get-all'),
  workersGetById: (workerId: string) => ipcRenderer.invoke('workers:get-by-id', workerId),
  workersCreate: (workerData: unknown) => ipcRenderer.invoke('workers:create', workerData),
  workersUpdate: (workerId: string, updates: unknown) =>
    ipcRenderer.invoke('workers:update', workerId, updates),
  workersDelete: (workerId: string) => ipcRenderer.invoke('workers:delete', workerId),

  // Screenshots
  screenshotsGetByWorker: (workerId: string, limit?: number) =>
    ipcRenderer.invoke('screenshots:get-by-worker', workerId, limit),
  screenshotsGetUrl: (filePath: string) => ipcRenderer.invoke('screenshots:get-url', filePath),

  // Activity logs
  activityLogsGetByWorker: (workerId: string, hours?: number) =>
    ipcRenderer.invoke('activity-logs:get-by-worker', workerId, hours),

  // Time logs
  timeLogsGetByWorker: (workerId: string, limit?: number) =>
    ipcRenderer.invoke('time-logs:get-by-worker', workerId, limit),

  // Realtime
  realtimeSubscribeWorkers: () => ipcRenderer.invoke('realtime:subscribe-workers'),
  realtimeUnsubscribe: (topic: string) => ipcRenderer.invoke('realtime:unsubscribe', topic),

  // Event listeners
  onWorkersUpdate: (callback: (payload: unknown) => void) => {
    ipcRenderer.on('realtime:workers-update', (_, payload) => callback(payload));
  },
  onScreenshotInsert: (callback: (payload: unknown) => void) => {
    ipcRenderer.on('realtime:screenshot-insert', (_, payload) => callback(payload));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('realtime:workers-update');
    ipcRenderer.removeAllListeners('realtime:screenshot-insert');
  },

  // Platform info
  platform: process.platform,
  version: process.versions.electron,
});

// Types for the exposed API
export type ElectronAPI = {
  authSignIn: (email: string, password: string) => Promise<unknown>;
  authSignUp: (email: string, password: string) => Promise<unknown>;
  authSignOut: () => Promise<boolean>;
  authGetSession: () => Promise<unknown>;

  workersGetAll: () => Promise<unknown[]>;
  workersGetById: (workerId: string) => Promise<unknown>;
  workersCreate: (workerData: unknown) => Promise<unknown>;
  workersUpdate: (workerId: string, updates: unknown) => Promise<unknown>;
  workersDelete: (workerId: string) => Promise<boolean>;

  screenshotsGetByWorker: (workerId: string, limit?: number) => Promise<unknown[]>;
  screenshotsGetUrl: (filePath: string) => Promise<string>;

  activityLogsGetByWorker: (workerId: string, hours?: number) => Promise<unknown[]>;
  timeLogsGetByWorker: (workerId: string, limit?: number) => Promise<unknown[]>;

  realtimeSubscribeWorkers: () => Promise<string>;
  realtimeUnsubscribe: (topic: string) => Promise<boolean>;

  onWorkersUpdate: (callback: (payload: unknown) => void) => void;
  onScreenshotInsert: (callback: (payload: unknown) => void) => void;
  removeListeners: () => void;

  platform: string;
  version: string;
};

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

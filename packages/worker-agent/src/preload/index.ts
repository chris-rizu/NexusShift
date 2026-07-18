import { contextBridge, ipcRenderer } from 'electron';

/**
 * Expose a small, explicit API to the renderer. The renderer cannot access
 * Node or the full ipcRenderer — only these named channels.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  getState: () => ipcRenderer.invoke('get-state'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  getConfig: () => ipcRenderer.invoke('get-config'),
  updateConfig: (config: Record<string, unknown>) => ipcRenderer.invoke('update-config', config),
  giveConsent: (workerData: { name: string; email?: string }) =>
    ipcRenderer.invoke('give-consent', workerData),
  revokeConsent: () => ipcRenderer.invoke('revoke-consent'),
  pauseMonitoring: () => ipcRenderer.invoke('pause-monitoring'),
  resumeMonitoring: () => ipcRenderer.invoke('resume-monitoring'),
  quit: () => ipcRenderer.invoke('quit-app'),
  platform: process.platform,
  arch: process.arch,
});

export type AgentState = {
  consentGiven: boolean;
  registered: boolean;
  deviceId: string;
  backendEnabled: boolean;
  monitoring: boolean;
  config: {
    screenshotIntervalMinutes: number;
    idleThresholdSeconds: number;
    autoStart: boolean;
  };
};

export type ElectronAPI = {
  getState: () => Promise<AgentState>;
  getStatus: () => Promise<{
    activityTracker: unknown;
    screenCapture: unknown;
    timeLogger: unknown;
    monitoring: boolean;
  }>;
  getConfig: () => Promise<Record<string, unknown>>;
  updateConfig: (config: Record<string, unknown>) => Promise<Record<string, unknown>>;
  giveConsent: (workerData: { name: string; email?: string }) => Promise<AgentState>;
  revokeConsent: () => Promise<AgentState>;
  pauseMonitoring: () => Promise<AgentState>;
  resumeMonitoring: () => Promise<AgentState>;
  quit: () => Promise<void>;
  platform: string;
  arch: string;
};

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

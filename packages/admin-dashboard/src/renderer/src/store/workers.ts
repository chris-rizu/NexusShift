import { create } from 'zustand';
import type { Worker, WorkerStatus } from '@espionage/shared';

interface WorkersState {
  workers: Worker[];
  workerStatuses: Record<string, WorkerStatus>;
  isLoading: boolean;
  error: string | null;
  fetchWorkers: () => Promise<void>;
  updateWorkerStatus: (workerId: string, status: WorkerStatus) => void;
  setWorkers: (workers: Worker[]) => void;
}

export const useWorkersStore = create<WorkersState>((set, get) => ({
  workers: [],
  workerStatuses: {},
  isLoading: false,
  error: null,

  fetchWorkers: async () => {
    set({ isLoading: true, error: null });
    try {
      const workers = await window.electronAPI.workersGetAll();

      // Initialize statuses based on recent activity
      const statuses: Record<string, WorkerStatus> = {};
      workers.forEach((worker: Worker) => {
        statuses[worker.id] = worker.is_active ? 'online' : 'offline';
      });

      set({ workers, workerStatuses: statuses, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch workers',
        isLoading: false,
      });
    }
  },

  updateWorkerStatus: (workerId, status) => {
    set((state) => ({
      workerStatuses: {
        ...state.workerStatuses,
        [workerId]: status,
      },
    }));
  },

  setWorkers: (workers) => set({ workers }),
}));

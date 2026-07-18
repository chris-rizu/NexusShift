import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkerCard } from '../components/WorkerCard';
import { ScreenshotGallery } from '../components/ScreenshotGallery';
import { ActivityTimeline } from '../components/ActivityTimeline';
import type { Worker, Screenshot, ActivityLog, TimeLog } from '@espionage/shared';

export function WorkerDetailPage(): React.ReactElement {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkerData = async (): Promise<void> => {
      if (!workerId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Load worker details
        const workerData = await window.electronAPI.workersGetById(workerId);
        setWorker(workerData);

        // Load screenshots
        const screenshotsData = await window.electronAPI.screenshotsGetByWorker(workerId, 20);
        setScreenshots(screenshotsData);

        // Load activity logs
        const activityData = await window.electronAPI.activityLogsGetByWorker(workerId, 24);
        setActivityLogs(activityData);

        // Load time logs
        const timeLogData = await window.electronAPI.timeLogsGetByWorker(workerId, 10);
        setTimeLogs(timeLogData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load worker data');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkerData();
  }, [workerId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading worker details...</p>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <p className="text-red-600 mb-4">{error || 'Worker not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalTimeMs = timeLogs.reduce((acc, log) => {
    if (log.clock_out) {
      return acc + (new Date(log.clock_out).getTime() - new Date(log.clock_in).getTime());
    }
    return acc;
  }, 0);

  const totalActiveSeconds = timeLogs.reduce((acc, log) => acc + log.total_active_seconds, 0);
  const totalIdleSeconds = timeLogs.reduce((acc, log) => acc + log.total_idle_seconds, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-2xl">👁️</span>
              <span className="font-semibold text-gray-900">Espionage</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Worker Info Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{worker.name}</h1>
              <p className="text-gray-600">{worker.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Device ID: <code className="bg-gray-100 px-2 py-1 rounded">{worker.device_id}</code>
              </p>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                worker.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {worker.is_active ? 'Active' : 'Inactive'}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Registered: {new Date(worker.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{timeLogs.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Active Time</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(totalActiveSeconds / 3600)}h {Math.floor((totalActiveSeconds % 3600) / 60)}m
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Idle Time</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.floor(totalIdleSeconds / 3600)}h {Math.floor((totalIdleSeconds % 3600) / 60)}m
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Screenshots */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Screenshots</h2>
            <ScreenshotGallery screenshots={screenshots} workerId={workerId!} />
          </div>

          {/* Activity Timeline */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <ActivityTimeline activityLogs={activityLogs} />
          </div>
        </div>

        {/* Time Logs */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {timeLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-600">No sessions recorded yet</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clock Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Idle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(log.clock_in).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.clock_out ? new Date(log.clock_out).toLocaleString() : 'Active'}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        {Math.floor(log.total_active_seconds / 60)}m
                      </td>
                      <td className="px-6 py-4 text-sm text-yellow-600">
                        {Math.floor(log.total_idle_seconds / 60)}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

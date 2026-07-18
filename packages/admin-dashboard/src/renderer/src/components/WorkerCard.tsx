import React from 'react';
import type { Worker, WorkerStatus } from '@espionage/shared';

interface WorkerCardProps {
  worker: Worker;
  status: WorkerStatus;
  onClick: () => void;
}

export function WorkerCard({ worker, status, onClick }: WorkerCardProps): React.ReactElement {
  const getStatusColor = (status: WorkerStatus): string => {
    switch (status) {
      case 'online':
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: WorkerStatus): string => {
    switch (status) {
      case 'online':
      case 'active':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left group"
    >
      {/* Status Indicator */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition">
          <span className="text-2xl">👤</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
          <span className="text-sm text-gray-600">{getStatusText(status)}</span>
        </div>
      </div>

      {/* Worker Info */}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{worker.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{worker.email || 'No email'}</p>

      {/* Device Info */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
        <p className="font-mono truncate">{worker.device_id}</p>
      </div>

      {/* Registration Date */}
      <p className="text-xs text-gray-500 mt-4">
        Registered {new Date(worker.created_at).toLocaleDateString()}
      </p>
    </button>
  );
}

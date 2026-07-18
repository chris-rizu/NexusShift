import React from 'react';
import type { WorkerStatus } from '@espionage/shared';

interface StatusIndicatorProps {
  status: WorkerStatus;
  showLabel?: boolean;
}

export function StatusIndicator({ status, showLabel = true }: StatusIndicatorProps): React.ReactElement {
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

  const getStatusLabel = (status: WorkerStatus): string => {
    switch (status) {
      case 'online':
      case 'active':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'offline':
        return 'Offline';
    }
  };

  const getStatusPulse = (status: WorkerStatus): string => {
    switch (status) {
      case 'online':
      case 'active':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} ${getStatusPulse(status)}`} />
      {showLabel && (
        <span className="text-sm text-gray-600">{getStatusLabel(status)}</span>
      )}
    </div>
  );
}

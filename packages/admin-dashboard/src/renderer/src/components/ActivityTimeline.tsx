import React from 'react';
import type { ActivityLog } from '@espionage/shared';

interface ActivityTimelineProps {
  activityLogs: ActivityLog[];
}

export function ActivityTimeline({ activityLogs }: ActivityTimelineProps): React.ReactElement {
  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'active':
        return '🟢';
      case 'idle_start':
        return '💤';
      case 'idle_end':
        return '⏰';
      default:
        return '📝';
    }
  };

  const getEventColor = (eventType: string): string => {
    switch (eventType) {
      case 'active':
        return 'bg-green-500';
      case 'idle_start':
        return 'bg-yellow-500';
      case 'idle_end':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventLabel = (eventType: string): string => {
    switch (eventType) {
      case 'active':
        return 'Activity detected';
      case 'idle_start':
        return 'Started idle';
      case 'idle_end':
        return 'Resumed work';
      default:
        return 'Unknown event';
    }
  };

  return (
    <div>
      {activityLogs.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <span className="text-5xl mb-4 block">📊</span>
          <p className="text-gray-600">No activity recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {activityLogs.map((log, index) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  {/* Timeline Line */}
                  {index !== activityLogs.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  {/* Event Icon */}
                  <div className={`w-10 h-10 rounded-full ${getEventColor(log.event_type)} flex items-center justify-center text-white shrink-0`}>
                    {getEventIcon(log.event_type)}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{getEventLabel(log.event_type)}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

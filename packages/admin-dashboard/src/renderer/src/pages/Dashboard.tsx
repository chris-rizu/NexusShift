import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();

  // Mock data
  const [stats] = useState({
    totalWorkers: 24,
    activeWorkers: 18,
    idleWorkers: 4,
    alertsToday: 3,
  });

  const [workers] = useState([
    { id: '1', name: 'Sarah Chen', status: 'online', department: 'Engineering', shiftProgress: 85, thumbnail: '', lastActive: '2 min ago' },
    { id: '2', name: 'Michael Park', status: 'idle', department: 'Design', shiftProgress: 45, thumbnail: '', lastActive: '15 min ago' },
    { id: '3', name: 'Emma Wilson', status: 'online', department: 'Marketing', shiftProgress: 92, thumbnail: '', lastActive: '1 min ago' },
    { id: '4', name: 'James Rodriguez', status: 'alert', department: 'Engineering', shiftProgress: 30, thumbnail: '', lastActive: '5 min ago' },
    { id: '5', name: 'Lisa Anderson', status: 'online', department: 'Sales', shiftProgress: 78, thumbnail: '', lastActive: '3 min ago' },
    { id: '6', name: 'David Kim', status: 'offline', department: 'Support', shiftProgress: 0, thumbnail: '', lastActive: '2 hours ago' },
  ]);

  const [alerts] = useState([
    { id: '1', worker: 'James Rodriguez', type: 'Pre-shift activity', time: '8:47 AM', message: 'Screen change detected before shift' },
    { id: '2', worker: 'Michael Park', type: 'Excessive idle', time: '9:15 AM', message: 'Idle for 25 minutes' },
    { id: '3', worker: 'Sarah Chen', type: 'App blocked', time: '9:30 AM', message: 'Accessed restricted application' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'idle': return 'text-yellow-600';
      case 'alert': return 'text-red-600';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100';
      case 'idle': return 'bg-yellow-100';
      case 'alert': return 'bg-red-100';
      case 'offline': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-sm">Total Workers</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalWorkers}</div>
          <div className="text-xs text-gray-400 mt-1">+2 from last week</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-sm">Currently Active</span>
            <span className="text-2xl">🟢</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{stats.activeWorkers}</div>
          <div className="text-xs text-gray-400 mt-1">75% of workforce</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-sm">Total Idle</span>
            <span className="text-2xl">🟡</span>
          </div>
          <div className="text-3xl font-bold text-yellow-600">{stats.idleWorkers}</div>
          <div className="text-xs text-gray-400 mt-1">17% of workforce</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-sm">Alerts Today</span>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.alertsToday}</div>
          <div className="text-xs text-gray-400 mt-1">2 unresolved</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workers Grid */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Worker Status</h2>
              <button onClick={() => navigate('/export')} className="text-sm text-gray-600 hover:text-gray-900 transition">
                Export →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                  onClick={() => navigate(`/workers/${worker.id}`)}
                >
                  {/* Worker Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{worker.name}</h3>
                      <p className="text-xs text-gray-500">{worker.department}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBg(worker.status)} ${getStatusColor(worker.status)}`}>
                      {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="bg-gray-100 rounded-lg aspect-video mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Latest Screenshot</span>
                  </div>

                  {/* Shift Progress */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Shift Progress</span>
                      <span className="text-gray-600">{worker.shiftProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full">
                      <div
                        className={`h-1.5 rounded-full ${
                          worker.status === 'online' ? 'bg-green-600' : worker.status === 'alert' ? 'bg-red-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${worker.shiftProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Last Active */}
                  <div className="text-xs text-gray-400">
                    Last active: {worker.lastActive}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts Feed */}
        <div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
              <button onClick={() => navigate('/alerts')} className="text-sm text-gray-600 hover:text-gray-900 transition">
                View All →
              </button>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition cursor-pointer border border-gray-200"
                  onClick={() => navigate('/alerts')}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{alert.worker}</p>
                        <span className="text-xs text-gray-400">{alert.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{alert.type}</p>
                      <p className="text-xs text-gray-400">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/alerts')} className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-900 border border-gray-300 hover:bg-gray-100 transition rounded-lg">
              View All Alerts →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

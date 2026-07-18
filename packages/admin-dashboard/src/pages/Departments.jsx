import { useState } from 'react'

// Mock departments data
const mockDepartments = [
  { id: '1', name: 'Engineering', head: 'Sarah Chen', workers: 8, activeShifts: 6, avgProductivity: 92 },
  { id: '2', name: 'Design', head: 'Michael Park', workers: 5, activeShifts: 4, avgProductivity: 88 },
  { id: '3', name: 'Marketing', head: 'Emma Wilson', workers: 6, activeShifts: 5, avgProductivity: 90 },
  { id: '4', name: 'Sales', head: 'Lisa Anderson', workers: 4, activeShifts: 4, avgProductivity: 85 },
  { id: '5', name: 'Support', head: 'David Kim', workers: 3, activeShifts: 2, avgProductivity: 78 },
]

const mockDepartmentWorkers = {
  '1': ['Sarah Chen', 'James Rodriguez', 'Tom Hardy', 'Jane Smith', 'Mike Johnson', 'Emily Brown', 'Chris Lee', 'Alex Turner'],
  '2': ['Michael Park', 'Rachel Green', 'Sam Wilson', 'Taylor Swift', 'Jordan Smith'],
  '3': ['Emma Wilson', 'Lisa Anderson', 'Kate Moore', 'John Davis', 'Laura Wilson', 'Mark Taylor'],
  '4': ['Lisa Anderson', 'Paul Walker', 'Anna Bell', 'Steve Rogers'],
  '5': ['David Kim', 'Bruce Wayne', 'Clark Kent'],
}

function Departments() {
  const [departments] = useState([])
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProductivityColor = (score) => {
    if (score >= 90) return 'text-neutral-900'
    if (score >= 80) return 'text-neutral-600'
    return 'text-neutral-400'
  }

  const getProductivityBg = (score) => {
    if (score >= 90) return 'bg-neutral-100'
    if (score >= 80) return 'bg-neutral-200'
    return 'bg-neutral-300'
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Departments</h1>
          <p className="text-sm text-neutral-500">Manage organizational departments and their workforce</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
            + Add Department
          </button>
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-neutral-200 p-4">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white border border-neutral-200 p-6 hover:border-neutral-400 transition cursor-pointer"
            onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? null : dept.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-neutral-500">Head: {dept.head}</p>
              </div>
              <div className={`px-3 py-1 text-sm font-medium ${getProductivityBg(dept.avgProductivity)} ${getProductivityColor(dept.avgProductivity)}`}>
                {dept.avgProductivity}%
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">{dept.workers}</p>
                <p className="text-xs text-neutral-500">Workers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-900">{dept.activeShifts}</p>
                <p className="text-xs text-neutral-500">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neutral-600">{dept.workers - dept.activeShifts}</p>
                <p className="text-xs text-neutral-500">Offline</p>
              </div>
            </div>

            {/* Expandable Workers List */}
            {selectedDepartment === dept.id && (
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-sm font-medium text-neutral-900 mb-3">Team Members:</p>
                <div className="space-y-2">
                  {mockDepartmentWorkers[dept.id].map((worker, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                      <span className="text-neutral-900">▤</span>
                      <span>{worker}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Department Statistics */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Department Overview</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">{departments.length}</p>
            <p className="text-xs text-neutral-500">Total Departments</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">{departments.reduce((acc, d) => acc + d.workers, 0)}</p>
            <p className="text-xs text-neutral-500">Total Workers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">{departments.reduce((acc, d) => acc + d.activeShifts, 0)}</p>
            <p className="text-xs text-neutral-500">Currently Active</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-900">{departments.length ? Math.round(departments.reduce((acc, d) => acc + d.avgProductivity, 0) / departments.length) : 0}%</p>
            <p className="text-xs text-neutral-500">Avg Productivity</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-neutral-600">3</p>
            <p className="text-xs text-neutral-500">Need Attention</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Departments

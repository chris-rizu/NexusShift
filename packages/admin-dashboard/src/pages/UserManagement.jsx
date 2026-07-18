import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Users, Search, Download, Upload, Edit, Trash2, RefreshCw, X } from 'lucide-react'
import Modal from '../components/Modal'
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword, importUsers } from '../api'
import { searchUsers } from '../utils/search'

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@nexusshift.com',
    role: 'Administrator',
    department: 'Management',
    status: 'active',
    lastLogin: '2026-06-03T08:30:00',
    createdAt: '2024-01-15T09:00:00',
    permissions: ['full_access']
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah.manager@nexusshift.com',
    role: 'Manager',
    department: 'Engineering',
    status: 'active',
    lastLogin: '2026-06-03T09:15:00',
    createdAt: '2024-02-01T10:00:00',
    permissions: ['view_workers', 'manage_shifts', 'view_reports']
  },
  {
    id: '3',
    name: 'John Supervisor',
    email: 'john.supervisor@nexusshift.com',
    role: 'Supervisor',
    department: 'Sales',
    status: 'active',
    lastLogin: '2026-06-02T16:45:00',
    createdAt: '2024-03-10T14:00:00',
    permissions: ['view_workers', 'view_reports']
  },
  {
    id: '4',
    name: 'Emily HR',
    email: 'emily.hr@nexusshift.com',
    role: 'HR Manager',
    department: 'Human Resources',
    status: 'inactive',
    lastLogin: '2026-05-28T17:30:00',
    createdAt: '2024-01-20T11:00:00',
    permissions: ['view_workers', 'manage_users', 'view_reports']
  },
]

const roles = [
  { value: 'all', label: 'All Roles' },
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'HR Manager', label: 'HR Manager' },
  { value: 'Viewer', label: 'Viewer' },
]

const permissions = [
  'full_access',
  'view_workers',
  'manage_workers',
  'view_reports',
  'manage_shifts',
  'manage_users',
  'export_data',
  'configure_settings',
]

function UserManagement() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal states
  const [showAddUser, setShowAddUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    department: '',
    permissions: ['view_workers']
  })
  const [editingUser, setEditingUser] = useState(null)

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await getUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || searchUsers(searchTerm, users).some(u => u.id === user.id)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      toast.loading('Creating user...', { id: 'create' })
      const response = await createUser(newUser)
      if (response.success) {
        toast.success('User created successfully!', { id: 'create' })
        setShowAddUser(false)
        setNewUser({
          name: '',
          email: '',
          role: 'Viewer',
          department: '',
          permissions: ['view_workers']
        })
        loadUsers()
      } else {
        toast.error(response.error || 'Failed to create user', { id: 'create' })
      }
    } catch (error) {
      toast.error('Failed to create user', { id: 'create' })
      console.error('Create error:', error)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      toast.loading('Updating user...', { id: 'update' })
      const updates = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        department: editingUser.department,
        permissions: editingUser.permissions
      }
      const response = await updateUser(editingUser.id, updates)
      if (response.success) {
        toast.success('User updated successfully!', { id: 'update' })
        setShowEditUser(false)
        setEditingUser(null)
        loadUsers()
      } else {
        toast.error(response.error || 'Failed to update user', { id: 'update' })
      }
    } catch (error) {
      toast.error('Failed to update user', { id: 'update' })
      console.error('Update error:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      toast.loading('Deleting user...', { id: 'delete' })
      const response = await deleteUser(selectedUser.id)
      if (response.success) {
        toast.success('User deleted successfully!', { id: 'delete' })
        setShowDeleteConfirm(false)
        setSelectedUser(null)
        loadUsers()
      } else {
        toast.error(response.error || 'Failed to delete user', { id: 'delete' })
      }
    } catch (error) {
      toast.error('Failed to delete user', { id: 'delete' })
      console.error('Delete error:', error)
    }
  }

  const handleResetPassword = async (userId) => {
    try {
      toast.loading('Resetting password...', { id: 'reset' })
      const response = await resetUserPassword(userId)
      if (response.success) {
        toast.success(`Password reset! New password: ${response.data.tempPassword}`, { id: 'reset', duration: 10000 })
      } else {
        toast.error('Failed to reset password', { id: 'reset' })
      }
    } catch (error) {
      toast.error('Failed to reset password', { id: 'reset' })
      console.error('Reset error:', error)
    }
  }

  const togglePermission = (permission) => {
    if (showAddUser) {
      setNewUser(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }))
    } else if (editingUser) {
      setEditingUser(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }))
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'bg-neutral-900 text-white'
      case 'Manager': return 'bg-neutral-700 text-white'
      case 'Supervisor': return 'bg-neutral-500 text-white'
      case 'HR Manager': return 'bg-neutral-400 text-white'
      case 'Viewer': return 'bg-neutral-200 text-neutral-700'
      default: return 'bg-neutral-100 text-neutral-600'
    }
  }

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-neutral-100 dark:bg-green-900 text-neutral-900 dark:text-green-100' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">User Management</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Users
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="px-4 py-2 text-sm text-white bg-neutral-900 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">User Management</h1>
          <p className="text-sm text-neutral-500">Manage system users and their permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition">
            Import Users
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 p-4">
        <div className="flex items-center gap-4">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            {roles.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full bg-white border border-neutral-300 px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Users</span>
            <span className="text-2xl">▤</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{users.length}</div>
          <div className="text-xs text-neutral-400 mt-1">Registered users</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Active Now</span>
            <span className="text-2xl">●</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{users.filter(u => u.status === 'active').length}</div>
          <div className="text-xs text-neutral-400 mt-1">Currently logged in</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Administrators</span>
            <span className="text-2xl">▴</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">{users.filter(u => u.role === 'Administrator').length}</div>
          <div className="text-xs text-neutral-400 mt-1">Full access users</div>
        </div>

        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Pending Invites</span>
            <span className="text-2xl">✉</span>
          </div>
          <div className="text-3xl font-bold text-neutral-900">2</div>
          <div className="text-xs text-neutral-400 mt-1">Awaiting response</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Last Login</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-900 dark:bg-neutral-700 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{user.department}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(user)
                        setShowEditUser(true)
                      }}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                      title="Reset Password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDeleteConfirm(true)
                      }}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected User Details */}
      {selectedUser && (
        <div className="bg-white border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">User Details</h2>
            <button
              onClick={() => setSelectedUser(null)}
              className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
            >
              <span className="text-lg">×</span>
            </button>
          </div>

          {(() => {
            const user = users.find(u => u.id === selectedUser)
            if (!user) return null

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Name</p>
                    <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Email</p>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-neutral-900">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Department</p>
                    <p className="text-sm text-neutral-600">{user.department}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Last Login</p>
                    <p className="text-sm text-neutral-600">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Created</p>
                    <p className="text-sm text-neutral-600">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 mb-3">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {user.permissions.map((permission) => (
                        <span key={permission} className="px-2 py-1 text-xs bg-neutral-100 text-neutral-900">
                          {permission.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-neutral-200 max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Add New User</h2>
              <button
                onClick={() => setShowAddUser(false)}
                className="p-2 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition"
              >
                <span className="text-lg">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className="w-full border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
                <select className="w-full border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900">
                  <option>Select role...</option>
                  <option>Administrator</option>
                  <option>Manager</option>
                  <option>Supervisor</option>
                  <option>HR Manager</option>
                  <option>Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Department</label>
                <select className="w-full border border-neutral-300 px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900">
                  <option>Select department...</option>
                  <option>Management</option>
                  <option>Engineering</option>
                  <option>Sales</option>
                  <option>Human Resources</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button className="flex-1 px-4 py-2 text-sm text-white bg-neutral-900 hover:bg-neutral-700 transition">
                  Create User
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:bg-neutral-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role and Permissions Overview */}
      <div className="bg-white border border-neutral-200 p-5">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Role Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.slice(1).map((role) => {
            const userCount = users.filter(u => u.role === role.label).length
            return (
              <div key={role.value} className="p-4 bg-neutral-50 border border-neutral-200">
                <p className="text-sm font-medium text-neutral-900 mb-1">{role.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{userCount}</p>
                <p className="text-xs text-neutral-500">Users</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UserManagement

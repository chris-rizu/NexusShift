// Mock API for development
export const initializeMockData = () => {
  console.log('Mock data initialized')
}

export const getWorkers = async () => {
  return { success: true, data: [] }
}

export const getAlerts = async () => {
  return { success: true, data: [] }
}

export const updateWorker = async () => {
  return { success: true }
}

export const updateAlert = async () => {
  return { success: true }
}

export const resolveAlert = async () => {
  return { success: true }
}

export const bulkResolveAlerts = async () => {
  return { success: true }
}

export const contactWorker = async () => {
  return { success: true }
}

export const getSettings = async () => {
  return { success: true, data: {} }
}

export const updateSettings = async () => {
  return { success: true }
}

export const messageWorkers = async () => {
  return { success: true }
}

export const getUsers = async () => {
  return { success: true, data: [] }
}

export const createUser = async () => {
  return { success: true }
}

export const updateUser = async () => {
  return { success: true }
}

export const deleteUser = async () => {
  return { success: true }
}

export const resetUserPassword = async () => {
  return { success: true }
}

export const importUsers = async () => {
  return { success: true }
}

export const getDepartments = async () => {
  return { success: true, data: [] }
}

export const createDepartment = async () => {
  return { success: true }
}

export const updateDepartment = async () => {
  return { success: true }
}

export const deleteDepartment = async () => {
  return { success: true }
}


/**
 * Export utility functions for CSV and other file formats
 */

/**
 * Convert array of objects to CSV format
 */
function convertToCSV(data, headers) {
  if (!data || data.length === 0) return ''

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create header row
  const headerRow = csvHeaders.map(header =>
    `"${String(header).replace(/"/g, '""')}"`
  ).join(',')

  // Create data rows
  const dataRows = data.map(row =>
    csvHeaders.map(fieldName => {
      const value = row[fieldName]
      // Handle null, undefined, objects, and arrays
      if (value === null || value === undefined) return '""'
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Trigger browser download of a file
 */
function downloadFile(content, filename, mimeType = 'text/csv') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data, filename = 'export.csv', headers) {
  try {
    const csv = convertToCSV(data, headers)
    downloadFile(csv, filename, 'text/csv;charset=utf-8;')
    return { success: true }
  } catch (error) {
    console.error('Export to CSV failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data, filename = 'export.json') {
  try {
    const json = JSON.stringify(data, null, 2)
    downloadFile(json, filename, 'application/json;charset=utf-8;')
    return { success: true }
  } catch (error) {
    console.error('Export to JSON failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate timestamped filename
 */
export function generateFilename(baseName, extension = 'csv') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  return `${baseName}-${timestamp}.${extension}`
}

/**
 * Format data for specific export types
 */
export const exportFormatters = {
  workers: (worker) => ({
    'Name': worker.name,
    'Status': worker.status,
    'Department': worker.department,
    'Shift Progress': `${worker.shiftProgress}%`,
    'Last Active': worker.lastActive,
    'Email': worker.email || 'N/A',
    'Employee ID': worker.id
  }),

  alerts: (alert) => ({
    'Worker': alert.worker,
    'Type': alert.type,
    'Time': alert.time,
    'Date': alert.date || new Date().toLocaleDateString(),
    'Message': alert.message,
    'Status': alert.status || 'Active',
    'Severity': alert.severity || 'Medium'
  }),

  activities: (activity) => ({
    'Timestamp': activity.timestamp,
    'Worker': activity.worker,
    'Activity Type': activity.type,
    'Details': activity.details,
    'Duration': activity.duration || 'N/A',
    'Department': activity.department || 'N/A'
  }),

  shifts: (shift) => ({
    'Worker': shift.worker,
    'Date': shift.date,
    'Start Time': shift.startTime,
    'End Time': shift.endTime,
    'Break Duration': shift.breakDuration || '0 min',
    'Department': shift.department,
    'Status': shift.status || 'Scheduled'
  }),

  departments: (dept) => ({
    'Name': dept.name,
    'Manager': dept.manager || 'N/A',
    'Workers Count': dept.workersCount || 0,
    'Status': dept.status || 'Active',
    'Budget': dept.budget || 'N/A'
  }),

  screenshots: (screenshot) => ({
    'Worker': screenshot.worker,
    'Timestamp': screenshot.timestamp,
    'Activity': screenshot.activity || 'N/A',
    'File Name': screenshot.fileName || 'N/A',
    'File Size': screenshot.fileSize || 'N/A'
  }),

  timeline: (event) => ({
    'Date': event.date,
    'Time': event.time,
    'Event': event.event,
    'Worker': event.worker || 'N/A',
    'Duration': event.duration || 'N/A',
    'Notes': event.notes || ''
  })
}

/**
 * Bulk export with formatter
 */
export function exportWithType(data, type, filename) {
  const formatter = exportFormatters[type]
  if (!formatter) {
    return exportToCSV(data, filename)
  }

  const formattedData = data.map(formatter)
  return exportToCSV(formattedData, filename)
}

import { useState } from 'react'

/**
 * Search utility functions with debounce support
 */

/**
 * Debounce function to limit how often a function is called
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generic search function for filtering items
 */
export function searchItems(query, items, searchFields = [], threshold = 0.3) {
  if (!query || query.trim() === '') {
    return items
  }

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)

  return items.filter(item => {
    // If no search fields specified, search all string values
    const fieldsToSearch = searchFields.length > 0
      ? searchFields
      : Object.keys(item).filter(key => typeof item[key] === 'string')

    // Create searchable text from specified fields
    const searchableText = fieldsToSearch
      .map(field => String(item[field] || '').toLowerCase())
      .join(' ')

    // Check if all search terms match (AND logic)
    return searchTerms.every(term =>
      searchableText.includes(term) ||
      fuzzyMatch(searchableText, term, threshold)
    )
  })
}

/**
 * Simple fuzzy matching
 */
function fuzzyMatch(text, query, threshold = 0.3) {
  const queryLen = query.length
  const textLen = text.length
  let queryIdx = 0
  let textIdx = 0
  let matches = 0

  while (queryIdx < queryLen && textIdx < textLen) {
    if (query[queryIdx] === text[textIdx]) {
      queryIdx++
      matches++
    }
    textIdx++
  }

  const matchRatio = matches / queryLen
  return matchRatio >= (1 - threshold)
}

/**
 * Search workers specifically
 */
export function searchWorkers(query, workers) {
  return searchItems(query, workers, ['name', 'department', 'email', 'status'])
}

/**
 * Search alerts specifically
 */
export function searchAlerts(query, alerts) {
  return searchItems(query, alerts, ['worker', 'type', 'message', 'time'])
}

/**
 * Search screenshots specifically
 */
export function searchScreenshots(query, screenshots) {
  return searchItems(query, screenshots, ['worker', 'activity', 'timestamp'])
}

/**
 * Search activities specifically
 */
export function searchActivities(query, activities) {
  return searchItems(query, activities, ['worker', 'type', 'details', 'timestamp'])
}

/**
 * Search users specifically
 */
export function searchUsers(query, users) {
  return searchItems(query, users, ['name', 'email', 'role', 'department'])
}

/**
 * Search departments specifically
 */
export function searchDepartments(query, departments) {
  return searchItems(query, departments, ['name', 'manager', 'description'])
}

/**
 * Advanced filter with multiple criteria
 */
export function filterItems(items, filters = {}) {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      // Skip null/undefined filter values
      if (value === null || value === undefined || value === '') {
        return true
      }

      // Handle array values (OR logic for multi-select)
      if (Array.isArray(value)) {
        if (value.length === 0) return true
        return value.includes(item[key])
      }

      // Handle range objects
      if (typeof value === 'object' && 'min' in value || 'max' in value) {
        const itemValue = item[key]
        if ('min' in value && itemValue < value.min) return false
        if ('max' in value && itemValue > value.max) return false
        return true
      }

      // Handle exact match
      return item[key] === value
    })
  })
}

/**
 * Sort items by field
 */
export function sortItems(items, field = 'id', direction = 'asc') {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal === bVal) return 0

    // Handle null/undefined
    if (aVal == null) return direction === 'asc' ? 1 : -1
    if (bVal == null) return direction === 'asc' ? -1 : 1

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal
    }

    // Handle strings
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    const comparison = aStr.localeCompare(bStr)

    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Create a search hook for React components
 */
export function createSearchHook(searchFn) {
  return function useSearch(initialItems) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(initialItems)

    useEffect(() => {
      setResults(searchFn(query, initialItems))
    }, [query, initialItems])

    return { query, setQuery, results }
  }
}

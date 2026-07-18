/**
 * Workers API — backed by Supabase.
 *
 * Reads real workers registered by the monitoring agents. The UI expects a few
 * fields the base table doesn't have (status, department, shiftProgress,
 * lastActive); we derive/default those so existing pages render unchanged.
 */
import { formatDistanceToNow } from 'date-fns'
import { apiResponse } from './index'
import { supabase } from '../lib/supabase'

function mapWorker(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    device_id: row.device_id,
    status: row.is_active ? 'online' : 'offline',
    department: '—',
    shiftProgress: 0,
    thumbnail: '',
    lastActive: row.updated_at || row.created_at
      ? `${formatDistanceToNow(new Date(row.updated_at || row.created_at))} ago`
      : '—',
    createdAt: row.created_at,
  }
}

export async function getWorkers() {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return apiResponse(null, error.message)
    return apiResponse((data || []).map(mapWorker))
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

export async function getWorkerById(id) {
  try {
    const { data, error } = await supabase.from('workers').select('*').eq('id', id).single()
    if (error) return apiResponse(null, error.message)
    return apiResponse(mapWorker(data))
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

export async function deleteWorker(id) {
  try {
    const { error } = await supabase.from('workers').delete().eq('id', id)
    if (error) return apiResponse(null, error.message)
    return apiResponse({ message: 'Worker deleted' })
  } catch (error) {
    return apiResponse(null, error.message)
  }
}

// Agents self-register; manual create/update aren't part of this build.
export async function createWorker() {
  return apiResponse(null, 'Workers register automatically via the agent')
}
export async function updateWorker(id, updates) {
  try {
    const { data, error } = await supabase.from('workers').update(updates).eq('id', id).select().single()
    if (error) return apiResponse(null, error.message)
    return apiResponse(mapWorker(data))
  } catch (error) {
    return apiResponse(null, error.message)
  }
}
export async function updateWorkerStatus(id, isActive) {
  return updateWorker(id, { is_active: isActive })
}
export async function bulkUpdateWorkers() {
  return apiResponse(null, 'Not supported in this build')
}
export async function messageWorkers() {
  return apiResponse(null, 'Not supported in this build')
}

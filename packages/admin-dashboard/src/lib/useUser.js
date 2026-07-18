import { useEffect, useState } from 'react'
import { supabase } from './supabase'

/** Returns the current signed-in user's email (or '' while loading). */
export function useUserEmail() {
  const [email, setEmail] = useState('')
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''))
  }, [])
  return email
}

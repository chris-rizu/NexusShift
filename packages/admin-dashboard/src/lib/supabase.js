import { createClient } from '@supabase/supabase-js'

// Configure via environment variables: copy .env.example to .env (for local
// dev) or set these in your host's env settings (e.g. Vercel) for deployment.
//
// These are PUBLIC values — reads are gated by Supabase Auth + row-level
// security, so the anon key alone cannot read employee data.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co'
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(url, anonKey)

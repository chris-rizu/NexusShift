/**
 * Backend configuration for the worker agent.
 *
 * Values are injected at build time from a local `.env` file (git-ignored),
 * using electron-vite's MAIN_VITE_ prefix. Copy `.env.example` to `.env` and
 * fill in YOUR OWN Supabase project's URL and anon key.
 *
 * These are PUBLIC values and are safe to embed in the distributed app — the
 * anon key only grants the `anon` role, which can call the ingest functions but
 * cannot read any employee data. The service-role key is NOT used here and must
 * never ship in the app.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const SUPABASE_CONFIG = {
  url: env.MAIN_VITE_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: env.MAIN_VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
};

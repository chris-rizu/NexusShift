# NexusShift — Workforce Monitoring Platform

*日本語版は [README.ja.md](README.ja.md) をご覧ください.*

NexusShift is a transparent, consent-based workforce monitoring system. It has two parts:

- **Worker Agent** — an installable desktop app (Electron) that, *after the employee gives on-screen consent*, captures periodic screenshots of every monitor and tracks active/idle time.
- **Admin Dashboard** — a web app where administrators log in to view registered workers, screenshots, and activity.

Both talk to a **Supabase** backend (Postgres + Storage + Auth) that you host yourself.

> ⚠️ **Legal notice.** Monitoring people is regulated. Only deploy this with proper
> disclosure and consent, and in compliance with your local laws (wiretap/consent
> statutes, GDPR, employment law, etc.). The agent is deliberately transparent
> (visible window, consent screen, tray icon) — do not attempt to make it covert.

---

## Architecture

```
Worker Agent (Electron)                 Admin Dashboard (React)
   | public anon key                       | admin login (Supabase Auth)
   | writes via SECURITY DEFINER functions | reads via row-level security
   v                                        v
             Supabase (Postgres + Storage + Auth)
```

- The agent holds **only the public anon key** and writes through database
  functions — it can never read employee data. The **service-role key is never
  shipped in the agent.**
- The dashboard requires an **admin login**; row-level security blocks anonymous
  reads entirely.

---

## Prerequisites

- Node.js 18+ and npm 9+
- A free [Supabase](https://supabase.com) account
- (Windows agent builds) Windows 10/11

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/chris-rizu/NexusShift.git
cd NexusShift
npm install
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Save the database password.
2. Open **Project Settings → API** and copy:
   - **Project URL** (`https://YOUR_PROJECT_REF.supabase.co`)
   - **anon / public key**
   - **service_role key** (secret — used only for setup)

### 3. Create the storage bucket

In Supabase → **Storage** → **New bucket**, create a **private** bucket named
`screenshots`.

### 4. Run the database migrations

In Supabase → **SQL Editor**, run each file in `packages/supabase/migrations/`
**in order** (001 → 009). These create the tables, the secure ingest functions,
row-level-security policies, admin read access, cascade keys, and multi-monitor
labels.

### 5. Create your admin login

- Supabase → **Authentication → Users → Add user** → your email + a password,
  and check **Auto Confirm User**.
- Supabase → **Authentication → Providers → Email** → turn **OFF**
  "Allow new users to sign up" (so only accounts you create can log in).
- Add a login for each administrator the same way.

### 6. Configure environment variables

Copy each `.env.example` to `.env` and fill in your values:

```bash
cp packages/admin-dashboard/.env.example packages/admin-dashboard/.env
cp packages/worker-agent/.env.example    packages/worker-agent/.env
```

- `packages/admin-dashboard/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  (and `SUPABASE_SERVICE_ROLE_KEY` only if you run the optional admin scripts).
- `packages/worker-agent/.env` → `MAIN_VITE_SUPABASE_URL`, `MAIN_VITE_SUPABASE_ANON_KEY`.

`.env` files are git-ignored and never committed.

---

## Running the Admin Dashboard

```bash
cd packages/admin-dashboard
npm run dev        # local dev at http://localhost:3000
```

### Deploy (Vercel)

```bash
npm i -g vercel
vercel                     # first time: link/create the project
# In the Vercel project settings, add the two env vars:
#   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
vercel --prod              # deploy
```

Log in with the admin account you created. With no agents running yet, you'll see
empty states — that's expected.

---

## Building the Worker Agent

```bash
cd packages/worker-agent
npm run build              # compile
npm run dist:win           # produce the Windows installer in release/
```

The installer lands at `packages/worker-agent/release/NexusShift Agent Setup <version>.exe`.

When an employee runs it, they get a **consent screen**; monitoring starts only
after they accept, and they can pause or quit from the tray at any time. Every
monitor is captured and labeled (Monitor 1, Monitor 2, …).

### Code signing (recommended before distribution)

The installer is unsigned by default, so Windows SmartScreen warns other machines.
See [`packages/worker-agent/CODE-SIGNING.md`](packages/worker-agent/CODE-SIGNING.md)
for how to sign it with a certificate (Azure Trusted Signing / EV / OV) — the
pipeline is already wired up.

---

## Project structure

```
packages/
  worker-agent/       Electron monitoring agent (main/preload/renderer)
  admin-dashboard/    React admin dashboard (Vite)
  shared/             Shared TypeScript types & constants
  supabase/migrations/ SQL migrations (run these in order)
```

---

## Security notes

- The **service-role key must never be committed or shipped** in the agent. It is
  only used locally for one-time setup scripts.
- The agent uses the public anon key + write-only database functions. A holder of
  the public key can submit data but cannot read any employee data. A hardened
  deployment would issue per-device enrollment tokens (future work).
- The dashboard treats every authenticated user as an admin — keep public sign-ups
  disabled and create accounts manually.

## License

MIT

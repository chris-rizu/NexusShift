# Deployment Guide

This guide covers deploying the Espionage Remote Worker Monitoring System.

## Prerequisites

1. **Supabase Project**: Set up and configured with migrations
2. **Node.js 18+**: Installed on build machine
3. **Code Signing Certificates**: For production distribution (optional but recommended)

## Build Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# This will install all workspace dependencies automatically
```

### 2. Configure Environment Variables

Create `.env` files in both packages:

**`packages/worker-agent/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SCREENSHOT_INTERVAL_MINUTES=5
IDLE_THRESHOLD_SECONDS=600
```

**`packages/admin-dashboard/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build Applications

```bash
# Build Worker Agent
npm run build:worker

# Build Admin Dashboard
npm run build:admin

# Or build both
npm run build:all
```

### 4. Create Distributables

```bash
# Build for current platform
npm run dist:worker
npm run dist:admin

# Platform-specific
npm run dist:win    # Windows
npm run dist:mac    # macOS
```

Output files will be in `packages/*/out/` directory.

## Distribution

### Windows

The Windows installer will be created at:
```
packages/worker-agent/out/WorkerAgent Setup x.x.x.exe
packages/admin-dashboard/out/Espionage Setup x.x.x.exe
```

### macOS

The macOS disk image will be created at:
```
packages/worker-agent/out/WorkerAgent-x.x.x.dmg
packages/admin-dashboard/out/Espionage-x.x.x.dmg
```

## Worker Registration

### Option 1: Manual Registration (MVP)

1. Admin logs into dashboard
2. Admin creates worker entry manually
3. Admin provides device ID to employee
4. Employee installs worker agent
5. Agent auto-registers with device ID

### Option 2: Registration Code (Future Enhancement)

1. Admin generates registration code in dashboard
2. Employee enters code during installation
3. Agent registers automatically

## Installation

### Worker Agent

1. Download installer from admin
2. Run installer
3. Agent starts automatically
4. Agent runs in background (system tray only)

### Admin Dashboard

1. Download and install admin dashboard
2. Launch application
3. Log in with admin credentials
4. Start monitoring workers

## Code Signing (Production)

### Windows

1. Get code signing certificate from DigiCert, GlobalSign, etc.
2. Install certificate on build machine
3. Update `electron-builder.json`:
```json
{
  "win": {
    "certificateFile": "path/to/cert.p12",
    "certificatePassword": "password"
  }
}
```

### macOS

1. Get Apple Developer certificate
2. Update `electron-builder.json`:
```json
{
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)"
  }
}
```

## Auto-Update

### Setup (Future Enhancement)

Configure auto-update using `electron-updater`:

1. Set up update server (GitHub Releases, S3, etc.)
2. Configure `electron-builder` with publish settings
3. Add update checking to main process

## Security Considerations

### Before Production

1. **Rotate Keys**: Change all default Supabase keys
2. **Enable MFA**: Enable multi-factor authentication on Supabase
3. **Review RLS**: Verify Row Level Security policies
4. **Code Signing**: Sign all distributables
5. **Encrypt Storage**: Consider encrypting local screenshot queue
6. **Audit Logs**: Enable Supabase audit logging

### Data Privacy

1. **Consent**: Obtain written consent from employees
2. **Policy**: Create monitoring policy document
3. **Retention**: Set up data retention policies
4. **Access**: Limit admin access to authorized personnel
5. **Compliance**: Ensure compliance with local privacy laws

## Troubleshooting

### Build Failures

**Issue**: Module not found errors
```bash
# Solution: Clean and reinstall
npm run clean
npm install
```

**Issue**: Native module compilation errors
```bash
# Solution: Rebuild native modules
npm rebuild
```

### Runtime Issues

**Issue**: Screenshots not uploading
- Check Supabase credentials
- Verify network connectivity
- Check storage bucket permissions

**Issue**: Realtime updates not working
- Verify Supabase Realtime is enabled
- Check replication settings for tables
- Ensure worker is online

### Windows Specific

**Issue**: SmartScreen blocking installer
- Purchase code signing certificate
- Distribute via internal network initially

### macOS Specific

**Issue**: App won't open (unidentified developer)
- Right-click → Open
- Or disable Gatekeeper (not recommended)

## Support

For issues or questions:
- Check documentation in `/packages/supabase/README.md`
- Review Supabase logs in dashboard
- Check Electron console for errors

## Legal Notice

This tool is intended for authorized employee monitoring only. Ensure compliance with:
- Federal Wiretap Act (US)
- GDPR (EU)
- Privacy laws in your jurisdiction

Always obtain proper consent before deployment.

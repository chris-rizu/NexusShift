# Development Guide

This guide covers development workflows for the Espionage Remote Worker Monitoring System.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account (free tier works)

### Initial Setup

1. **Clone the repository** (if applicable)
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Run migrations from `packages/supabase/migrations/`
   - Create storage bucket named `screenshots`
   - Create admin user

4. **Set up environment variables**
   ```bash
   cp packages/worker-agent/.env.example packages/worker-agent/.env
   cp packages/admin-dashboard/.env.example packages/admin-dashboard/.env
   ```

   Edit `.env` files with your Supabase credentials.

## Development Workflow

### Run in Development Mode

```bash
# Worker Agent (Terminal 1)
npm run dev:worker

# Admin Dashboard (Terminal 2)
npm run dev:admin
```

This will:
- Start Electron with hot reload
- Enable DevTools
- Watch for file changes
- Provide better error messages

### Testing Changes

1. **Make changes** to source files
2. **Save** - Apps will auto-reload
3. **Test** in the running Electron window
4. **Debug** using DevTools (automatically opened in dev mode)

### Build for Production

```bash
# Build all packages
npm run build:all

# Or build individually
npm run build:worker
npm run build:admin
```

## Project Structure

```
espionage/
├── packages/
│   ├── shared/              # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/       # TypeScript interfaces
│   │   │   ├── constants.ts # App constants
│   │   │   ├── utils.ts     # Utility functions
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── worker-agent/        # Employee monitoring app
│   │   ├── src/
│   │   │   ├── main/        # Electron main process
│   │   │   ├── preload/     # Preload script
│   │   │   └── renderer/    # Minimal UI (HTML)
│   │   └── package.json
│   │
│   ├── admin-dashboard/     # Admin management app
│   │   ├── src/
│   │   │   ├── main/        # Electron main process
│   │   │   ├── preload/     # Preload script
│   │   │   └── renderer/    # React UI
│   │   │       ├── src/
│   │   │       │   ├── pages/      # Page components
│   │   │       │   ├── components/  # Reusable components
│   │   │       │   ├── store/      # Zustand stores
│   │   │       │   ├── App.tsx
│   │   │       │   └── main.tsx
│   │   │       └── index.html
│   │   └── package.json
│   │
│   └── supabase/            # Database setup
│       ├── migrations/       # SQL migration files
│       └── README.md
│
├── package.json             # Monorepo root
├── tsconfig.base.json       # Base TypeScript config
└── README.md
```

## Code Conventions

### TypeScript

- Use strict type checking
- Avoid `any` types
- Use interfaces for object shapes
- Use type aliases for unions/primitives
- Import from `@espionage/shared` for common types

### React

- Functional components with hooks
- TypeScript for props
- Zustand for state management
- Tailwind CSS for styling

### Electron

- Keep main process code separate
- Use preload scripts for safe IPC
- Context bridge for renderer communication

## Adding New Features

### 1. Add to Shared Types

If adding new database fields or shared types:

```typescript
// packages/shared/src/types/index.ts
export interface NewFeature {
  id: string;
  // ...
}
```

### 2. Update Worker Agent

Add to main process:
```typescript
// packages/worker-agent/src/main/new-feature.ts
export class NewFeatureManager {
  // ...
}
```

Wire it in `index.ts`:
```typescript
import { NewFeatureManager } from './new-feature';

const newFeature = new NewFeatureManager();
```

### 3. Update Admin Dashboard

Add IPC handler:
```typescript
// packages/admin-dashboard/src/main/ipc-handlers.ts
ipcMain.handle('new-feature:get', async () => {
  // ...
});
```

Add to preload:
```typescript
// packages/admin-dashboard/src/preload/index.ts
newFeatureGet: () => ipcRenderer.invoke('new-feature:get'),
```

Create React component:
```typescript
// packages/admin-dashboard/src/renderer/src/components/NewFeature.tsx
export function NewFeature() {
  // ...
}
```

## Debugging

### Worker Agent

1. Run in dev mode (auto-opens DevTools)
2. Check console for errors
3. View screenshots in Supabase storage
4. Check activity_logs table for events

### Admin Dashboard

1. Run in dev mode
2. React DevTools extension recommended
3. Check Supabase dashboard for realtime events
4. View network tab for API calls

### Common Issues

**Screenshots not uploading:**
- Check Supabase credentials
- Verify storage bucket exists
- Check RLS policies

**Realtime not working:**
- Enable Realtime for tables in Supabase
- Check replication settings
- Verify subscription in code

**Type errors:**
- Run `npm run build` to see all errors
- Check tsconfig paths are correct
- Ensure shared package is built first

## Testing

### Manual Testing Checklist

**Worker Agent:**
- [ ] App launches silently
- [ ] System tray icon appears
- [ ] Screenshots capture at interval
- [ ] Activity events logged
- [ ] Time logs created on start/stop
- [ ] Offline mode queues uploads

**Admin Dashboard:**
- [ ] Login/logout works
- [ ] Workers list displays
- [ ] Worker detail page loads
- [ ] Screenshots display correctly
- [ ] Activity timeline shows events
- [ ] Realtime updates work

### Unit Testing (Future)

Add test setup:
```bash
npm install --save-dev jest @testing-library/react
```

Create tests:
```typescript
// packages/shared/src/__tests__/utils.test.ts
import { formatDuration } from '../utils';

describe('formatDuration', () => {
  it('formats seconds correctly', () => {
    expect(formatDuration(90)).toBe('1m 30s');
  });
});
```

## Performance Optimization

### Worker Agent

1. **Screenshot compression**: Adjust quality in constants
2. **Upload queue**: Limit queue size to prevent memory issues
3. **Activity checks**: Throttle to avoid excessive DB writes
4. **Idle detection**: Balance responsiveness vs battery

### Admin Dashboard

1. **Image loading**: Lazy load screenshots
2. **Realtime**: Unsubscribe when not needed
3. **Pagination**: Limit query results
4. **Caching**: Cache worker statuses

## Contributing

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code restructuring
test: test changes
chore: build/config changes
```

### Pull Request Process

1. Create feature branch
2. Make changes and test
3. Update documentation
4. Submit PR with description

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://zustand-demo.pmnd.rs)

## Getting Help

- Check existing issues
- Review Supabase logs
- Enable verbose logging in development
- Check Electron DevTools console

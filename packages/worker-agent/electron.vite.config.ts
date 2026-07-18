import { resolve } from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

// Bundle the local workspace package and pure-JS dependencies from source
// rather than externalizing them, so:
//  1. the CommonJS output does not try to require() ESM at runtime, and
//  2. the packaged app is self-contained and needs no node_modules — which
//     avoids monorepo dependency-hoisting problems in electron-builder.
const bundled = ['@espionage/shared', '@supabase/supabase-js', 'electron-store'];
const sharedAlias = { '@espionage/shared': resolve(__dirname, '../shared/src') };

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: bundled })],
    resolve: {
      alias: sharedAlias,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['@espionage/shared'] })],
    resolve: {
      alias: sharedAlias,
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        ...sharedAlias,
      },
    },
    plugins: [react()],
  },
});

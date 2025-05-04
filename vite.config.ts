
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Handle both development and "build:dev" modes
  const isDev = mode === 'development' || process.env.npm_lifecycle_event === 'build:dev';
  
  return {
    plugins: [
      react(),
      isDev && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 8080
    },
    build: {
      sourcemap: true,
      outDir: 'dist',
      // Use development mode when running build:dev
      minify: isDev ? false : true,
      rollupOptions: {
        // Add any development-specific Rollup options here
      }
    }
  };
});

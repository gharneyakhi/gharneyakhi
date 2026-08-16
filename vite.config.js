import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Only these public Supabase values are exposed to browser code.
  envPrefix: ['VITE_', 'SUPABASE_'],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});

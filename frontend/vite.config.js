import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// El proxy mantiene las cookies de sesión en el mismo origen durante el desarrollo.
export default defineConfig({
  plugins: [react()],
  test: { include: ['tests/*.test.js'] },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { '/api': { target: 'http://127.0.0.1:8081', changeOrigin: true } },
  },
});

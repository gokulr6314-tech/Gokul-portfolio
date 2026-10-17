import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const rawBase = process.env.BASE_PATH;
  const safeBase = rawBase && !rawBase.includes('<') && !rawBase.includes('>') ? rawBase : './';
  return {
    base: safeBase,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      allowedHosts: ['.onrender.com', 'gokul-portfolio-9tjo.onrender.com', 'localhost'],
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      host: '0.0.0.0',
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      allowedHosts: ['.onrender.com', 'gokul-portfolio-9tjo.onrender.com', 'localhost'],
    },
  };
});

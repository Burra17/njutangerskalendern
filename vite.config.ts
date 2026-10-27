/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Google-nyckeln är begränsad till localhost:5173, så porten får inte flytta sig om den är upptagen.
    port: 5173,
    strictPort: true,
  },
  test: {
    // Testerna gäller ren logik. jsdom läggs till av den ticket som först testar en komponent.
    environment: 'node',
  },
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // This will magically provide 'global', 'Buffer', and other Node variables to the browser
      include: ['buffer', 'process', 'util', 'stream'],
      globals: {
        global: true,
        Buffer: true,
        process: true,
      },
    }),
  ],
})
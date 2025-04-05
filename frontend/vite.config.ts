import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: "127.0.0.1",
        port: 5005,
        strictPort: true,
    },
    build: {
        outDir: "../app/dist",
        assetsDir: "static",
        manifest: "manifest.json",
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom"],
                    mui: ["@mui/material", "@mui/icons-material"],
                    router: ["react-router-dom"]
                }
            }
        }
    }
})
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
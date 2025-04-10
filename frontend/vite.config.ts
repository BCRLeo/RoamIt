import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, path.resolve(__dirname, ".."), "");

    return {
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
        },
        define: {
            'process.env.GOOGLE_API_KEY': JSON.stringify(env.GOOGLE_API_KEY),
        },
    };
})
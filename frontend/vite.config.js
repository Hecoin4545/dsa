import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const LOCAL = env.VITE_LOCAL || 'http://localhost:5173/';
    const API_URL = env.VITE_API_URL || 'http://localhost:4000';

    return {
        plugins: [react()],
        server: {
            host: new URL(LOCAL).hostname,
            port: parseInt(new URL(LOCAL).port) || 5173,
            proxy: {
                '/api': {
                    target: API_URL,
                    changeOrigin: true,
                },
            },
        },
    };
});


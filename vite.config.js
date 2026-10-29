import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [
            react(),
            federation({
                name: 'remote',
                filename: 'remoteEntry.js',
                exposes: {
                    './Catalog': './src/Catalog.jsx',
                },
                // Shared design system + stores from the host
                remotes: {
                    host: {
                        type: 'module',
                        name: 'host',
                        entry: env.VITE_HOST_ENTRY,
                    },
                },
                shared: {
                    react: { singleton: true },
                    'react-dom/': { singleton: true },
                },
                dts: false,
            }),
        ],
        optimizeDeps: {
            exclude: ['host/ui'],
        },
        server: {
            port: 5174,
        },
    };
});

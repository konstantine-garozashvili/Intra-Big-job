import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@ui': path.resolve(__dirname, './src/components/ui'),
            '@features': path.resolve(__dirname, './src/features'),
            '@services': path.resolve(__dirname, './src/lib/services'),
            '@utils': path.resolve(__dirname, './src/lib/utils'),
            '@hooks': path.resolve(__dirname, './src/lib/hooks'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@assets': path.resolve(__dirname, './src/assets'),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        watch: {
            usePolling: true,
            interval: 1000
        },
        hmr: {
            clientPort: 5173,
            overlay: true
        },
        proxy: {
            '/api': {
                target: 'http://nginx:80',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('Erreur de proxy:', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Requête proxy:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Réponse proxy:', proxyRes.statusCode, req.url);
                    });
                }
            },
            '/api-adresse': {
                target: 'https://api-adresse.data.gouv.fr',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api-adresse/, ''),
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('Erreur du proxy:', err);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Réponse proxy:', proxyRes.statusCode, req.url);
                    });
                    proxy.on('proxyReq', (proxyReq, _req, _res) => {
                        proxyReq.removeHeader('origin');
                        proxyReq.removeHeader('referer');
                    });
                }
            }
        }
    }
})

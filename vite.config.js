import { defineConfig } from 'vite'

export default defineConfig(
    {
        main: './src/main.js',
        build: {
            minify: true,
            manifest: true,
            rollupOptions: {
                input: './src/main.js',
                output: {
                    format: 'umd',
                    entryFileNames: 'main.js',
                    esModule: false,
                    compact: true,
                },
            },
        },
        server: {
            cors: true,
            allowedHosts: true
        }
    }
)

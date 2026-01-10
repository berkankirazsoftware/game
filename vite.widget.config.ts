import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
    plugins: [
        react(),
        cssInjectedByJsPlugin(), // Injects CSS into the JS bundle
    ],
    build: {
        outDir: 'dist-widget',
        lib: {
            entry: 'src/widget.tsx',
            name: 'Booste',
            fileName: (format) => `widget.js`,
            formats: ['umd']
        },
        rollupOptions: {
            // Make sure external deps like React are bundled if we want it truly standalone, 
            // OR exclude them if we expect the host to provide them. 
            // For a simple widget, bundling React is safer but increases size.
            // Let's bundle everything for "ease of integration".
            external: [],
        },
        // Minify for production
        minify: 'esbuild'
    },
    define: {
        'process.env.NODE_ENV': '"production"'
    }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
    plugins: [
        react(),
        cssInjectedByJsPlugin({
            // Inject CSS into shadow DOM to avoid conflicts
            styleId: 'booste-widget-styles',
            topExecutionPriority: false,
        }),
    ],
    build: {
        outDir: 'dist-widget',
        lib: {
            entry: 'src/widget.tsx',
            name: 'BoosteWidget',
            fileName: () => 'widget.js',
            formats: ['iife'] // IIFE format for better isolation
        },
        rollupOptions: {
            // Bundle everything for standalone widget
            external: [],
            output: {
                // Ensure all assets are inlined
                inlineDynamicImports: true,
                // Use a safe global variable name
                name: 'BoosteWidget',
                // Avoid conflicts with existing libraries
                extend: false,
            }
        },
        // Minify for production
        minify: 'esbuild',
        // Ensure sourcemaps are not included in production
        sourcemap: false,
        // Target modern browsers to reduce bundle size
        target: 'es2015',
        // Optimize chunk size
        chunkSizeWarningLimit: 1000,
    },
    define: {
        'process.env.NODE_ENV': '"production"',
        // Prevent any global pollution
        'global': 'window',
    }
});

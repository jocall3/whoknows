
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      define: {
        // The API key is injected into the app during the build process.
        // It's crucial that this variable is set in your deployment environment.
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        // Disable CORS to mitigate vulnerability where malicious sites can request source files.
        cors: false,
      },
      build: {
        outDir: 'web', // Emit assets to a 'web' directory.
        sourcemap: true, // Enable source maps for easier debugging in production.
        rollupOptions: {
          output: {
            // Improve caching by splitting vendor code into separate chunks.
            manualChunks(id) {
              if (id.includes('node_modules')) {
                return id.toString().split('node_modules/')[1].split('/')[0].toString();
              }
            }
          }
        }
      }
    };
});

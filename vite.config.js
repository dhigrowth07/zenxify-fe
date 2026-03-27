import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path"
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  console.log('env: ', env);
  console.log(`APP RUNNING ENVIRONMENT : ${mode}
 RUNNING PORT: ${env.VITE_PORT}
  `);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      historyApiFallback: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          // Remove console logs in production
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  };
});

import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log('env: ', env);
  console.log(`APP RUNNING ENVIRONMENT : ${mode}
 RUNNING PORT: ${env.VITE_PORT}
  `);

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.VITE_PORT) || 5173,
    },
  };
});

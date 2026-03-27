console.log('Vite Env Check:', import.meta.env);

export const API_URL = import.meta.env.VITE_API_URL;
export const PORT = import.meta.env.VITE_PORT;

if (!API_URL) {
  console.warn('⚠️ VITE_API_URL is undefined! API calls will default to current origin.');
}

export const config = () => {
  if (!import.meta.env.VITE_API_URL || !import.meta.env.VITE_PORT) {
    console.error('Environment variables missing in .env');
  }
};

config();

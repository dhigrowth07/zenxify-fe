export const API_URL =
  import.meta.env.MODE === 'development'
    ? `http://localhost:${import.meta.env.VITE_PORT}`
    : import.meta.env.VITE_API_URL;
export const PORT = import.meta.env.VITE_PORT;

export const config = () => {
  if (!import.meta.env.VITE_API_URL || !import.meta.env.VITE_PORT) {
    throw new Error(
      'Missing environment variables. Please check your .env file.'
    );
  }
};

config();

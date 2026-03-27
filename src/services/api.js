import axios from "axios";
import { API_URL } from "../config/envConfig";

console.log('Initializing API with baseURL:', API_URL);

const api = axios.create({
  baseURL: API_URL || 'http://localhost:3000',
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
  withCredentials: true,
});

let _store = null;
export const injectStore = (store) => {
  _store = store;
};

api.interceptors.request.use(
  (config) => {
    const token = _store?.getState()?.auth?.accessToken;

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const is401 = error.response?.status === 401;
    const isAuthEndpoint =
      originalRequest.url?.includes("/api/auth/refresh") ||
      originalRequest.url?.includes("/api/auth/logout") ||
      originalRequest.url?.includes("/api/auth/login");

    if (is401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = _store?.getState()?.auth?.refreshToken;

        const body = refreshToken ? { refresh_token: refreshToken } : {};

        const { data: responseBody } = await api.post(`/api/auth/refresh`, body);

        const { access_token, refresh_token: newRefreshToken } =
          responseBody.data;

        const { setTokens } = await import("../redux/auth/authSlice");
        _store.dispatch(setTokens({ accessToken: access_token, refreshToken: newRefreshToken }));

        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        processQueue(null, access_token);

        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        const { logout } = await import("../redux/auth/authSlice");
        _store?.dispatch(logout());

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;


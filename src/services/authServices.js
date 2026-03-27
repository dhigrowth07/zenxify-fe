import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";

export const registerUser = async (payload) => {
    try {
        const response = await api.post("/api/auth/register", {
            full_name: payload.full_name,
            email: payload.email,
            password: payload.password,
            tos_accepted: payload.tos_accepted,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const verifyEmail = async (token) => {
    try {
        const response = await api.get("/api/auth/verify-email", {
            params: { token },
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const resendVerificationEmail = async (email) => {
    try {
        const response = await api.post("/api/auth/resend-verification", { email });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const loginUser = async (payload) => {
    try {
        const response = await api.post("/api/auth/login", {
            email: payload.email,
            password: payload.password,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const refreshToken = async (token) => {
    try {
        const response = await api.post("/api/auth/refresh", {
            refreshToken: token,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const logoutUser = async (token) => {
    try {
        const response = await api.post("/api/auth/logout", {
            refreshToken: token,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post("/api/auth/forgot-password", { email });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const resetPassword = async (payload) => {
    try {
        const response = await api.post("/api/auth/reset-password", {
            token: payload.token,
            new_password: payload.new_password,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/api/auth/me");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
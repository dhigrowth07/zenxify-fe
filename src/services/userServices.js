import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";

/**
 * Retrieves Dashboard statistics.
 * @returns {Promise<any>}
 */
export const getDashboardStats = async () => {
    try {
        const response = await api.get("/api/me/stats");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Retrieves the authenticated user's profile.
 * @returns {Promise<any>}
 */
export const getMe = async () => {
    try {
        const response = await api.get("/api/me");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Updates the user's profile information.
 * @param {Object} payload { full_name, username, bio, social_links }
 * @returns {Promise<any>}
 */
export const updateProfile = async (payload) => {
    try {
        const response = await api.patch("/api/me/profile", payload);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Updates the user's preferences.
 * @param {Object} payload { primary_language, interface_language, default_spoken_lang, default_caption_lang, tutorial_completed }
 * @returns {Promise<any>}
 */
export const updatePreferences = async (payload) => {
    try {
        const response = await api.patch("/api/me/preferences", payload);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Changes the user's password.
 * @param {Object} payload { current_password, new_password }
 * @returns {Promise<any>}
 */
export const changePassword = async (payload) => {
    try {
        const response = await api.post("/api/me/change-password", payload);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Retrieves list of active sessions for the user.
 * @returns {Promise<any>}
 */
export const getSessions = async () => {
    try {
        const response = await api.get("/api/me/sessions");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Revokes a specific session by ID.
 * @param {string} sessionId
 * @returns {Promise<any>}
 */
export const revokeSession = async (sessionId) => {
    try {
        const response = await api.delete(`/api/me/sessions/${sessionId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Revokes all other sessions except the current one.
 * @returns {Promise<any>}
 */
export const revokeAllOtherSessions = async () => {
    try {
        const response = await api.post("/api/me/revoke-other-sessions");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Soft deletes the user's account.
 * @param {Object} payload { password }
 * @returns {Promise<any>}
 */
export const deleteAccount = async (payload) => {
    try {
        const response = await api.delete("/api/me", { data: payload });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Retrieves the user's custom vocabulary entries.
 * @returns {Promise<any>}
 */
export const getVocabulary = async () => {
    try {
        const response = await api.get("/api/me/vocabulary");
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Adds a new entry to the user's custom vocabulary.
 * @param {Object} payload { phrase, sounds_like, display_as }
 * @returns {Promise<any>}
 */
export const addVocabulary = async (payload) => {
    try {
        const response = await api.post("/api/me/vocabulary", payload);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Removes a custom vocabulary entry by ID.
 * @param {string} vocabId
 * @returns {Promise<any>}
 */
export const removeVocabulary = async (vocabId) => {
    try {
        const response = await api.delete(`/api/me/vocabulary/${vocabId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";

/**
 * Zenxify Project Services
 * Handles all project-related API interactions.
 */

/**
 * Create a new project
 * @param {object} projectData - The metadata for the new project
 * @returns {Promise<any>}
 */
export const createProject = async (projectData) => {
    try {
        const response = await api.post("/api/projects", projectData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * List all projects for the current user
 * @param {object} [params={}] - Optional filters/pagination
 * @returns {Promise<any>}
 */
export const listProjects = async (params = {}) => {
    try {
        const response = await api.get("/api/projects", { params });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Get details of a specific project
 * @param {string} id - Project UUID
 * @returns {Promise<any>}
 */
export const getProject = async (id) => {
    try {
        const response = await api.get(`/api/projects/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Update general project metadata
 * @param {string} id - Project UUID
 * @param {object} updateData - Partial project fields
 * @returns {Promise<any>}
 */
export const updateProject = async (id, updateData) => {
    try {
        const response = await api.patch(`/api/projects/${id}`, updateData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Update spoken/caption languages
 * @param {string} id - Project UUID
 * @param {object} languageData - Language configuration
 * @returns {Promise<any>}
 */
export const updateLanguage = async (id, languageData) => {
    try {
        const response = await api.patch(`/api/projects/${id}/language`, languageData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Update B-roll and Layout configuration
 * @param {string} id - Project UUID
 * @param {object} brollData - B-roll configuration
 * @returns {Promise<any>}
 */
export const updateBroll = async (id, brollData) => {
    try {
        const response = await api.patch(`/api/projects/${id}/broll`, brollData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Delete a project
 * @param {string} id - Project UUID
 * @returns {Promise<any>}
 */
export const deleteProject = async (id) => {
    try {
        const response = await api.delete(`/api/projects/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Duplicate an existing project
 * @param {string} id - Project UUID
 * @returns {Promise<any>}
 */
export const duplicateProject = async (id) => {
    try {
        const response = await api.post(`/api/projects/${id}/duplicate`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Restore a soft-deleted project
 * @param {string} id - Project UUID
 * @returns {Promise<any>}
 */
export const restoreProject = async (id) => {
    try {
        const response = await api.post(`/api/projects/${id}/restore`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

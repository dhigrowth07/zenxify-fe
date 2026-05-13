import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";

/**
 * Zenxify B-roll Services
 * Handles all B-roll related API interactions.
 */

/**
 * Trigger AI B-roll analysis and stock search for a project
 * @param {string} projectId 
 * @returns {Promise<any>}
 */
export const triggerBrollAnalysis = async (projectId) => {
    try {
        const response = await api.post(`/api/broll/${projectId}/trigger`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Fetch all generated B-roll results for a project
 * @param {string} projectId 
 * @returns {Promise<any>}
 */
export const getBrollResults = async (projectId) => {
    try {
        const response = await api.get(`/api/broll/${projectId}/results`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Update a specific B-roll segment selection
 * @param {string} projectId 
 * @param {number} segmentIndex 
 * @param {object} data 
 * @returns {Promise<any>}
 */
export const updateBrollSegment = async (projectId, segmentIndex, data) => {
    try {
        const response = await api.patch(`/api/broll/${projectId}/segments/${segmentIndex}`, data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Apply the current B-roll selections to the project's editor timeline
 * @param {string} projectId 
 * @param {object} data 
 * @returns {Promise<any>}
 */
export const applyToEditor = async (projectId, data) => {
    try {
        const response = await api.post(`/api/broll/${projectId}/apply`, data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Regenerate visuals for a specific B-roll segment
 * @param {string} projectId 
 * @param {number} segmentIndex 
 * @param {object} [options] Override options (prompt_override, query_override, force_type, etc.)
 * @returns {Promise<any>}
 */
export const regenerateSegmentVisuals = async (projectId, segmentIndex, options = {}) => {
    try {
        const response = await api.post(`/api/broll/${projectId}/segments/${segmentIndex}/generate`, options);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Search the stock footage library
 * @param {object} params Search parameters (query, orientation, perPage)
 * @returns {Promise<any>}
 */
export const searchLibrary = async (params) => {
    try {
        const response = await api.get(`/api/broll/library/search`, { params });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Step 1: Get a presigned S3 URL for uploading a custom replacement file
 * @param {string} projectId 
 * @param {number} segmentIndex 
 * @param {string} contentType 
 * @returns {Promise<any>}
 */
export const presignCustomReplace = async (projectId, segmentIndex, contentType) => {
    try {
        const response = await api.post(`/api/broll/${projectId}/segments/${segmentIndex}/replace/presign`, { contentType });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Step 2: Confirm a custom file upload was successful on S3
 * @param {string} projectId 
 * @param {number} segmentIndex 
 * @param {object} data 
 * @returns {Promise<any>}
 */
export const confirmCustomReplace = async (projectId, segmentIndex, data) => {
    try {
        const response = await api.post(`/api/broll/${projectId}/segments/${segmentIndex}/replace/confirm`, data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Replace a segment with a clip from the stock footage library
 * @param {string} projectId 
 * @param {number} segmentIndex 
 * @param {object} data 
 * @returns {Promise<any>}
 */
export const replaceFromLibrary = async (projectId, segmentIndex, data) => {
    try {
        const response = await api.post(`/api/broll/${projectId}/segments/${segmentIndex}/replace/library`, data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const brollServices = {
    triggerBrollAnalysis,
    getBrollResults,
    updateBrollSegment,
    applyToEditor,
    regenerateSegmentVisuals,
    searchLibrary,
    presignCustomReplace,
    confirmCustomReplace,
    replaceFromLibrary
};

export default brollServices;

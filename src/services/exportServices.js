/**
 * zenxify-fe/src/services/exportServices.js
 * ──────────────────────────────────────────
 * API communication for project exports and rendering.
 */

import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";
import { toast } from "../utils/toastHandler";

const BASE_URL = "/api/export";

/**
 * Start the project export/render process.
 * @param {string} projectId 
 * @param {object} options - { editor, resolution, videoQuality, audioQuality }
 */
export const startExport = async (projectId, options) => {
    try {
        const promise = api.post(`${BASE_URL}/${projectId}`, options);
        
        toast.promise(
            promise,
            "Initializing render...",
            "Export sequence initiated!",
            (err) => err.response?.data?.message || "Failed to start export"
        );

        const response = await promise;
        return response.data.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Fetch status of a specific export.
 * @param {string} exportId 
 */
export const getExportStatus = async (exportId) => {
    try {
        const response = await api.get(`${BASE_URL}/status/${exportId}`);
        return response.data.data;
    } catch (error) {
        return handleApiError(error);
    }
};

const exportServices = {
    startExport,
    getExportStatus
};

export default exportServices;

import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";
import axios from "axios";

/**
 * Get a presigned URL for direct S3 upload
 * @param {object} data - { projectId, contentType, filename }
 */
export const getPresignedUploadUrl = async (data) => {
    try {
        const response = await api.post("/api/storage/presign/upload", data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Confirm upload completion and verify file
 * @param {object} data - { projectId, s3Key, fileSize, filename }
 */
export const confirmFileUpload = async (data) => {
    try {
        const response = await api.post("/api/storage/upload-complete", data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Helper to upload file directly to S3 using presigned URL
 * @param {string} url - Presigned S3 URL
 * @param {File} file - File object
 * @param {string} contentType - File content type
 * @param {Function} [onProgress] - Optional progress callback (percent) => void
 */
export const uploadFileToS3 = async (url, file, contentType, onProgress) => {
    try {
        const response = await axios.put(url, file, {
            headers: {
                "Content-Type": contentType,
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total && onProgress) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

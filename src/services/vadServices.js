import api from "./api";
import { handleApiError } from "../utils/APIErrorHandler";

/**
 * server/src/services/vadServices.js
 * ─────────────────────────────────
 * Frontend services for the Voice Activity Detection (VAD) module.
 * Fully aligned with backend routes in vad.routes.js.
 */

/**
 * @desc Get the latest VAD segments for a project.
 * @route GET /api/vad/segments
 */
export const getSegments = async (projectId) => {
    try {
        const response = await api.get("/api/vad/segments", {
            params: { projectId }
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Save spoken and caption language settings.
 * @route POST /api/vad/config/language
 */
export const saveLanguageConfig = async (projectId, spoken_language, caption_language) => {
    try {
        const response = await api.post("/api/vad/config/language", {
            projectId,
            spoken_language,
            caption_language
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Save B-roll opted-in status and template.
 * @route POST /api/vad/config/broll
 */
export const saveBrollConfig = async (projectId, layout_template, broll_opted_in) => {
    try {
        const response = await api.post("/api/vad/config/broll", {
            projectId,
            layout_template,
            broll_opted_in
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Save SFX and B-roll segments configuration in editor_json.
 * @route POST /api/vad/config/multimedia
 */
export const saveMultimedia = async (projectId, sfx_segments, broll_segments) => {
    try {
        const response = await api.post("/api/vad/config/multimedia", {
            projectId,
            sfx_segments,
            broll_segments
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Trigger VAD analysis job.
 * @route POST /api/vad/run
 */
export const runVad = async (projectId, options = {}) => {
    try {
        const response = await api.post("/api/vad/run", {
            projectId,
            ...options
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Batch update segment metadata (is_kept, start/end times).
 * @route PATCH /api/vad/segments
 */
export const updateSegments = async (projectId, changes) => {
    try {
        const response = await api.patch("/api/vad/segments", {
            projectId,
            changes
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Split a single segment into two at a specified second.
 * @route POST /api/vad/segments/split
 */
export const splitSegment = async (projectId, segment_index, split_at_sec) => {
    try {
        const response = await api.post("/api/vad/segments/split", {
            projectId,
            segment_index,
            split_at_sec
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Restore a full segment snapshot (undo/redo).
 * @route POST /api/vad/segments/restore
 */
export const restoreSnapshot = async (projectId, segments) => {
    try {
        const response = await api.post("/api/vad/segments/restore", {
            projectId,
            segments
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * @desc Confirm selected segments and trigger the video merge job.
 * @route POST /api/vad/confirm-cuts
 */
export const confirmCuts = async (projectId, selected_segment_indices) => {
    try {
        const response = await api.post("/api/vad/confirm-cuts", {
            projectId,
            selected_segment_indices
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

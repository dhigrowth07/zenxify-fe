/**
 * zenxify-fe/src/services/notificationServices.js
 * ────────────────────────────────────────────────
 * API communication for User Notifications & Real-time SSE Stream.
 */

import api from "./api";
import { API_URL } from "../config/envConfig";

const BASE_URL = "/api/notifications";

/**
 * Fetch paginated notifications.
 * @param {object} params - { page, limit, unread_only }
 */
export const getNotifications = async (params = {}) => {
    const { data } = await api.get(BASE_URL, { params });
    return data.data;
};

/**
 * Mark a single notification as read.
 * @param {string} id - Notification ID.
 */
export const markAsRead = async (id) => {
    const { data } = await api.patch(`${BASE_URL}/${id}/read`);
    return data.data;
};

/**
 * Mark all notifications as read for the current user.
 */
export const markAllAsRead = async () => {
    const { data } = await api.patch(`${BASE_URL}/read-all`);
    return data.data;
};

/**
 * Delete multiple notifications.
 * @param {string[]} ids - Array of notification IDs.
 */
export const deleteMultiple = async (ids) => {
    const { data } = await api.delete(`${BASE_URL}/bulk`, { data: { ids } });
    return data.data;
};

/**
 * Delete all notifications for the current user.
 */
export const deleteAll = async () => {
    const { data } = await api.delete(`${BASE_URL}/all`);
    return data.data;
};

/**
 * Initialize a real-time SSE stream for notifications.
 * @param {object} options
 * @param {string} options.token - Auth token (passed via query for SSE)
 * @param {(data: any) => void} options.onNotification
 * @param {(data: any) => void} [options.onProgress]
 * @param {(event: any) => void} [options.onError]
 * @param {(event: any) => void} [options.onOpen]
 * @returns {() => void} - Function to close the stream.
 */
export const initNotificationStream = ({ token, onNotification, onProgress, onError, onOpen }) => {
    // Dynamically use current origin if API_URL is missing (handles different ports like 5000)
    const host = API_URL || window.location.origin;
    const sseUrl = token 
        ? `${host}${BASE_URL}/stream?token=${token}`
        : `${host}${BASE_URL}/stream`;
    
    console.log("[SSE] Initializing stream at:", sseUrl);
    
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onopen = (event) => {
        console.log("[SSE] Connection established successfully.");
        if (onOpen) onOpen(event);
    };

    // Listen specifically for the 'notification' event emitted by the backend
    eventSource.addEventListener("notification", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (onNotification) onNotification(data);
        } catch (err) {
            console.error("[SSE] Error parsing notification data:", err);
        }
    });

    // Listen for progress updates
    eventSource.addEventListener("job_progress", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (onProgress) onProgress({ ...data, eventType: 'progress' });
        } catch (err) {
            console.error("[SSE] Error parsing progress data:", err);
        }
    });

    // Listen for completion
    eventSource.addEventListener("export_done", (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("[SSE] Export Success Event Received:", data);
            if (onProgress) onProgress({ ...data, progress: 100, status: 'completed', eventType: 'done' });
        } catch (err) {
            console.error("[SSE] Error parsing export_done data:", err);
        }
    });

    // Listen for failure
    eventSource.addEventListener("job_failed", (event) => {
        try {
            const data = JSON.parse(event.data);
            console.warn("[SSE] Job Failure Event Received:", data);
            if (onProgress) onProgress({ ...data, status: 'failed', eventType: 'failed' });
        } catch (err) {
            console.error("[SSE] Error parsing job_failed data:", err);
        }
    });

    eventSource.onerror = (event) => {
        if (onError) onError(event);
        // EventSource will automatically try to reconnect unless we close it
    };

    // Return cleanup function
    return () => {
        eventSource.close();
    };
};

const notificationServices = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteMultiple,
    deleteAll,
    initNotificationStream
};

export default notificationServices;

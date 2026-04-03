/**
 * zenxify-fe/src/redux/notifications/notificationSlice.js
 * ────────────────────────────────────────────────────────
 * Redux Toolkit slice for managing user notifications.
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as notificationServices from "../../services/notificationServices";

export const fetchNotificationsAsync = createAsyncThunk(
    "notifications/fetchAll",
    async (/** @type {any} */ params, { rejectWithValue }) => {
        try {
            return await notificationServices.getNotifications(params);
        } catch (error) {
            return rejectWithValue((/** @type {any} */ (error)).response?.data || (/** @type {any} */ (error)).message);
        }
    }
);

export const markAsReadAsync = createAsyncThunk(
    "notifications/markRead",
    async (/** @type {string} */ id, { rejectWithValue }) => {
        try {
            return await notificationServices.markAsRead(id);
        } catch (error) {
            return rejectWithValue((/** @type {any} */ (error)).response?.data || (/** @type {any} */ (error)).message);
        }
    }
);

export const markAllAsReadAsync = createAsyncThunk(
    "notifications/markAllRead",
    async (_, { rejectWithValue }) => {
        try {
            return await notificationServices.markAllAsRead();
        } catch (error) {
            return rejectWithValue((/** @type {any} */ (error)).response?.data || (/** @type {any} */ (error)).message);
        }
    }
);

export const deleteNotificationsAsync = createAsyncThunk(
    "notifications/deleteMultiple",
    async (/** @type {string[]} */ ids, { rejectWithValue }) => {
        try {
            return await notificationServices.deleteMultiple(ids);
        } catch (error) {
            return rejectWithValue((/** @type {any} */ (error)).response?.data || (/** @type {any} */ (error)).message);
        }
    }
);

export const clearAllNotificationsAsync = createAsyncThunk(
    "notifications/deleteAll",
    async (_, { rejectWithValue }) => {
        try {
            return await notificationServices.deleteAll();
        } catch (error) {
            return rejectWithValue((/** @type {any} */ (error)).response?.data || (/** @type {any} */ (error)).message);
        }
    }
);

const initialState = {
    /** @type {any[]} */
    notifications: [],
    unreadCount: 0,
    totalItems: 0,
    page: 1,
    limit: 20,
    isLoading: false,
    /** @type {string|null} */
    error: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: (state, action) => {
            // Prepend new notification from SSE stream
            state.notifications = [action.payload, ...state.notifications];
            state.unreadCount += 1;
            state.totalItems += 1;
        },
        updateUnreadCount: (state, action) => {
            state.unreadCount = action.payload;
        },
        clearNotifications: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchNotificationsAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload.notifications;
                state.totalItems = action.payload.total_items;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
                
                // Recalculate unread count
                state.unreadCount = action.payload.notifications.filter((/** @type {any} */ n) => !n.is_read).length;
            })
            .addCase(fetchNotificationsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (/** @type {any} */ (action.payload))?.message || "Failed to fetch notifications";
            })

            // Mark Read
            .addCase(markAsReadAsync.fulfilled, (state, action) => {
                const index = state.notifications.findIndex((/** @type {any} */ n) => n.id === action.payload.id);
                if (index !== -1 && !state.notifications[index].is_read) {
                    state.notifications[index].is_read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            // Mark All Read
            .addCase(markAllAsReadAsync.fulfilled, (state) => {
                state.notifications = state.notifications.map((/** @type {any} */ n) => ({ ...n, is_read: true }));
                state.unreadCount = 0;
            })

            // Delete Multiple
            .addCase(deleteNotificationsAsync.fulfilled, (state) => {
                // For simplicity, we trigger a refetch or handle via ID tracking elsewhere
                state.isLoading = false; 
            })
            
            // Delete All
            .addCase(clearAllNotificationsAsync.fulfilled, (state) => {
                state.notifications = [];
                state.unreadCount = 0;
                state.totalItems = 0;
            });
    },
});

export const { addNotification, updateUnreadCount, clearNotifications } = notificationSlice.actions;

/** @param {any} state */
export const selectNotifications = (state) => state.notifications.notifications;
/** @param {any} state */
export const selectUnreadCount = (state) => state.notifications.unreadCount;
/** @param {any} state */
export const selectNotificationLoading = (state) => state.notifications.isLoading;

export default notificationSlice.reducer;

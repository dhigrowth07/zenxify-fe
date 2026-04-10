/**
 * zenxify-fe/src/redux/export/exportSlice.js
 * ───────────────────────────────────────────
 * Redux state management for Export operations.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import exportServices from '../../services/exportServices';

/**
 * Async thunk to trigger project export.
 */
export const startExportAsync = createAsyncThunk(
    'export/startExport',
    async (/** @type {{projectId: string, options: any}} */ arg, { rejectWithValue }) => {
        const { projectId, options } = arg;
        try {
            return await exportServices.startExport(projectId, options);
        } catch (/** @type {any} */ err) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const initialState = {
    currentExport: null,
    status: 'idle', // idle | loading | active | completed | failed
    progress: 0,
    statusMessage: '',
    error: null,
};

const exportSlice = createSlice({
    name: 'export',
    initialState,
    reducers: {
        updateExportProgress: (state, action) => {
            const { progress, message, status } = action.payload;
            state.progress = progress;
            state.statusMessage = message || state.statusMessage;
            if (status) state.status = status;
        },
        resetExportState: (state) => {
            Object.assign(state, initialState);
        },
        setExportStatus: (state, action) => {
            state.status = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(startExportAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(startExportAsync.fulfilled, (state, action) => {
                state.status = 'active';
                state.currentExport = action.payload;
                state.progress = 10; // Initial queue progress
                state.statusMessage = 'Job queued for rendering...';
            })
            .addCase(startExportAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = /** @type {any} */ (action.payload);
            });
    },
});

export const { 
    updateExportProgress, 
    resetExportState, 
    setExportStatus 
} = exportSlice.actions;

// Selectors
export const selectExportState = (/** @type {any} */ state) => state.export;
export const selectExportProgress = (/** @type {any} */ state) => state.export.progress;
export const selectExportStatus = (/** @type {any} */ state) => state.export.status;

export default exportSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import brollServices from "../../services/brollServices";

/**
 * Zenxify B-roll Redux Slice
 * Manages the state for AI B-roll analysis, candidate results, and stock search.
 */

export const triggerBrollAnalysis = createAsyncThunk(
    "broll/triggerAnalysis",
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await brollServices.triggerBrollAnalysis(projectId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const fetchBrollResults = createAsyncThunk(
    "broll/fetchResults",
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await brollServices.getBrollResults(projectId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const updateSegment = createAsyncThunk(
    "broll/updateSegment",
    async ({ projectId, segmentIndex, data }, { rejectWithValue }) => {
        try {
            const response = await brollServices.updateBrollSegment(projectId, segmentIndex, data);
            return { index: segmentIndex, data: response.data };
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const applyBrollToEditor = createAsyncThunk(
    "broll/applyToEditor",
    async ({ projectId, data }, { rejectWithValue }) => {
        try {
            const response = await brollServices.applyToEditor(projectId, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

export const brollInitialState = {
    results: [], // AI suggested segments/results
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    analysisStatus: "idle", // 'idle' | 'analyzing' | 'completed' | 'failed'
    error: null,
    search: {
        results: [],
        loading: false,
        error: null
    }
};

const brollSlice = createSlice({
    name: "broll",
    initialState: brollInitialState,
    reducers: {
        resetBrollState: (state) => {
            return brollInitialState;
        },
        clearSearchResults: (state) => {
            state.search.results = [];
        },
        syncAnalysisStatus: (state, action) => {
            const status = action.payload;
            if (status === 'broll_analyzing' || status === 'transcription_processing') {
                state.analysisStatus = 'analyzing';
            } else if (state.analysisStatus === 'analyzing' && status === 'active') {
                state.analysisStatus = 'completed';
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Trigger Analysis
            .addCase(triggerBrollAnalysis.pending, (state) => {
                state.analysisStatus = "analyzing";
                state.error = null;
            })
            .addCase(triggerBrollAnalysis.fulfilled, (state, action) => {
                // Keep it in analyzing state as the background process just started
                state.analysisStatus = "analyzing";
            })
            .addCase(triggerBrollAnalysis.rejected, (state, action) => {
                state.analysisStatus = "failed";
                state.error = action.payload;
            })

            // Fetch Results
            .addCase(fetchBrollResults.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchBrollResults.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.results = action.payload || [];
                // If we have results and were analyzing, we might be done
                if (state.results.length > 0 && state.analysisStatus === 'analyzing') {
                    // This is a simple heuristic; a more robust check would involve project.status
                }
            })
            .addCase(fetchBrollResults.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })

            // Update Segment
            .addCase(updateSegment.fulfilled, (state, action) => {
                const { index, data } = action.payload;
                if (state.results[index]) {
                    state.results[index] = { ...state.results[index], ...data };
                }
            });
    }
});

export const { resetBrollState, clearSearchResults, syncAnalysisStatus } = brollSlice.actions;
export default brollSlice.reducer;

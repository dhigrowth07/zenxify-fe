import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    createProject, 
    listProjects, 
    getProject, 
    updateProject, 
    deleteProject,
    updateLanguage,
    updateBroll
} from "../../services/projectServices";

/** 
 * @typedef {Object} ProjectState
 * @property {any[]} projects
 * @property {any} currentProject
 * @property {boolean} isLoading
 * @property {string|null} error
 * @property {Object} pagination
 */

/** @type {ProjectState} */
const initialState = {
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    pagination: {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1
    }
};

/**
 * Async Thunk to create a new project
 * @type {any}
 */
export const createProjectAsync = createAsyncThunk(
    "projects/create",
    async (projectData, { rejectWithValue }) => {
        const createCall = (/** @type {any} */ (createProject));
        const result = await createCall(projectData);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return result.data;
    }
);

/**
 * Async Thunk to list all projects
 * @type {any}
 */
export const fetchProjectsAsync = createAsyncThunk(
    "projects/fetchAll",
    async (params, { rejectWithValue }) => {
        const listCall = (/** @type {any} */ (listProjects));
        const result = await listCall(params);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return result.data;
    }
);

/**
 * Async Thunk to fetch project details
 * @type {any}
 */
export const fetchProjectByIdAsync = createAsyncThunk(
    "projects/fetchById",
    async (id, { rejectWithValue }) => {
        const getCall = (/** @type {any} */ (getProject));
        const result = await getCall(id);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return result.data;
    }
);

/**
 * Async Thunk to update project metadata
 * @type {any}
 */
export const updateProjectAsync = createAsyncThunk(
    "projects/update",
    async ({ id, data }, { rejectWithValue }) => {
        const updateCall = (/** @type {any} */ (updateProject));
        const result = await updateCall(id, data);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return result.data;
    }
);

/**
 * Async Thunk to update project language
 * @type {any}
 */
export const updateProjectLanguageAsync = createAsyncThunk(
    "projects/updateLanguage",
    async ({ id, data }, { rejectWithValue }) => {
        const langCall = (/** @type {any} */ (updateLanguage));
        const result = await langCall(id, data);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return result.data;
    }
);

/**
 * Async Thunk to update project B-roll/Layout
 * @type {any}
 */
export const updateProjectBrollAsync = createAsyncThunk(
    "projects/updateBroll",
    async ({ id, data }, { rejectWithValue }) => {
        const brollCall = (/** @type {any} */ (updateBroll));
        const result = await brollCall(id, data);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return result.data;
    }
);

/**
 * Async Thunk to delete a project
 * @type {any}
 */
export const deleteProjectAsync = createAsyncThunk(
    "projects/delete",
    async (id, { rejectWithValue }) => {
        const deleteCall = (/** @type {any} */ (deleteProject));
        const result = await deleteCall(id);
        if (result.status !== "success") {
            return rejectWithValue(result);
        }
        return id;
    }
);

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        clearProjectError: (state) => {
            state.error = null;
        },
        resetProjectState: (state) => {
            state.currentProject = null;
            state.error = null;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // ── CREATE PROJECT ───────────────────────────────────────────────────
            .addCase(createProjectAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProjectAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProject = action.payload;
                state.projects.unshift(action.payload);
                state.error = null;
            })
            .addCase(createProjectAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (/** @type {any} */(action.payload))?.message || "Failed to create project";
            })

            // ── FETCH PROJECTS ───────────────────────────────────────────────────
            .addCase(fetchProjectsAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectsAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects = action.payload.projects || action.payload;
                state.pagination = action.payload.pagination || state.pagination;
                state.error = null;
            })
            .addCase(fetchProjectsAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (/** @type {any} */(action.payload))?.message || "Failed to fetch projects";
            })

            // ── FETCH BY ID ─────────────────────────────────────────────────────
            .addCase(fetchProjectByIdAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectByIdAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProject = action.payload;
                state.error = null;
            })
            .addCase(fetchProjectByIdAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = (/** @type {any} */(action.payload))?.message || "Failed to fetch project details";
            })

            // ── UPDATE PROJECT ──────────────────────────────────────────────────
            .addCase(updateProjectAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProject = action.payload;
                state.projects = state.projects.map((/** @type {any} */ p) => 
                    p.id === action.payload.id ? action.payload : p
                );
            })
            .addCase(updateProjectLanguageAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProject = action.payload;
                state.projects = state.projects.map((/** @type {any} */ p) => 
                    p.id === action.payload.id ? action.payload : p
                );
            })
            .addCase(updateProjectBrollAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProject = action.payload;
                state.projects = state.projects.map((/** @type {any} */ p) => 
                    p.id === action.payload.id ? action.payload : p
                );
            })

            // ── DELETE PROJECT ──────────────────────────────────────────────────
            .addCase(deleteProjectAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projects = state.projects.filter((/** @type {any} */ p) => p.id !== action.payload);
                if (state.currentProject?.id === action.payload) {
                    state.currentProject = null;
                }
            });
    }
});

export const { setCurrentProject, clearProjectError, resetProjectState } = projectSlice.actions;

// Selectors
/** @param {any} state */
export const selectAllProjects = (state) => state.projects.projects;
/** @param {any} state */
export const selectCurrentProject = (state) => state.projects.currentProject;
/** @param {any} state */
export const selectProjectLoading = (state) => state.projects.isLoading;
/** @param {any} state */
export const selectProjectError = (state) => state.projects.error;
/** @param {any} state */
export const selectProjectPagination = (state) => state.projects.pagination;

export default projectSlice.reducer;

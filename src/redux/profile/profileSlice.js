import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStats, updateProfile, updatePreferences, changePassword, getSessions, revokeSession } from "../../services/userServices";

/**
 * @typedef {Object} ProfileState
 * @property {any} stats
 * @property {boolean} isLoading
 * @property {boolean} isSessionsLoading
 * @property {string|null} error
 */

/** @type {ProfileState} */
const initialState = {
  stats: null,
  isLoading: false,
  isSessionsLoading: false,
  error: null,
};

export const fetchDashboardStatsAsync = createAsyncThunk(
  "profile/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getDashboardStats();
      if (response.status !== "success") {
        return rejectWithValue(response);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateProfileAsync = createAsyncThunk(
  "profile/updateProfile",
  async (/** @type {any} */ payload, { rejectWithValue }) => {
    try {
      const response = await updateProfile(payload);
      if (response.status !== "success") {
        return rejectWithValue(response);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updatePreferencesAsync = createAsyncThunk(
  "profile/updatePreferences",
  async (/** @type {any} */ payload, { rejectWithValue }) => {
    try {
      const response = await updatePreferences(payload);
      if (response.status !== "success") {
        return rejectWithValue(response);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const changePasswordAsync = createAsyncThunk(
  "profile/changePassword",
  async (/** @type {any} */ payload, { rejectWithValue }) => {
    try {
      const response = await changePassword(payload);
      if (response.status !== "success") {
        return rejectWithValue(response);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchSessionsAsync = createAsyncThunk(
  "profile/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSessions();
      if (response.status !== "success") {
        return rejectWithValue(response);
      }
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const revokeSessionAsync = createAsyncThunk(
  "profile/revokeSession",
  async (/** @type {string} */ sessionId, { rejectWithValue, dispatch }) => {
    try {
      const response = await revokeSession(sessionId);
      if (response.status !== "success") {
        return rejectWithValue(response);
      }
      dispatch(fetchSessionsAsync());
      return response.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    ...initialState,
    sessions: [],
  },
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfileState: (state) => {
      state.stats = null;
      state.sessions = [];
      state.isLoading = false;
      state.isSessionsLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStatsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStatsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardStatsAsync.rejected, (state, action) => {
        state.isLoading = false;
        const payload = /** @type {any} */ (action.payload);
        state.error = payload?.message || "Failed to fetch stats";
      })

      // Update Profile
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        const payload = /** @type {any} */ (action.payload);
        state.error = payload?.message || "Failed to update profile";
      })

      // Change Password
      .addCase(changePasswordAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        const payload = /** @type {any} */ (action.payload);
        state.error = payload?.message || "Failed to change password";
      })

      // Sessions
      .addCase(fetchSessionsAsync.pending, (state) => {
        state.isSessionsLoading = true;
      })
      .addCase(fetchSessionsAsync.fulfilled, (state, action) => {
        state.isSessionsLoading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessionsAsync.rejected, (state) => {
        state.isSessionsLoading = false;
      })

      // Update Preferences
      .addCase(updatePreferencesAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePreferencesAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updatePreferencesAsync.rejected, (state, action) => {
        state.isLoading = false;
        const payload = /** @type {any} */ (action.payload);
        state.error = payload?.message || "Failed to update preferences";
      });
  },
});

export const { clearProfileError, resetProfileState } = profileSlice.actions;

/** @param {{ profile: any }} state */
export const selectDashboardStats = (state) => state.profile.stats;
/** @param {{ profile: any }} state */
export const selectSessions = (state) => state.profile.sessions;
/** @param {{ profile: any }} state */
export const selectProfileLoading = (state) => state.profile.isLoading;
/** @param {{ profile: any }} state */
export const selectIsSessionsLoading = (state) => state.profile.isSessionsLoading;
/** @param {{ profile: any }} state */
export const selectProfileError = (state) => state.profile.error;

export default profileSlice.reducer;

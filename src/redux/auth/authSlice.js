import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, logoutUser, getCurrentUser } from "../../services/authServices";

const initialState = {
  accessToken: null,
  refreshToken: null,

  user: null,

  isAuthenticated: false,

  isLoading: false,
  isInitialized: false, 
  error: null,
};

export const loginAsync = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    const result = await loginUser({ email, password });

    if (result.status !== "success") {
      return rejectWithValue(result);
    }

    return result.data;
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const { refreshToken } = getState().auth;
    await logoutUser(refreshToken);
  }
);

export const fetchProfileAsync = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    const result = await getCurrentUser();

    if (result.status !== "success") {
      return rejectWithValue(result);
    }

    return result.data; 
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },

    setUser: (state, action) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    }
  },

  extraReducers: (builder) => {
    // ── LOGIN ──────────────────────────────────────────────────────────────
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload?.message || "Login failed. Please try again.";
      });

    // ── LOGOUT ─────────────────────────────────────────────────────────────
    builder
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      // ── FETCH PROFILE ──────────────────────────────────────────────────────
      .addCase(fetchProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload; 
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { loginSuccess, setTokens, setUser, logout, clearError, setInitialized } = authSlice.actions;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectIsInitialized = (state) => state.auth.isInitialized;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;

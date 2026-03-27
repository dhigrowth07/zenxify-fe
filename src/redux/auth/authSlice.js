import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { handleApiError } from "../../utils/APIErrorHandler";

const initialState = {
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // add reducers
  },
  extraReducers: (builder) => {
    // add extra reducers
  },
});

// export const { logout } = authSlice.actions; add moree 

// export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer;

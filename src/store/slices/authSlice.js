import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Async thunk — Register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

// Async thunk — Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

// Async thunk — Get current user
export const getMe = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user",
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/auth/profile", profileData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update profile",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get Me
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
    });
  },
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    // Even if this fails, still clear local state below
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

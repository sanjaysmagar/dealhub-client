import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Async thunk — Register
// export const registerUser = createAsyncThunk(
//   "auth/register",
//   async (userData, { rejectWithValue }) => {
//     try {
//       const { data } = await api.post("/auth/register", userData);
//       if (typeof window !== "undefined") {
//         localStorage.setItem("token", data.token);
//       }
//       return data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || "Registration failed",
//       );
//     }
//   },
// );
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      return data; // { message, userId, email } — no token until verified
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ userId, code }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/verify-otp", { userId, code });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Verification failed",
      );
    }
  },
);

export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/resend-otp", { userId });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to resend code",
      );
    }
  },
);

// Async thunk — Login
// export const loginUser = createAsyncThunk(
//   "auth/login",
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const { data } = await api.post("/auth/login", credentials);
//       if (typeof window !== "undefined") {
//         localStorage.setItem("token", data.token);
//       }
//       return data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || "Login failed");
//     }
//   },
// );

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
      const responseData = err.response?.data;
      if (responseData?.requiresVerification) {
        return rejectWithValue({
          message: responseData.message,
          requiresVerification: true,
          userId: responseData.userId,
          email: responseData.email,
        });
      }
      return rejectWithValue(responseData?.message || "Login failed");
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

export const googleAuth = createAsyncThunk(
  "auth/googleAuth",
  async (credential, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/google", { credential });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Google sign-in failed",
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
    resendLoading: false,
    error: null,
    pendingVerification: null,
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
    clearPendingVerification: (state) => {
      state.pendingVerification = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    // builder.addCase(registerUser.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.user = action.payload.user;
    //   state.token = action.payload.token;
    // });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.pendingVerification = {
        userId: action.payload.userId,
        email: action.payload.email,
      };
    });
    builder.addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.pendingVerification = null;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(resendOtp.pending, (state) => {
      state.resendLoading = true;
      state.error = null;
    });
    builder.addCase(resendOtp.fulfilled, (state) => {
      state.resendLoading = false;
    });
    builder.addCase(resendOtp.rejected, (state, action) => {
      state.resendLoading = false;
      state.error = action.payload;
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
    // builder.addCase(loginUser.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      if (action.payload?.requiresVerification) {
        state.error = action.payload.message;
        state.pendingVerification = {
          userId: action.payload.userId,
          email: action.payload.email,
        };
      } else {
        state.error = action.payload;
      }
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
    builder.addCase(googleAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(googleAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(googleAuth.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { logout, clearError, clearPendingVerification } =
  authSlice.actions;
export default authSlice.reducer;

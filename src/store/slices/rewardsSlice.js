import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const fetchSummary = createAsyncThunk(
  "rewards/summary",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/rewards/summary");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchHistory = createAsyncThunk(
  "rewards/history",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/rewards/history", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchLeaderboard = createAsyncThunk(
  "rewards/leaderboard",
  async (period = "all", { rejectWithValue }) => {
    try {
      const { data } = await api.get("/rewards/leaderboard", {
        params: { period },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const rewardsSlice = createSlice({
  name: "rewards",
  initialState: {
    summary: null,
    history: [],
    leaderboard: [],
    leaderboardPeriod: "all",
    loading: false,
    leaderboardLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSummary.fulfilled, (state, action) => {
      state.summary = action.payload;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.history = action.payload.history;
    });

    builder.addCase(fetchLeaderboard.pending, (state) => {
      state.leaderboardLoading = true;
    });
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
      state.leaderboardLoading = false;
      state.leaderboard = action.payload;
      state.leaderboardPeriod = action.meta.arg;
    });
    builder.addCase(fetchLeaderboard.rejected, (state, action) => {
      state.leaderboardLoading = false;
      state.error = action.payload;
    });
  },
});

export default rewardsSlice.reducer;

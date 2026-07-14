import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchSummary    = createAsyncThunk('rewards/summary',     async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/rewards/summary');     return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchHistory    = createAsyncThunk('rewards/history',     async (params, { rejectWithValue }) => {
  try { const { data } = await api.get('/rewards/history', { params }); return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});
export const fetchLeaderboard = createAsyncThunk('rewards/leaderboard', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/rewards/leaderboard');  return data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: {
    summary:     null,
    history:     [],
    leaderboard: [],
    loading:     false,
    error:       null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSummary.fulfilled,     (state, action) => { state.summary     = action.payload; });
    builder.addCase(fetchHistory.fulfilled,     (state, action) => { state.history     = action.payload.history; });
    builder.addCase(fetchLeaderboard.fulfilled, (state, action) => { state.leaderboard = action.payload; });
  },
});

export default rewardsSlice.reducer;
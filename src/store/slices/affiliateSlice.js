import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Generate (or fetch existing) affiliate link for a deal
export const generateLink = createAsyncThunk(
  "affiliate/generate",
  async (dealId, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/affiliate/generate", { dealId });
      return { dealId, ...data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to generate link",
      );
    }
  },
);

export const fetchMyLinks = createAsyncThunk(
  "affiliate/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/affiliate/my-links");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch your links",
      );
    }
  },
);

const affiliateSlice = createSlice({
  name: "affiliate",
  initialState: {
    linksByDeal: {}, // { [dealId]: { shareUrl, trackingCode, clicks, conversions, pointsEarned } }
    myLinks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAffiliateError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(generateLink.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(generateLink.fulfilled, (state, action) => {
      state.loading = false;
      state.linksByDeal[action.payload.dealId] = action.payload;
    });
    builder.addCase(generateLink.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(fetchMyLinks.fulfilled, (state, action) => {
      state.myLinks = action.payload;
    });
  },
});

export const { clearAffiliateError } = affiliateSlice.actions;
export default affiliateSlice.reducer;

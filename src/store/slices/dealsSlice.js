import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Fetch all deals
export const fetchDeals = createAsyncThunk(
  "deals/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { append, ...apiParams } = params;
      const { data } = await api.get("/deals", { params: apiParams });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch deals",
      );
    }
  },
);

// Fetch single deal
export const fetchDealById = createAsyncThunk(
  "deals/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/deals/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Deal not found");
    }
  },
);

export const fetchRecommendedDeals = createAsyncThunk(
  "deals/fetchRecommended",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/deals/recommended", { params });
      return data.deals;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch recommended deals",
      );
    }
  },
);

// Create a deal
export const createDeal = createAsyncThunk(
  "deals/create",
  async (dealData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/deals", dealData);
      return data.deal;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create deal",
      );
    }
  },
);

export const fetchMyDeals = createAsyncThunk(
  "deals/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/deals/user/mydeals");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch your deals",
      );
    }
  },
);

export const fetchMoreFromPoster = createAsyncThunk(
  "deals/fetchMoreFromPoster",
  async ({ postedBy, exclude }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/deals", {
        params: { postedBy, exclude, limit: 3, sort: "new" },
      });
      return data.deals;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch more deals",
      );
    }
  },
);

export const updateDeal = createAsyncThunk(
  "deals/update",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/deals/${id}`, updates);
      return data.deal;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update deal",
      );
    }
  },
);

export const deleteDeal = createAsyncThunk(
  "deals/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/deals/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete deal",
      );
    }
  },
);

export const fetchAdminDeals = createAsyncThunk(
  "deals/fetchAdmin",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/deals/admin/all", { params });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch deals",
      );
    }
  },
);

export const moderateDeal = createAsyncThunk(
  "deals/moderate",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/deals/${id}/moderate`, { status });
      return data.deal;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to moderate deal",
      );
    }
  },
);

// Vote on a deal
export const voteDeal = createAsyncThunk(
  "deals/vote",
  async ({ id, voteType }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/deals/${id}/vote`, { voteType });
      return { id, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Vote failed");
    }
  },
);

export const fetchFeaturedDeal = createAsyncThunk(
  "deals/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/deals/featured");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch featured deal",
      );
    }
  },
);

export const fetchStats = createAsyncThunk(
  "deals/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/deals/stats");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch stats",
      );
    }
  },
);

// Toggle save/favourite on a deal
export const toggleSaveDeal = createAsyncThunk(
  "deals/toggleSave",
  async (dealId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/saved/${dealId}/toggle`);
      return { dealId, saved: data.saved };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save deal",
      );
    }
  },
);

// Fetch this user's saved deals (for the Saved Deals dashboard tab)
export const fetchMySavedDeals = createAsyncThunk(
  "deals/fetchMySaved",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/saved/my-saved");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch saved deals",
      );
    }
  },
);

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    deals: [],
    loadingMore: false,
    moreFromPoster: [],
    myDeals: [],
    savedDeals: [],
    recommendedDeals: [],
    adminDeals: [],
    adminCounts: { total: 0, approved: 0, rejected: 0 },
    adminPagination: {},
    currentDeal: null,
    featuredDeal: null,
    stats: { totalDeals: 0, totalMembers: 0, totalSaved: 0 },
    pagination: {},
    loading: false,
    error: null,
    filters: {
      category: "All",
      sort: "hot",
      search: "",
      page: 1,
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    clearMoreFromPoster: (state) => {
      state.moreFromPoster = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchDeals.pending, (state, action) => {
      if (action.meta.arg?.append) {
        state.loadingMore = true;
      } else {
        state.loading = true;
      }
      state.error = null;
    });
    builder.addCase(fetchDeals.fulfilled, (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      if (action.meta.arg?.append) {
        state.deals = [...state.deals, ...action.payload.deals];
      } else {
        state.deals = action.payload.deals;
      }
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchDeals.rejected, (state, action) => {
      state.loading = false;
      state.loadingMore = false;
      state.error = action.payload;
    });

    // Fetch by ID
    builder.addCase(fetchDealById.fulfilled, (state, action) => {
      state.currentDeal = action.payload;
    });

    // Create
    builder.addCase(createDeal.fulfilled, (state, action) => {
      state.deals.unshift(action.payload);
    });

    builder.addCase(fetchMyDeals.fulfilled, (state, action) => {
      state.myDeals = action.payload;
    });

    builder.addCase(updateDeal.fulfilled, (state, action) => {
      const idx = state.myDeals.findIndex((d) => d._id === action.payload._id);
      if (idx !== -1) state.myDeals[idx] = action.payload;
    });

    builder.addCase(deleteDeal.fulfilled, (state, action) => {
      state.myDeals = state.myDeals.filter((d) => d._id !== action.payload);
      state.adminDeals = state.adminDeals.filter(
        (d) => d._id !== action.payload,
      );
      state.savedDeals = state.savedDeals.filter(
        (d) => d._id !== action.payload,
      );
    });

    // Vote — update the deal in the list, including the user's own vote
    builder.addCase(voteDeal.fulfilled, (state, action) => {
      const idx = state.deals.findIndex((d) => d._id === action.payload.id);
      if (idx !== -1) {
        state.deals[idx].votes = action.payload.votes;
        state.deals[idx].score = action.payload.score;
        state.deals[idx].myVote = action.payload.myVote;
      }
      if (state.currentDeal?._id === action.payload.id) {
        state.currentDeal.votes = action.payload.votes;
        state.currentDeal.score = action.payload.score;
        state.currentDeal.myVote = action.payload.myVote;
      }
    });

    builder.addCase(fetchAdminDeals.fulfilled, (state, action) => {
      state.adminDeals = action.payload.deals;
      state.adminCounts = action.payload.counts;
      state.adminPagination = action.payload.pagination;
    });

    builder.addCase(moderateDeal.fulfilled, (state, action) => {
      const idx = state.adminDeals.findIndex(
        (d) => d._id === action.payload._id,
      );
      if (idx !== -1) state.adminDeals[idx] = action.payload;
    });
    builder.addCase(fetchFeaturedDeal.fulfilled, (state, action) => {
      state.featuredDeal = action.payload;
    });
    builder.addCase(fetchStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Save / Favourite toggle
    builder.addCase(toggleSaveDeal.fulfilled, (state, action) => {
      const { dealId, saved } = action.payload;

      const idx = state.deals.findIndex((d) => d._id === dealId);
      if (idx !== -1) state.deals[idx].isSaved = saved;

      if (state.currentDeal?._id === dealId) {
        state.currentDeal.isSaved = saved;
      }

      if (!saved) {
        state.savedDeals = state.savedDeals.filter((d) => d._id !== dealId);
      }
    });

    builder.addCase(fetchMySavedDeals.fulfilled, (state, action) => {
      state.savedDeals = action.payload;
    });
    builder.addCase(fetchMoreFromPoster.fulfilled, (state, action) => {
      state.moreFromPoster = action.payload;
    });
    // builder.addCase(fetchRecommendedDeals.fulfilled, (state, action) => {
    //   state.recommendedDeals = action.payload;
    // });
    builder.addCase(fetchRecommendedDeals.pending, (state) => {
      state.recommendedLoading = true;
      state.recommendedError = null;
    });
    builder.addCase(fetchRecommendedDeals.fulfilled, (state, action) => {
      state.recommendedLoading = false;
      state.recommendedDeals = action.payload;
    });
    builder.addCase(fetchRecommendedDeals.rejected, (state, action) => {
      state.recommendedLoading = false;
      state.recommendedError = action.payload;
    });
  },
});

export const { setFilter, clearMoreFromPoster } = dealsSlice.actions;
export default dealsSlice.reducer;

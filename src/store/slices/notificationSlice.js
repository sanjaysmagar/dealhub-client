import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

export const fetchMyNotifications = createAsyncThunk(
  "notifications/fetchMine",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch notifications",
      );
    }
  },
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      return data.count;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch unread count",
      );
    }
  },
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark as read",
      );
    }
  },
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.put("/notifications/read-all");
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to mark all as read",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMyNotifications.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMyNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchMyNotifications.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    builder.addCase(markNotificationRead.fulfilled, (state, action) => {
      const idx = state.items.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1 && !state.items[idx].read) {
        state.items[idx].read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllNotificationsRead.fulfilled, (state) => {
      state.items = state.items.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    });
  },
});

export default notificationSlice.reducer;

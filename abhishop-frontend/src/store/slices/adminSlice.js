import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load stats');
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/users');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load users');
  }
});

export const toggleUserActive = createAsyncThunk('admin/toggleUser', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/admin/users/${userId}/toggle-active`);
    toast.success(`User ${data.isActive ? 'activated' : 'deactivated'}`);
    return { userId, isActive: data.isActive };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update user');
  }
});

export const adminCreateProduct = createAsyncThunk('admin/createProduct', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', productData);
    toast.success('Product created successfully');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create product');
  }
});

export const adminUpdateProduct = createAsyncThunk('admin/updateProduct', async ({ id, ...productData }, { rejectWithValue }) => {
  try {
    await api.put(`/products/${id}`, productData);
    toast.success('Product updated successfully');
    return { id, ...productData };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

export const adminDeleteProduct = createAsyncThunk('admin/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    toast.success('Product deleted');
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

export const adminUpdateOrderStatus = createAsyncThunk('admin/updateOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await api.put(`/orders/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
    toast.success('Order status updated');
    return { id, status };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update order status');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    statsLoading: false,
    usersLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => { state.statsLoading = true; })
      .addCase(fetchAdminStats.fulfilled, (state, action) => { state.statsLoading = false; state.stats = action.payload; })
      .addCase(fetchAdminStats.rejected, (state, action) => { state.statsLoading = false; state.error = action.payload; })
      .addCase(fetchAdminUsers.pending, (state) => { state.usersLoading = true; })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => { state.usersLoading = false; state.users = action.payload; })
      .addCase(fetchAdminUsers.rejected, (state, action) => { state.usersLoading = false; state.error = action.payload; })
      .addCase(toggleUserActive.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload.userId);
        if (user) user.isActive = action.payload.isActive;
      });
  },
});

export default adminSlice.reducer;

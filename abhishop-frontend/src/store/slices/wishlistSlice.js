import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/wishlist');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/wishlist/${productId}`);
    if (data.added) toast.success('Added to wishlist');
    else toast.success('Removed from wishlist');
    return { productId, added: data.added };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update wishlist');
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    await api.delete(`/wishlist/${productId}`);
    toast.success('Removed from wishlist');
    return productId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    productIds: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetWishlist(state) { state.items = []; state.productIds = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { state.loading = true; })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.productIds = action.payload.map(i => i.productId);
      })
      .addCase(fetchWishlist.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, added } = action.payload;
        if (added) {
          state.productIds.push(productId);
        } else {
          state.productIds = state.productIds.filter(id => id !== productId);
          state.items = state.items.filter(i => i.productId !== productId);
        }
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.productIds = state.productIds.filter(id => id !== action.payload);
        state.items = state.items.filter(i => i.productId !== action.payload);
      });
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

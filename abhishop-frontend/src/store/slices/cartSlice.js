import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
  }
});

export const addToCart = createAsyncThunk('cart/addToCart', async (item, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart', item);
    toast.success('Added to cart!');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateCartItem = createAsyncThunk('cart/updateCartItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cart');
  }
});

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cart/${itemId}`);
    toast.success('Removed from cart');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart');
    return { items: [], subTotal: 0, tax: 0, shippingCost: 0, total: 0, itemCount: 0 };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    subTotal: 0,
    tax: 0,
    shippingCost: 0,
    total: 0,
    itemCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetCart(state) {
      state.items = [];
      state.subTotal = 0;
      state.tax = 0;
      state.shippingCost = 0;
      state.total = 0;
      state.itemCount = 0;
    },
  },
  extraReducers: (builder) => {
    const handleFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.subTotal = action.payload.subTotal;
      state.tax = action.payload.tax;
      state.shippingCost = action.payload.shippingCost;
      state.total = action.payload.total;
      state.itemCount = action.payload.itemCount;
    };

    [fetchCart, addToCart, updateCartItem, removeFromCart, clearCart].forEach(thunk => {
      builder
        .addCase(thunk.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(thunk.fulfilled, handleFulfilled)
        .addCase(thunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

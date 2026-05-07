import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchAddresses = createAsyncThunk('addresses/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/addresses');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load addresses');
  }
});

export const createAddress = createAsyncThunk('addresses/create', async (addressData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/addresses', addressData);
    toast.success('Address added successfully');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add address');
  }
});

export const updateAddress = createAsyncThunk('addresses/update', async ({ id, ...addressData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/addresses/${id}`, addressData);
    toast.success('Address updated');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update address');
  }
});

export const deleteAddress = createAsyncThunk('addresses/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/addresses/${id}`);
    toast.success('Address deleted');
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
  }
});

const addressSlice = createSlice({
  name: 'addresses',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => { state.loading = true; })
      .addCase(fetchAddresses.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAddresses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) state.items.forEach(a => { a.isDefault = false; });
        state.items.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        if (action.payload.isDefault) state.items.forEach(a => { a.isDefault = false; });
        const idx = state.items.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
      });
  },
});

export default addressSlice.reducer;

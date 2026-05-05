import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load products');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load featured products');
  }
});

export const fetchProduct = createAsyncThunk('products/fetchProduct', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Product not found');
  }
});

export const fetchBrands = createAsyncThunk('products/fetchBrands', async (categoryId, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/brands', { params: { categoryId } });
    return data;
  } catch (err) {
    return rejectWithValue('Failed to load brands');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    selectedProduct: null,
    brands: [],
    totalCount: 0,
    page: 1,
    pageSize: 12,
    totalPages: 0,
    loading: false,
    productLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedProduct(state) { state.selectedProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchProduct.pending, (state) => { state.productLoading = true; state.error = null; })
      .addCase(fetchProduct.fulfilled, (state, action) => { state.productLoading = false; state.selectedProduct = action.payload; })
      .addCase(fetchProduct.rejected, (state, action) => { state.productLoading = false; state.error = action.payload; })
      .addCase(fetchBrands.fulfilled, (state, action) => { state.brands = action.payload; });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;

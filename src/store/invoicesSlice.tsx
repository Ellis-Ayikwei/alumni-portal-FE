import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

interface InvoiceState {
    allInvoices: object;
    loading: boolean;
    error: string | null;
}

const initialState: InvoiceState = {
    allInvoices: {},
    loading: false,
    error: null,
};

export const GetInvoicesData = createAsyncThunk('invoices/allinvoices', async () => {
    const response = await axiosInstance.get('/invoices');
    console.log('all invoices', response);
    return response.data;
});

const invoicesSlice = createSlice({
    name: 'allinvoices',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetInvoicesData.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetInvoicesData.fulfilled, (state, action) => {
                state.allInvoices = action.payload;
                console.log('the data', action.payload);
                state.loading = false;
            })
            .addCase(GetInvoicesData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default invoicesSlice.reducer;

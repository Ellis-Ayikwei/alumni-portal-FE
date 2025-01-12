import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

interface paymentState {
    allPayments: object;
    loading: boolean;
    error: string | null;
}

const initialState: paymentState = {
    allPayments: {},
    loading: false,
    error: null,
};

export const GetPaymentsData = createAsyncThunk('payments/allpayments', async () => {
    const response = await axiosInstance.get('/payments');
    console.log("all payments", response);
    return response.data;
});

const paymentsSlice = createSlice({
    name: 'allpayments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetPaymentsData.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetPaymentsData.fulfilled, (state, action) => {
                state.allPayments = action.payload;
                state.loading = false;
            })
            .addCase(GetPaymentsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default paymentsSlice.reducer;


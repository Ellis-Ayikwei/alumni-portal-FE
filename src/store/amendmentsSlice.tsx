import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

// Define the initial state type
interface InsurancePackageState {
    amendments: object;
    amendmentsloading: boolean;
    amendmentserror: string | null;
}

// Define the initial state
const initialState: InsurancePackageState = {
    amendments: {},
    amendmentsloading: false,
    amendmentserror: null,
};

// Create an async thunk for Login functionality
export const GetAmendments = createAsyncThunk('amendments/getamendments', async () => {
    const response = await axiosInstance.get('/amendments');
    console.log('response......data......', response.data);
    return response.data;
});

// Create a slice for Login functionality
const amendmentsSlice = createSlice({
    name: 'Amendments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetAmendments.pending, (state) => {
                state.amendmentsloading = true;
            })
            .addCase(GetAmendments.fulfilled, (state, action) => {
                state.amendments = action.payload;
                state.amendmentsloading = false;
            })
            .addCase(GetAmendments.rejected, (state, action) => {
                state.amendmentsloading = false;
                state.amendmentserror = action.error.message || 'An amendmentserror occurred';
            });
    },
});

// Export the reducer to be used in the store
export default amendmentsSlice.reducer;

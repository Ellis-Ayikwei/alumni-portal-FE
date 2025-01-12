import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

// Define the initial state type
interface InsurancePackageState {
    insurancePackages: object;
    loading: boolean;
    error: string | null;
}

// Define the initial state
const initialState: InsurancePackageState = {
    insurancePackages: {},
    loading: false,
    error: null,
};

// Create an async thunk for Login functionality
export const GetInsurancePackages = createAsyncThunk('insurance/getinsurancepackages', async () => {
    console.log("getting insurance packages")
    const response = await axiosInstance.get('/insurance_packages');
    console.log("got insurance packages", response.data)
    return response.data;
});

// Create a slice for Login functionality
const insurancePackagesSlice = createSlice({
    name: 'insurancePackages',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetInsurancePackages.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetInsurancePackages.fulfilled, (state, action) => {
                state.insurancePackages = action.payload;
                state.loading = false;
            })
            .addCase(GetInsurancePackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

// Export the reducer to be used in the store
export default insurancePackagesSlice.reducer;

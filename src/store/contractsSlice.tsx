import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

interface ContractState {
    allContracts: object;
    loading: boolean;
    error: string | null;
}

const initialState: ContractState = {
    allContracts: {},
    loading: false,
    error: null,
};

export const GetContractsData = createAsyncThunk('contracts/allcontacts', async () => {
    const response = await axiosInstance.get('/contracts');
    return response.data;
});

const contractsSlice = createSlice({
    name: 'allcontacts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetContractsData.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetContractsData.fulfilled, (state, action) => {
                state.allContracts = action.payload;
                state.loading = false;
            })
            .addCase(GetContractsData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default contractsSlice.reducer;

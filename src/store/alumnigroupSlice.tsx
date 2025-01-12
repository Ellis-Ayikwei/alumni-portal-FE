import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

// Define the initial state type
interface AlumniGroupState {
    alumniGroups: object;
    loading: boolean;
    error: string | null;
}

// Define the initial state
const initialState: AlumniGroupState = {
    alumniGroups: {},
    loading: false,
    error: null,
};

// Create an async thunk for Login functionality
export const GetAlumniData = createAsyncThunk('alumni/alumnidata', async () => {
    const response = await axiosInstance.get('/alumni_groups');
    return response.data;
});

// Create a slice for Login functionality
const alumniGroupSlice = createSlice({
    name: 'alumnidata',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetAlumniData.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetAlumniData.fulfilled, (state, action) => {
                state.alumniGroups = action.payload;
                state.loading = false;
            })
            .addCase(GetAlumniData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

// Export the reducer to be used in the store
export default alumniGroupSlice.reducer;

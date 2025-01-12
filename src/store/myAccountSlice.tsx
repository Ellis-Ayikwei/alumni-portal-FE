import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../helper/axiosInstance';

// Define the initial state type
interface LoginState {
    usersData: object;
    loading: boolean;
    error: string | null;
}

// Define the initial state
const initialState: LoginState = {
    usersData: {},
    loading: false,
    error: null,
};

// Create an async thunk for fetching user data
export const GetUserData = createAsyncThunk('users/getusers', async ({ userid, params }: { userid: string, params: any }) => {
    const response = await axiosInstance.get(`/users/${userid}`);
    return response.data;
});

// Create a slice for user data functionality
const usersSlice = createSlice({
    name: 'usersdata',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(GetUserData.pending, (state) => {
                state.loading = true;
            })
            .addCase(GetUserData.fulfilled, (state, action) => {
                state.usersData = action.payload;
                state.loading = false;
            })
            .addCase(GetUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'An error occurred';
            });
    },
});

// Export the reducer to be used in the store
export default usersSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        suggestedUsers: [],
        userProfile: null,
        selectedUser: null
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.user = action.payload;
        },
        setSuggestedUsers: (state, action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },
        logoutUser: (state) => {
            state.user = null;
            state.userProfile = null;
            state.selectedUser = null;
        }

    }
});

export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setSelectedUser,
    logoutUser
} = authSlice.actions;


export default authSlice.reducer;

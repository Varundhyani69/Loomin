import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        }
    }
});

export const {
    addNotification,
    setNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;

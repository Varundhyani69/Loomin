import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    hasNewNotification: false, // this should NOT persist
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.hasNewNotification = true; // red dot ON when new notification arrives
        },
        setHasNewNotification: (state, action) => {
            state.hasNewNotification = action.payload; // set false when user checks notifications
        },
        setNotifications: (state, action) => {
            state.notifications = action.payload;
        }
    }
});

export const {
    addNotification,
    setHasNewNotification,
    setNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        notifications: [],
        hasNewNotification: false,
    },
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
        },
        setHasNewNotification: (state, action) => {
            state.hasNewNotification = action.payload;
        }
    }
});

export const {
    addNotification,
    setHasNewNotification // ✅ now exported
} = notificationSlice.actions;

export default notificationSlice.reducer;

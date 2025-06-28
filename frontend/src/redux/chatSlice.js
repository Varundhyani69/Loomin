import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
    },
    reducers: {
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setMessage: (state, action) => {
            state.messages = Array.isArray(action.payload) ? action.payload : [];
        },
        appendMessage: (state, action) => {
            const newMsg = action.payload;
            const exists = state.messages.some(msg => msg._id === newMsg._id);
            if (!exists) {
                state.messages.push(newMsg);
            }
        }
    },
});

export const {
    setOnlineUsers,
    setMessage,
    appendMessage,
} = chatSlice.actions;

export default chatSlice.reducer;

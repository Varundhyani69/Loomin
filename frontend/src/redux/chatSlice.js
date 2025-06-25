import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
        hasNewMessage: false,
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
        ,
        setHasNewMessage: (state, action) => {
            state.hasNewMessage = action.payload;
        }
    },
});

export const {
    setOnlineUsers,
    setMessage,
    appendMessage,
    setHasNewMessage // ✅ now exported
} = chatSlice.actions;

export default chatSlice.reducer;

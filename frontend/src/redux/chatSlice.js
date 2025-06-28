// chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
        hasNewMessage: false,
        newMessageFrom: [], // ✅ Track unread senders
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
        },
        setHasNewMessage: (state, action) => {
            state.hasNewMessage = action.payload;
        },
        addNewMessageSender: (state, action) => {
            const senderId = action.payload;
            if (!state.newMessageFrom.includes(senderId)) {
                state.newMessageFrom.push(senderId);
            }
        },
        clearNewMessageSender: (state, action) => {
            const senderId = action.payload;
            state.newMessageFrom = state.newMessageFrom.filter(id => id !== senderId);
        }
    },
});

export const {
    setOnlineUsers,
    setMessage,
    appendMessage,
    setHasNewMessage,
    addNewMessageSender,
    clearNewMessageSender
} = chatSlice.actions;

export default chatSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        onlineUsers: [],
        messages: [],
        hasNewMessage: false,
        newMessageFrom: [], // 🆕 users who sent unread messages
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
        addNewMessageFrom: (state, action) => {
            const senderId = action.payload;
            if (!state.newMessageFrom.includes(senderId)) {
                state.newMessageFrom.push(senderId);
            }
        },
        clearNewMessageFrom: (state, action) => {
            const userId = action.payload;
            state.newMessageFrom = state.newMessageFrom.filter(id => id !== userId);
        },
        clearAllNewMessageFrom: (state) => {
            state.newMessageFrom = [];
        }
    },
});

export const {
    setOnlineUsers,
    setMessage,
    appendMessage,
    setHasNewMessage,
    addNewMessageFrom,
    clearNewMessageFrom,
    clearAllNewMessageFrom
} = chatSlice.actions;

export default chatSlice.reducer;

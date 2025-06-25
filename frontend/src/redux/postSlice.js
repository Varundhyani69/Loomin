// postSlice.js
import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: "post",
    initialState: {
        posts: [],
        selectedPost: null,
    },
    reducers: {
        setPosts: (state, action) => {
            console.log("📦 setPosts called with:", action.payload);
            state.posts = action.payload;
        },
        setSelectedPost: (state, action) => {
            console.log("🎯 setSelectedPost:", action.payload);
            state.selectedPost = action.payload;
        },
    },
});

export const { setPosts, setSelectedPost } = postSlice.actions;
export default postSlice.reducer;

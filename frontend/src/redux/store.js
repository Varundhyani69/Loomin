// store.js
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authSlice from "./authSlice.js";
import postSlice from "./postSlice.js";
import chatSlice from "./chatSlice.js";
import notificationReducer from "./notificationSlice.js";

import {
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// 🟨 Persist config for notificationSlice to only persist 'notifications' array
const notificationPersistConfig = {
    key: "notification",
    storage,
    whitelist: ["notifications"], // ✅ only notifications, not hasNewNotification
};

// 🟦 Root Reducer with nested persistReducer for notification
const rootReducer = combineReducers({
    auth: authSlice,
    post: postSlice,
    chat: chatSlice,
    notification: persistReducer(notificationPersistConfig, notificationReducer), // ✅ wrapped
});

// 🟩 Persist full state
const persistConfig = {
    key: "root",
    version: 1,
    storage,
    blacklist: [], // no global blacklist here
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🧩 Store configuration
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export default store;

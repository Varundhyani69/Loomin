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
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const notificationPersistConfig = {
    key: "notification",
    storage,
    whitelist: ["notifications"],
};

const rootReducer = combineReducers({
    auth: authSlice,
    post: postSlice,
    chat: chatSlice,
    notification: persistReducer(notificationPersistConfig, notificationReducer),
});

const persistConfig = {
    key: "root",
    version: 1,
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

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

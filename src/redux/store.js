import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./auth/authSlice";
import profileReducer from "./profile/profileSlice";
import notificationReducer from "./notifications/notificationSlice";
import projectReducer from "./projects/projectSlice";
import billingReducer from "./billing/billingSlice";

const rootPersistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["auth", "profile", "notifications", "billing"], 
};

const authPersistConfig = {
  key: "auth",
  storage,
  blacklist: ["isLoading", "isInitialized"],
};

const profilePersistConfig = {
  key: "profile",
  storage,
  blacklist: ["isLoading", "error"],
};

const notificationPersistConfig = {
  key: "notifications",
  storage,
  blacklist: ["isLoading", "error"],
};

const projectPersistConfig = {
  key: "projects",
  storage,
  blacklist: ["isLoading", "error"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  profile: persistReducer(profilePersistConfig, profileReducer),
  notifications: persistReducer(notificationPersistConfig, notificationReducer),
  projects: persistReducer(projectPersistConfig, projectReducer),
  billing: billingReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

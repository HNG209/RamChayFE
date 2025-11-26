// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./services/baseApi"; // Chỉ cần import Base
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    // Reducer của Base API quản lý tất cả (Auth, Product...)
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

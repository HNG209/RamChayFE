// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./services/baseApi"; // Chỉ cần import Base
import authReducer from "./slices/authSlice";
import { injectStore } from "./axiosBaseQuery";

export const store = configureStore({
  reducer: {
    // Reducer của Base API quản lý tất cả (Auth, Product...)
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

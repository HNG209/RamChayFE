// redux/slices/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { MyProfile } from "@/types/backend";

interface AuthState {
  user: MyProfile | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.logout.matchFulfilled, // logout
      (state) => {
        state.user = null;
        state.isAuthenticated = false;
      }
    );

    // 1. Hứng Login thành công (như bài trước)
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        // ... lưu token ...
      }
    );

    // 2. Hứng GetProfile thành công (QUAN TRỌNG)
    builder.addMatcher(
      authApi.endpoints.getMyProfile.matchFulfilled,
      (state, action) => {
        // action.payload chính là thông tin user từ backend trả về
        state.user = action.payload;
        state.isAuthenticated = true;
      }
    );

    // 3. Nếu GetProfile thất bại (Token hết hạn/Cookie lỗi) -> Logout luôn
    builder.addMatcher(
      authApi.endpoints.getMyProfile.matchRejected,
      (state) => {
        state.user = null;
        state.isAuthenticated = false;
      }
    );
  },
});

export default authSlice.reducer;

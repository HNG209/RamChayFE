
import {
  GetItemsResponse,
  GetItemsResponseWithSelected,
  Page,
} from "@/types/backend";
import { cartApi } from "../services/cartApi";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  items: GetItemsResponseWithSelected[];
  currentPage: number;
}

const initialState: CartState = {
  items: [],
  currentPage: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Toggle các item được chọn
    toggleItemSelected: (state, action: PayloadAction<number[]>) => {
      const itemIds = action.payload;
      state.items.forEach((item) => {
        if (itemIds.includes(item.id)) {
          item.selected = !item.selected;
        }
      });
    },
  },
  extraReducers: (builder) => {
    // Có thể thêm các matcher từ cartApi ở đây nếu cần
    builder.addMatcher(
      cartApi.endpoints.getCartItems.matchFulfilled,
      (state, action: PayloadAction<Page<GetItemsResponse>>) => {
        // push các item vào state.items khi qua trang mới
        if (
          state.currentPage != 0 &&
          action.payload.page.number <= state.currentPage
        ) {
          return; // Nếu trang hiện tại >= trang đã lưu, không làm gì
        }
        state.items.push(
          ...action.payload.content.map((item) => ({
            ...item,
            selected: false,
          }))
        );
        state.currentPage = action.payload.page.number;
      }
    );

    builder.addMatcher(
      cartApi.endpoints.updateCartItem.matchFulfilled,
      (state, action) => {
        const { itemId, quantity } = action.meta.arg.originalArgs;

        // update state
        const item = state.items.find((x) => x.id === itemId);
        if (item) {
          item.quantity = quantity;
        }
      }
    );
  },
});

export const { toggleItemSelected } = cartSlice.actions;
export default cartSlice.reducer;

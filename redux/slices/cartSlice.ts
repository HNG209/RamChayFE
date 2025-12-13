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
  totalItems: number;
}

const initialState: CartState = {
  items: [],
  currentPage: 0,
  totalItems: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Toggle các item được chọn
    toggleItemSelected: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items.forEach((item) => {
        if (item.id === itemId) {
          item.selected = !item.selected;
        }
      });
    },
    // Xóa item khỏi giỏ hàng trong state
    deleteItem: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      state.totalItems -= 1;
    },
    // Toggle tất cả item
    toggleAllItemsSelected: (state) => {
      const allSelected = state.items.every((item) => item.selected);
      state.items.forEach((item) => {
        item.selected = !allSelected;
      });
    },
    // Chọn tất cả item
    selectAllItems: (state) => {
      state.items.forEach((item) => {
        item.selected = true;
      });
    },
    // Bỏ chọn tất cả item
    deselectAllItems: (state) => {
      state.items.forEach((item) => {
        item.selected = false;
      });
    },
    // Cập nhật số lượng item trong state
    updateItemQuantity: (
      state,
      action: PayloadAction<{ itemId: number; quantity: number }>
    ) => {
      const { itemId, quantity } = action.payload;
      const item = state.items.find((x) => x.id === itemId);
      if (item) {
        item.quantity = quantity;
      }
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
        // Thêm mới và lọc trùng lặp theo id
        const newItems = action.payload.content.map((item) => ({
          ...item,
          selected: false,
        }));
        // Gộp items cũ và mới, ưu tiên item mới nếu trùng id
        const itemsMap = new Map<number, GetItemsResponseWithSelected>();
        [...state.items, ...newItems].forEach((item) => {
          itemsMap.set(item.id, item);
        });
        state.items = Array.from(itemsMap.values());
        state.currentPage = action.payload.page.number;
        state.totalItems = action.payload.page.totalElements;
      }
    );
  },
});

export const {
  toggleItemSelected,
  toggleAllItemsSelected,
  deleteItem,
  updateItemQuantity,
  selectAllItems,
  deselectAllItems,
} = cartSlice.actions;
export default cartSlice.reducer;

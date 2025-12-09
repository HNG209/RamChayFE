import { ApiResponse, RagResponse } from "@/types/backend";
import { baseApi } from "./baseApi";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Gửi tin nhắn chat và nhận phản hồi
    sendMessage: builder.query<RagResponse, { message: string }>({
      query: (payload) => ({
        url: `/chat/ask?q=${encodeURIComponent(payload.message)}`,
        method: "GET",
      }),
    }),
  }),
  overrideExisting: false,
});

// Xuất Hooks riêng từ file này
export const { useLazySendMessageQuery } = chatApi;

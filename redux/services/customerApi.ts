import { CustomerUpdateRequest } from "@/types/backend";
import { baseApi } from "./baseApi";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Cập nhật thông tin profile của khách hàng
    updateMyProfile: builder.mutation<void, CustomerUpdateRequest>({
      query: (body) => ({
        url: `/customers`,
        method: "PUT",
        data: body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useUpdateMyProfileMutation } = customerApi;

import { baseApi } from "./baseApi";
import type { Address, AddressCreationRequest } from "@/types/backend";

export const addressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAddress: builder.mutation<Address, AddressCreationRequest>({
      query: (data) => ({
        url: "/addresses",
        method: "POST",
        data,
      }),
      invalidatesTags: ["User"], // Refresh user profile to get updated address list
    }),
    deleteAddress: builder.mutation<void, number>({
      query: (addressId) => ({
        url: `/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useCreateAddressMutation, useDeleteAddressMutation } = addressApi;

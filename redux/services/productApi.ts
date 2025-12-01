import { baseApi } from "./baseApi";
import { Product } from "@/types/backend";

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<Product[], { page?: number; size?: number } | void>({
            query: (params) => ({
                url: "/products",
                method: "GET",
                params: params || { page: 0, size: 50 },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((p) => ({ type: "Product" as const, id: p.id })),
                        { type: "Product", id: "LIST" },
                    ]
                    : [{ type: "Product", id: "LIST" }],
        }),
    }),
    overrideExisting: false,
});

export const { useGetProductsQuery } = productApi;

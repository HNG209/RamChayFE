// redux/services/productApi.ts
import { baseApi } from "./baseApi";
import { Page, Product } from "@/types/backend";

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<
            Product[],
            { page?: number; size?: number; search?: string }
        >({
            query: ({ page = 0, size = 20, search }) => ({
                url: "/products",
                method: "GET",
                params: { page, size, search },
            }),
            providesTags: ["Product"],
            // Transform response to add images alias
            transformResponse: (response: Product[]) => {
                return response.map(product => ({
                    ...product,
                    images: product.mediaList || []
                }))
            }
        }),

        getProductById: builder.query<Product, number>({
            query: (id) => ({
                url: `/products/${id}`,
                method: "GET",
            }),
            providesTags: ["Product"],
            // Transform response to add images alias
            transformResponse: (response: Product) => ({
                ...response,
                images: response.mediaList || []
            })
        }),
    }),
    overrideExisting: false,
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productApi;

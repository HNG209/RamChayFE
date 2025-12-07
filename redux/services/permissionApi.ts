import { baseApi } from "./baseApi";

export const managerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllPermisson: builder.query<any, void>({
            query: () => ({
                url: `/permissions`,
                method: "GET",
            }),
            providesTags: ["Permisson"],
        }),

        createPermisison: builder.mutation<any, any>({
            query: (body) => ({
                url: `/permissions`,
                method: "POST",
                data: body,
            }),
            invalidatesTags: ["Permisson"],
        }),
    }),
    overrideExisting: false,
});

export const {

    useGetAllPermissonQuery,
    useCreatePermisisonMutation
} = managerApi;

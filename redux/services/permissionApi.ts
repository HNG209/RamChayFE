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

    }),
    overrideExisting: false,
});

export const {

    useGetAllPermissonQuery
} = managerApi;

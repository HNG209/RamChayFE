import { baseApi } from "./baseApi";

export const managerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        //GET ROLE
        getRole: builder.query<any, void>({
            query: () => ({
                url: `/roles`,
                method: "GET",
            }),
            providesTags: ["Role"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetRoleQuery
} = managerApi;

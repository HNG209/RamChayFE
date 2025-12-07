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

        getAllRole: builder.query<any, void>({
            query: () => ({
                url: `/roles/getAll`,
                method: "GET",
            }),
            providesTags: ["Role"],
        }),
        // update
        updateRole: builder.mutation<any, { id: number; body: any }>({

            query: ({ id, body }) => ({
                url: `/roles/${id}`,
                method: "PUT",
                data: body,
                headers: {
                    "Content-Type": "application/json",
                },
            }),
            invalidatesTags: ["Role"],
        }),

        createRole: builder.mutation<any, any>({
            query: (body) => ({
                url: `/roles`,
                method: "POST",
                data: body,
            }),
            invalidatesTags: ["Role"],
        }),

        // findbyid
        getRoleById: builder.query<any, number>({
            query: (id) => ({
                url: `/roles/find/${id}`,
                method: "GET",
            }),
            providesTags: ["Role"],
        }),
        // xoa 
        deleteRole: builder.mutation<any, number>({
            query: (id) => ({
                url: `/roles/delete/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["Role"], // cập nhật lại danh sách role sau khi xoá
        }),
        //pagin
        paginRole: builder.query<any, { page: number; pageSize: number; keyWord: string }>({
            query: ({ page, pageSize, keyWord }) => ({
                url: `/roles/page?page=${page}&pageSize=${pageSize}&keyWord=${keyWord}`,
                method: "GET",
            }),
            providesTags: ["Role"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetRoleQuery,
    useGetAllRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useGetRoleByIdQuery,
    useDeleteRoleMutation,
    usePaginRoleQuery
} = managerApi;

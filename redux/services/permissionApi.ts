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
        paginPermission: builder.query<any, { page: number; pageSize: number; keyWord: string }>({
            query: ({ page, pageSize, keyWord }) => ({
                url: `/permissions/page?page=${page}&pageSize=${pageSize}&keyWord=${keyWord}`,
                method: "GET",
            }),
            providesTags: ["Permisson"],
        }),
        deletePermission: builder.mutation<any, number>({
            query: (id) => ({
                url: `/permissions/delete/${id}`,
                method: "POST",
            }),
            invalidatesTags: ["Permisson"], // cập nhật lại danh sách role sau khi xoá
        }),
    }),
    overrideExisting: false,
});

export const {

    useGetAllPermissonQuery,
    useCreatePermisisonMutation,
    usePaginPermissionQuery,
    useDeletePermissionMutation
} = managerApi;

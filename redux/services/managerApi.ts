import { baseApi } from "./baseApi";

export const managerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    //SEARCH (GET)
    searchManagers: builder.query<any, { keyword: string; page: number }>({
      query: ({ keyword, page }) => ({
        url: `/managers/search`,
        method: "GET",
        params: { keyword, page },
      }),
      providesTags: ["Manager"],
    }),

    //CREATE (POST /managers)
    createManager: builder.mutation<any, any>({
      query: (body) => ({
        url: `/managers`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Manager"],
    }),

    getManagerById: builder.query<any, number>({
      query: (id) => ({
        url: `/managers/find/${id}`,
        method: "GET",
      }),
      providesTags: ["Manager"],
    }),

    updateManager: builder.mutation<any, { id: number; body: any }>({
      query: ({ id, body }) => ({
        url: `/managers/${id}`,
        method: "PUT",
        data: body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Manager"],
    }),

    paginManager: builder.query<any, { page: number; pageSize: number;keyWord:string }>({
      query: ({ page, pageSize,keyWord }) => ({
        url: `/managers/page?page=${page}&pageSize=${pageSize}&keyWord=${keyWord}`,
        method: "GET",
      }),
      providesTags: ["Manager"],
    }),


    deleteManager: builder.mutation<any, number>({
      query: (id) => ({
        url: `/managers/delete/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Manager"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useSearchManagersQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
  useGetManagerByIdQuery,
  usePaginManagerQuery
} = managerApi;

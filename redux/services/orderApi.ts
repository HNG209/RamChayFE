// redux/services/orderApi.ts
import { baseApi } from "./baseApi";
import {
  OrderCreationRequest,
  OrderCreationResponse,
  OrderDetail,
  OrderDetailBackendResponse,
  OrderListItem,
  Page,
} from "@/types/backend";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<OrderCreationResponse, OrderCreationRequest>({
      query: (data: OrderCreationRequest) => ({
        url: "/orders",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Cart", "Order"], // Invalidate cart and order list
    }),

    getOrderById: builder.query<OrderDetail, number>({
      query: (orderId: number) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      transformResponse: (response: OrderDetailBackendResponse): OrderDetail => {
        return {
          id: response.id,
          customerId: response.customer.id,
          customerName: response.customer.fullName || response.customer.username,
          receiverName: response.receiverName,
          receiverPhone: response.receiverPhone,
          shippingAddress: response.shippingAddress,
          paymentMethod: response.paymentMethod as any,
          totalAmount: response.total,
          orderStatus: response.orderStatus as any,
          createdAt: response.orderDate,
          updatedAt: response.orderDate, // Backend doesn't have updatedAt, use orderDate
          items: response.orderDetails.map((detail) => ({
            id: detail.id,
            productId: detail.product.id,
            productName: detail.product.name,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
            indexImage: detail.product.indexImage,
          })),
        };
      },
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),

    getMyOrders: builder.query<Page<OrderListItem>, { page?: number; size?: number }>({
      query: ({ page = 0, size = 10 }) => ({
        url: "/orders",
        method: "GET",
        params: { page, size },
      }),
      providesTags: ["Order"],
    }),

    trackOrder: builder.query<OrderDetail, { orderId: number; phone: string }>({
      query: ({ orderId, phone }) => ({
        url: `/orders/track/${orderId}`,
        method: "GET",
        params: { phone },
      }),
      transformResponse: (response: OrderDetailBackendResponse): OrderDetail => {
        return {
          id: response.id,
          customerId: response.customer.id,
          customerName: response.customer.fullName || response.customer.username,
          receiverName: response.receiverName,
          receiverPhone: response.receiverPhone,
          shippingAddress: response.shippingAddress,
          paymentMethod: response.paymentMethod as any,
          totalAmount: response.total,
          orderStatus: response.orderStatus as any,
          createdAt: response.orderDate,
          updatedAt: response.orderDate,
          items: response.orderDetails.map((detail) => ({
            id: detail.id,
            productId: detail.product.id,
            productName: detail.product.name,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
            indexImage: detail.product.indexImage,
          })),
        };
      },
    }),

    // Admin endpoints
    getAllOrders: builder.query<OrderDetailBackendResponse[], void>({
      query: () => ({
        url: "/orders/manager/all",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<void, { orderId: number; orderStatus: string }>({
      query: ({ orderId, orderStatus }) => ({
        url: `/orders/manager/${orderId}/status`,
        method: "PUT",
        data: { orderStatus },
      }),
      invalidatesTags: ["Order"],
    }),

    getOrderByIdForManager: builder.query<OrderDetail, number>({
      query: (orderId: number) => ({
        url: `/orders/manager/${orderId}`,
        method: "GET",
      }),
      transformResponse: (response: OrderDetailBackendResponse): OrderDetail => {
        return {
          id: response.id,
          customerId: response.customer.id,
          customerName: response.customer.fullName || response.customer.username,
          receiverName: response.receiverName,
          receiverPhone: response.receiverPhone,
          shippingAddress: response.shippingAddress,
          paymentMethod: response.paymentMethod as any,
          totalAmount: response.total,
          orderStatus: response.orderStatus as any,
          createdAt: response.orderDate,
          updatedAt: response.orderDate,
          items: response.orderDetails.map((detail) => ({
            id: detail.id,
            productId: detail.product.id,
            productName: detail.product.name,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            subtotal: detail.subtotal,
            indexImage: detail.product.indexImage,
          })),
        };
      },
      providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useLazyTrackOrderQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetOrderByIdForManagerQuery,
} = orderApi;

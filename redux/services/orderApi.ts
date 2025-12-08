// redux/services/orderApi.ts
import { baseApi } from "./baseApi";
import { OrderCreationRequest, OrderCreationResponse, OrderDetail, OrderDetailBackendResponse } from "@/types/backend";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<OrderCreationResponse, OrderCreationRequest>({
      query: (data: OrderCreationRequest) => ({
        url: "/orders",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["Cart"], // Invalidate cart after order creation
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
  }),
  overrideExisting: false,
});

export const { useCreateOrderMutation, useGetOrderByIdQuery } = orderApi;

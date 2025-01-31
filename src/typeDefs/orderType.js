const { gql } = require("apollo-server-express");

const razorpayType = gql`
  type PaymentVerificationResponse {
    success: Boolean!
    message: String
  }

  enum TimeRange {
    TODAY
    YESTERDAY
    THIS_MONTH
    THIS_YEAR
  }

  type Order {
    id: ID!
    userId: String!
    items: [OrderProduct!]!
    totalAmount: Float!
    status: String!
    paymentMode: String!
    orderId: String!
    paymentStatus: String!
    shippingAddress: ShippingAddress
    paymentId: String
    createdAt: String!
    updatedAt: String!
    orderSummary: OrderSummary
  }

  type OrderSummary {
    couponDiscount: String!
    subTotal: Float!
    discount: Float!
    deliveryCharge: Float!
    totalAmount: Float!
  }
  input OrderSummaryInput {
    couponDiscount: String!
    subTotal: Float!
    discount: Float!
    deliveryCharge: Float!
    totalAmount: Float!
  }

  type OrderProduct {
    product: Product!
    quantity: Int!
    variant: Variant
    price: Float!
    discount: Float!
    mrp: Float!
  }

  input OrderProductInput {
    product: ID!
    variant: ID
    quantity: Int!
    price: Float!
    discount: Float!
    mrp: Float!
  }

  input ShippingAddressInput {
    firstName: String!
    lastName: String!
    email: String!
    phoneNumber: String!
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }

  type ShippingAddress {
    firstName: String!
    lastName: String!
    email: String!
    phoneNumber: String!
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }

  type PaginatedOrders {
    orders: [Order!]!
    totalPages: Int!
    currentPage: Int!
    }
  type OrderResponse {
    orders: [Order!]!
    totalCount: Int!
  }

  type Query {
    getOrderCounts(startDate: String, endDate: String): OrderCounts!
  }

  type OrderCounts {
    cancelledOrder: Int!
    shippedOrder: Int!
    deliveredOrder: Int!
    paymentPaid: Int!
    paymentUnpaid: Int! 
    progressOrder: Int!
  }

  extend type Query {
    getOrdersByCustomer( 
    page: Int = 1,
    status: String,
    paymentStatus: String,
    startDate: String,
    endDate: String
    ): PaginatedOrders
    getOrdersByAdmin(
    page: Int = 1,
    status: String,
    paymentStatus: String,
    startDate: String,
    endDate: String
  ): PaginatedOrders
    getOrderById(id: ID!): Order
    getOrders(
      status: String
      paymentStatus: String
      startDate: String
      endDate: String
      page: Int = 1
      limit: Int = 10
    ): OrderResponse!
    getOrderCount: Int!
  }

  extend type Mutation {
    createOrder(
      userId: String!
      items: [OrderProductInput!]!
      totalAmount: Float!
      status: String
      paymentMode: String!
      paymentStatus: String!
      shippingAddress: ShippingAddressInput!
      orderSummary: OrderSummaryInput!
    ): Order

    updateOrder(
      orderId: ID!
      userId: String!
      items: [OrderProductInput!]!
      status: String
      paymentMode: String!
      paymentStatus: String!
      shippingAddress: ShippingAddressInput!
      orderSummary: OrderSummaryInput!
    ): Order

    updateOrderStatus(id: ID!, status: String!): Order
    deleteOrder(id: ID!): DeletionResponse!
    verifyPayment(
      razorpayOrderId: String!
      razorpayPaymentId: String!
      razorpaySignature: String!
    ): PaymentVerificationResponse
    updatePaymentStatus(orderId: ID!, paymentStatus: String!): Order
    cancelOrder(id: ID!): Order
  }

  type DeletionResponse {
    success: Boolean!
    message: String
  }
`;

module.exports = razorpayType;

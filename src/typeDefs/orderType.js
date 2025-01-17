const { gql } = require("apollo-server-express");

const razorpayType = gql`
  type PaymentVerificationResponse {
    success: Boolean!
    message: String
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

  extend type Query {
    getOrdersByCustomer(page: Int): PaginatedOrders
    getOrdersByAdmin(page: Int): PaginatedOrders
    getOrderById(id: ID!): Order
    getOrders(status: String!, paymentStatus: String! ,page: Int): PaginatedOrders
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
    orderId: ID!,
    userId: String!,
    items: [OrderProductInput!]!
    status: String,
    paymentMode: String!
    paymentStatus: String!,
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

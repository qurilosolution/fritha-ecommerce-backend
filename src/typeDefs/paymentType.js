const { gql } = require('apollo-server-express');
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
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }
  type ShippingAddress {
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }
  extend type Query {
    hello : String
    getOrders: [Order!]!
    getOrderById(id: ID!): Order
  }
  extend type Mutation {
    createOrder(
      userId: String!
      items: [OrderProductInput!]!
      totalAmount: Float!
      paymentId: String!
      status: String!
      paymentMode: String!
      paymentStatus: String!
      shippingAddress: ShippingAddressInput!
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
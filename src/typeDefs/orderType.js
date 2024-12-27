const { gql } = require("apollo-server-express");

const orderType = gql`
  type Order {
    id: ID!
    customer: String!
    products: [OrderProduct!]
    totalAmount: Float!
    status: String!
    createdAt: String!
  }

  type OrderProduct {
    product: Product!
    quantity: Int!
    price: Float!
    discount: Float!
    mrp: Float!
  }

  input OrderProductInput {
    product: ID!
    quantity: Int!
    
  }

  extend type Query {
    getOrders: [Order!]!
    getOrderById(id: ID!): Order
  }

  extend type Mutation {
    createOrder(customer: String!, products: [OrderProductInput!]!, status: String!): Order
    updateOrderStatus(id: ID!, status: String!): Order
    deleteOrder(id: ID!): DeletionResponse!
  }

  type DeletionResponse {
    success: Boolean!
    message: String
  }
`;

module.exports = orderType;

const { gql } = require('apollo-server-express');

const razorpayType = gql`
  type RazorpayOrder {
    id: String!
    entity: String
    amount: Int!
    amount_paid: Int
    amount_due: Int
    currency: String!
    receipt: String
    status: String
    attempts: Int
    created_at: Int
  }

  type PaymentVerificationResponse {
    success: Boolean!
    message: String
  }

  type Query {
    hello: String
  }

  type Mutation {
     Order(amount: Int!, currency: String!): RazorpayOrder
    verifyPayment(
      razorpayOrderId: String!
      razorpayPaymentId: String!
      razorpaySignature: String!
    ): PaymentVerificationResponse
  }
`;

module.exports = razorpayType;

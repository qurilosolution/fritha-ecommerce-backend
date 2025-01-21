const { gql } = require('apollo-server-express');
const razorpayType = gql`
  type PaymentVerificationResponse {
    success: Boolean!
    message: String
  }

  

  extend type Mutation { 
   
    verifyPayment(
      razorpayOrderId: String!
      razorpayPaymentId: String!
      razorpaySignature: String!
    ): PaymentVerificationResponse
  
   
  }

  type DeletionResponse {
    success: Boolean!
    message: String
  }
`;
module.exports = razorpayType;
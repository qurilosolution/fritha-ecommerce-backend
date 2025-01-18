
 

const { gql } = require("apollo-server-express");

const couponType = gql`

  type Coupon {
    id: ID!
    code: String!
    discountValue: Float # Unified discount value (either flat or percentage)
    couponType: String # Enum value: 'flat' or 'percentage'
    applicableProducts: [Product!] # List of applicable products
    startDate: String!
    endDate: String!
    maxUsage: Int!
    status: String!
    deletedAt: String
  }

  type Product {
    id: ID!
    name: String!
  }

  type CouponValidationResponse {
    isValid: Boolean!
    message: String
    coupon: Coupon
  }

  type Query {
    getCoupon(id: ID!): Coupon 
    listCoupons: [Coupon!] 
    validateCoupon(couponCode: String!, customerId: ID!): CouponValidationResponse! # Validate a coupon with customer ID
  }

  type Mutation {
    createCoupon(
      code: String!
      discountValue: Float! # Discount value can be either flat or percentage
      couponType: String! # Enum: 'flat' or 'percentage'
      applicableProducts: [ID!]!
      startDate: String!
      endDate: String!
      maxUsage: Int!
      status: String
    ): Coupon # Create a new coupon

    updateCoupon(
      id: ID!
      code: String
      discountValue: Float
      couponType: String
      applicableProducts: [ID!]
      startDate: String
      endDate: String
      maxUsage: Int
      status: String
    ): Coupon # Update an existing coupon

    deleteCoupon(id: ID!): Coupon 
  }
`;

module.exports = couponType;

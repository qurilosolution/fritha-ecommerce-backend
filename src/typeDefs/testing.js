const { gql } = require('apollo-server-express');

const authTypeee = gql`
  # GraphQL Schema for Customer

type Address {
  name: String!
  streetAddress: String!
  city: String!
  state: String!
  country: String!
  pincode: String!
  phone: String!
  email: String!
  isDefault: Boolean
  type: String!
}

type CouponUsage {
  couponId: ID
  usedAt: String
  couponUsageCount: Int
}

type Customer {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  phoneNumber: String
  password: String!
  gender: String
  birthDate: String
  addresses: [Address]
  couponUsed: [CouponUsage]
}

input AddressInput {
  name: String!
  streetAddress: String!
  city: String!
  state: String!
  country: String!
  pincode: String!
  phone: String!
  email: String!
  isDefault: Boolean
  type: String!
}

input CouponUsageInput {
  couponId: ID
  usedAt: String
  couponUsageCount: Int
}

input CustomerInput {
  firstName: String!
  lastName: String!
  email: String!
  phoneNumber: String
  password: String!
  gender: String
  birthDate: String
  addresses: [AddressInput]
  couponUsed: [CouponUsageInput]
}

type Query {
  getCustomer(id: ID!): Customer
  listCustomers: [Customer]
}

type Mutation {
  createCustomer(input: CustomerInput): Customer
  updateCustomer(id: ID!, input: CustomerInput): Customer
  addAddress(customerId: ID!, address: AddressInput): Customer
  addCouponUsage(customerId: ID!, couponUsage: CouponUsageInput): Customer
}

`;

module.exports = authTypeee;

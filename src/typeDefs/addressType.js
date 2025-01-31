const {gql}=require('apollo-server-express');

const addressType=gql`
type Address {
    id: ID!
    firstName: String!
    lastName: String
    streetAddress: String!
    city: String!
    state: String!
    country: String!
    pincode: String!
    phone: String!
    email: String!
    isDefault: Boolean
    type: String
    createdAt: String!
}
input AddressInput {
    firstName: String!
    lastName: String
    streetAddress: String!
    city: String!
    state: String!
    country: String!
    pincode: String!
    phone: String!
    email: String!
    isDefault: Boolean
    type: String
}
type DeletionResponse {
    success: Boolean!
    message: String
}
  extend type Query {
    getAddresses: [Address]
    getDefaultAddress: Address
  }
  extend type Mutation {
    createAddress(input: AddressInput): Address
    updateAddress(id,:ID!,input: AddressInput): Address
    deleteAddress(id: ID!): Address
    
}
`;
module.exports=addressType;
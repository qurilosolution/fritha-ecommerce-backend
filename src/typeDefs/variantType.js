const { gql } = require("apollo-server-express");

const variantType = gql`
  scalar Date
  scalar Upload
  type Variant {
    id: ID
    size: Int
    pack: Int
    price: Int
    usp: String
    mrp: Float
    stock: Int
    discount: Float
    pricePerUnit: Float
    pricePerUnitDiscount: Float
    combo: String
    isStock: Boolean
    imageUrl: [String]
    netContent: String
    salePrice: Float
    saleStartDate: Date
    saleEndDate: Date
    isOnSale: Boolean
    publicIds: [String]
    
  }

  type VariantResponse {
    success: Boolean
    message: String
    variants: [Variant]
  }
  
  type VariantResponseDelete{
     success:Boolean
     message:String
  }
 
 
  input VariantInput {
    id: ID
    size: Int
    pack: Int
    usp: String
    price: Int
    mrp: Float
    stock: Int
    discount: Int
    pricePerUnit: Float
    pricePerUnitDiscount: Float
    combo: String
    isStock: Boolean
    imageUrl: [Upload]
    netContent: String
    salePrice: Float
    saleStartDate: Date
    saleEndDate: Date
    isOnSale: Boolean
    publicIds: [String]
   
  }

  type Query {
    getVariantsByProduct(productId: ID!): VariantResponse
  }

  type Mutation {
    addVariant(productId: ID!, variantData: VariantInput!): VariantResponse 
    addMultipleVariants(productId: ID!, variantsData: [VariantInput]!): VariantResponse
    updateVariant(variantId: ID!, updateData: VariantInput!): VariantResponse
    deleteVariant(variantId: ID!): VariantResponseDelete 
   
  }
`;

module.exports = variantType;

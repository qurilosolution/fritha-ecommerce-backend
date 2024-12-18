const { gql } = require("apollo-server-express");

const productType = gql`
  type Variant {
    size: Int
    pack: Int
    mrp: Float
    discount: Float
    discountPrice: Float
    pricePerUnitDiscount: Float
    combo: String
    pricePerUnit: Float
    isOutOfStock: Boolean
    imageUrl: [String]
    netContent: String
    salePrice: Float
    saleStartDate: Date
    saleEndDate: Date
    isOnSale: Boolean
  }

  type PriceDetails {
    specialPrice: Float
    mrp: Float
    inclusiveOfTaxes: Boolean
  }
 
  type Product {
    id: ID!
    name: String!
    category: Category
    subcategory: Subcategory
    description: String
    keyBenefits: [String]
    reviews: Int
    imageUrl: [String]
    netContent: String
    priceDetails: PriceDetails
    variants: [Variant!]
    usp: String
    ingredients: [String]
    keyFeatures: String
    additionalDetails: String
    createdAt: String
    totalReviews: Int
    averageRating: Float
    isBestSeller: Boolean
  }

  extend type Query {
    getProducts: [Product]
    getProductById(id: ID!): Product
    getBestSellers: [Product]
  }
  scalar Upload
  input CreateProductInput {
  id:ID
  name: String!
  category: ID!
  subcategory:ID!
  description: String
  keyBenefits: [String]
  reviews: Int
  netContent: String
  priceDetails: PriceDetailsInput
  variants: [VariantInput!]
  usp: String
  ingredients: [String]
  keyFeatures: String
  additionalDetails: String
  totalReviews: Int
  averageRating: Float
  isBestSeller: Boolean
  imageUrl: Upload
}

scalar Upload
 extend type Mutation {
  createProduct(input: CreateProductInput!, imageUrl: Upload , variants: [VariantInput!]): Product 
  updateProduct(
    id: ID
    input: CreateProductInput!
    publicIds: [String] 
    newImages: Upload
  ): Product
  deleteProduct(id: ID!): DeletionResponse!
  refreshBestSellers: RefreshResponse
}
  input PriceDetailsInput {
    specialPrice: Float
    mrp: Float
    inclusiveOfTaxes: Boolean
  }
  scalar Upload
  type DeletionResponse {
    success: Boolean!
    message: String
  }

  type RefreshResponse {
    success: Boolean!
    message: String
  }
  scalar Date
  scalar Upload
  input VariantInput {
    id: ID
    size: Int
    pack: Int
    discountPrice: Float
    mrp: Float
    discount: Float
    pricePerUnit: Float
    pricePerUnitDiscount: Float
    combo: String
    isOutOfStock: Boolean
    imageUrl: Upload
    netContent: String
    salePrice: Float
    saleStartDate: Date
    saleEndDate: Date
    isOnSale: Boolean
    publicIds: [String]
  }
 
`;

module.exports = productType;

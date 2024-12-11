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
    description: String
    keyBenefits: [String]
    reviews: Int
    imageUrl: [String]
    netContent: String
    priceDetails: PriceDetails
    variants: [Variant]
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

  input CreateProductInput {
  name: String!
  category: ID!
  description: String
  keyBenefits: [String]
  reviews: Int
  
  netContent: String
  priceDetails: PriceDetailsInput
  variants: [VariantInput]
  usp: String
  ingredients: [String]
  keyFeatures: String
  additionalDetails: String
  totalReviews: Int
  averageRating: Float
  isBestSeller: Boolean
}

extend type Mutation {
  createProduct(input: CreateProductInput! ,imageUrl: Upload!): Product
  updateProduct(
    id: ID!
    name: String!
    category: ID!
    subcategory: ID!
    description: String
    keyBenefits: [String!]
    imageUrl: [Upload!]
    netContent: String
    priceDetails: PriceDetailsInput
    variants: [ID!]!
    usp: String
    ingredients: [String!]
    keyFeatures: String
    additionalDetails: String
    createdAt: String!
    totalReviews: Int
    averageRating: Int
    isBestSeller: Boolean!
  ): Product


    deleteProduct(id: ID!): DeletionResponse
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
    imageUrl: [Upload!]
    netContent: String
    salePrice: Float
    saleStartDate: Date
    saleEndDate: Date
    isOnSale: Boolean
   
  }
 
`;

module.exports = productType;

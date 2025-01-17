const { gql } = require("apollo-server-express");

const productType = gql`
  scalar Date
  scalar Upload

  enum SortOption {
    PRICE_HIGH_TO_LOW
    PRICE_LOW_TO_HIGH
    RATING
  }

  type PaginatedProducts {
    products: [Product]
    currentPage: Int!
    totalPages: Int!
    totalProducts: Int!
  }

  type AdditionalDetails {
    genericName: String!
    dimensions: String!
    marketedBy: String!
    countryOfOrigin: String!
    bestBefore: Date
    manufacture: String!
    licenseNo: String!
    customerCareDetails: String!
  }

  type Product {
    id: ID!
    name: String!
    title: String
    slugName: String!
    category: Category
    subcategory: Subcategory
    description: String
    price: Int
    stock: Int
    mrp: Int
    discount: Int
    isStock: Boolean
    keyBenefits: [String]
    reviews: [Review!]!
    imageUrl: [String]
    inclusiveOfTaxes: Boolean
    netContent: String
    variants: [Variant!]!
    usp: String
    ingredients: [String]
    keyFeatures: [String]
    additionalDetails: AdditionalDetails
    createdAt: String
    totalReviews: Int
    averageRating: Float
    isBestSeller: Boolean
    publicIds: [String]
  }

  input AdditionalDetailsInput {
    genericName: String!
    dimensions: String!
    marketedBy: String!
    countryOfOrigin: String!
    bestBefore: Date
    manufacture: String!
    licenseNo: String!
    customerCareDetails: String!
  }

  input CreateProductInput {
    id: ID
    name: String!
    title: String
    slugName: String
    category: ID!
    subcategory: ID!
    description: String
    keyBenefits: [String]
    reviews: ID
    discount: Int
    price: Int
    mrp: Int
    imageUrl: [Upload]
    stock: Int
    isStock: Boolean
    netContent: String
    variants: [VariantInput]
    usp: String
    ingredients: [String]
    keyFeatures: [String]
    additionalDetails: AdditionalDetailsInput
    totalReviews: Int
    averageRating: Float
    isBestSeller: Boolean
    
  }

  extend type Query {
    getProducts(page: Int, search: String, sort: SortOption): PaginatedProducts
    getProductById(id: ID!): Product
    getProductByslugName(slugName: String!): Product
    getBestSellers(categoryId: ID): [Product!]!
  }

  extend type Mutation {
    createProduct(input: CreateProductInput!): Product
    updateProduct(
      id: ID
      input: CreateProductInput!
      publicIds: [String]
    ): Product
    deleteProduct(id: ID!): DeletionResponse!
    refreshBestSellers: RefreshResponse
  }

  type DeletionResponse {
    success: Boolean!
    message: String
  }

  type RefreshResponse {
    success: Boolean!
    message: String
  }
`;

module.exports = productType;

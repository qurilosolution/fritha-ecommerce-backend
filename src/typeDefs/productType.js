const { gql } = require("apollo-server-express");
const productType = gql`
  type Variant {
    size: Int
    pack: Int
    price: Int
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
    publicIds: String
  }
  
  type Product {
    id: ID!
    name: String!
    category: Category
    subcategory: Subcategory
    description: String
    price: Int
    stock:Int
    mrp:Int
    isStock: Boolean
    keyBenefits: [String]
    reviews: Int
    imageUrl: [String]
    newImages:[String]
    discount :Int
    inclusiveOfTaxes: Boolean
    netContent: String
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
  price: Int
  mrp:Int
  stock:Int
  isStock: Boolean
  netContent: String
  discount :Int
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
    price: Int
    mrp: Float
    stock:Int
    discount: Int
    pricePerUnit: Float
    pricePerUnitDiscount: Float
    combo: String
    isStock: Boolean
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
// const { gql } = require("apollo-server-express");
// const productType = gql`
//   type Variant {
//     id : Int
//     size: Int
//     pack: Int
//     price: Int
//     mrp: Float
//     stock: Int
//     discount: Float
//     pricePerUnit: Float
//     pricePerUnitDiscount: Float
//     combo: String
//     isStock: Boolean
//     imageUrl: [String]
//     netContent: String
//     salePrice: Float
//     saleStartDate: Date
//     saleEndDate: Date
//     isOnSale: Boolean
//     publicIds: [String]
//     newImages:[String]
//   }

//   type Product {
//     id: ID!
//     name: String!
//     category: Category
//     subcategory: Subcategory
//     description: String
//     price: Int
//     stock:Int
//     mrp:Int
//     isStock: Boolean
//     keyBenefits: [String]
//     review: Int
//     imageUrl: [String]
//     discount :Int
//     inclusiveOfTaxes: Boolean
//     netContent: String
//     variants: [Variant!]
//     usp: String
//     ingredients: [String]
//     keyFeatures: String
//     additionalDetails: String
//     createdAt: String
//     totalReviews: Int
//     averageRating: Float
//     isBestSeller: Boolean
//     publicIds:[String]
//     newImages:[String]
//   }
//   extend type Query {
//     getProducts: [Product]
//     getProductById(id: ID!): Product
//     getBestSellers: [Product]
//   }
//   scalar Upload
//   input CreateProductInput {
//   id:ID
//   name: String!
//   category: ID!
//   subcategory:ID!
//   description: String
//   keyBenefits: [String]
//   review: Int
//   price: Int
//   mrp:Int
//   imageUrl:[Upload]
//   stock:Int
//   isStock: Boolean
//   netContent: String
//   discount :Int
//   variants: [VariantInput!]
//   usp: String
//   ingredients: [String]
//   keyFeatures: String
//   additionalDetails: String
//   totalReviews: Int
//   averageRating: Float
//   isBestSeller: Boolean
// }

// scalar Upload
//  extend type Mutation {
//   createProduct(input: CreateProductInput!): Product

//   updateProduct(
//     id: ID
//     input: CreateProductInput!
//     publicIds: [String]
//     newImages: [Upload]
//   ): Product
//   deleteProduct(id: ID!): DeletionResponse!
//   refreshBestSellers: RefreshResponse
// }

//   scalar Upload
//   type DeletionResponse {
//     success: Boolean!
//     message: String
//   }
//   type RefreshResponse {
//     success: Boolean!
//     message: String
//   }
//   scalar Date
//   scalar Upload
//   input VariantInput {
//     id: ID
//     size: Int
//     pack: Int
//     price: Int
//     mrp: Float
//     stock:Int
//     discount: Int
//     pricePerUnit: Float
//     pricePerUnitDiscount: Float
//     combo: String
//     isStock: Boolean
//     imageUrl: [Upload]
//     netContent: String
//     salePrice: Float
//     saleStartDate: Date
//     saleEndDate: Date
//     isOnSale: Boolean
//     publicIds: [String]
//     newImages:[Upload]

//   }
// `;
// module.exports = productType;

const { gql } = require("apollo-server-express");

const productType = gql`
  scalar Date
  scalar Upload
  type Product {
    id: ID!
    name: String!
    slugName: String!
    category: Category
    subcategory: Subcategory
    description: String
    price: Int
    stock: Int
    mrp: Int
    isStock: Boolean
    keyBenefits: [String]
    reviews: [Review!]
    imageUrl: [String]
    discount: Int
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
    publicIds: [String]
    newImages: [String]
  }
  type PaginatedProducts {
    products: [Product]
    currentPage: Int!
    totalPages: Int!
    totalProducts: Int!
  }

  input CreateProductInput {
    id: ID
    name: String!
    slugName: String
    category: ID!
    subcategory: ID!
    description: String
    keyBenefits: [String]
    reviews: [ReviewInput!]
    price: Int
    mrp: Int
    imageUrl: [Upload]
    stock: Int
    isStock: Boolean
    netContent: String
    discount: Int
    variants: [VariantInput!]
    usp: String
    ingredients: [String]
    keyFeatures: String
    additionalDetails: String
    totalReviews: Int
    averageRating: Float
    isBestSeller: Boolean
  }

  extend type Query {
    getProducts(page: Int, limit: Int): PaginatedProducts
    
    getProductById(id: ID!): Product
    getProductByslugName(slugName: String!): Product
    getBestSellers: [Product]
  }

  extend type Mutation {
    createProduct(input: CreateProductInput!): Product
    updateProduct(
      id: ID
      input: CreateProductInput!
      publicIds: [String]
      newImages: [Upload]
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

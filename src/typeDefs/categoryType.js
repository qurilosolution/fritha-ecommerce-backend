  

const { gql } = require('apollo-server-express');

const categoryType = gql`
scalar Upload 
  type Category {
    id: ID!
    name: String!
    description: String
    createdAt: String
    updatedAt:String
    subcategories: [Subcategory]
    products: [Product]
    bannerImageUrl:[String]
    cardImageUrl: [String]
    cardPublicIds:[String]
    bannerPublicIds: [String] 
    meta: Meta
  }

  type Meta {
    title: String
    description: String
    keywords: [String]
  }

  type PaginatedCategories {
    categories: [Category]
    currentPage: Int!
    totalPages: Int!
    totalCategories: Int!
  }
  
  type DeletionResponse {
    success: Boolean!
    message: String
  }
  input MetaInput {
    title: String
    description: String
    keywords: [String]
  }

  type DeleteCategoryResponse {
  success: Boolean!
  message: String!
  category: Category
  }
  
  extend type Query {
    getCategories(page: Int,limit: Int, search: String, sort: String): PaginatedCategories
    
    getCategoryById(id: ID!): Category
    getCategoryByName(name: String!):Category
  }
  
  extend type Mutation {

    createCategory(name: String!, description: String,  bannerImageUrl: [Upload] ,cardImageUrl: [Upload], cardPublicIds:[String],
    bannerPublicIds: [String], meta: MetaInput): Category
    updateCategory(id: ID!, name: String, description: String , bannerImageUrl: [Upload] ,cardImageUrl: [Upload] ,cardPublicIds:[String],
    bannerPublicIds: [String], meta: MetaInput): Category
    deleteCategoryImageByIndex(categoryId: ID!, index: Int! ,isBanner: Boolean!): DeleteCategoryResponse
    deleteCategory(id: ID!): DeletionResponse!

  }
`;

module.exports = categoryType;

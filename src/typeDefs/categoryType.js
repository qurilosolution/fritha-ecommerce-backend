  

const { gql } = require('apollo-server-express');

const categoryType = gql`
scalar Upload 
  type Category {
    id: ID!
    name: String!
    description: String
    subcategories: [Subcategory]
    products: [Product]
    bannerImageUrl:[String]
    cardImageUrl: [String]
    

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
  
  extend type Query {
    getCategories(page: Int, limit: Int): PaginatedCategories
    getCategoryById(id: ID!): Category
    getCategoryByName(name: String!):Category
  }
  
  extend type Mutation {

    createCategory(name: String!, description: String,  ,bannerImageUrl: [Upload!]! ,cardImageUrl: [Upload!]!): Category
    updateCategory(id: ID!, name: String, description: String , bannerImageUrl: [Upload!]! ,cardImageUrl: [Upload!]!): Category
    deleteCategory(id: ID!): DeletionResponse!

  }
`;

module.exports = categoryType;

const { gql } = require('apollo-server-express');

const subcategoryType = gql`
  scalar Upload
  type Subcategory {
    id: ID!
    name: String!
    description: String
    createdAt: String
    updatedAt: String
    imageUrl: [String]
    category: Category!
    products: [Product]
    meta: Meta
  }
  type PaginatedSubcategories {
    subcategories: [Subcategory]
    currentPage: Int!
    totalPages: Int!
    totalSubcategories: Int!
  }
    type Meta {
    title: String
    description: String
    keywords: [String]
  }
    input MetaInput {
    title: String
    description: String
    keywords: [String]
  }
  type DeletionResponse { 
    success: Boolean!
    message: String
  }
  extend type Query {
    getSubcategories(page: Int, limit: Int): PaginatedSubcategories
    getSubcategoryById(id: ID!): Subcategory
    getSubcategoryByName(name: String!): Subcategory
  }


  extend type Mutation {  
    createSubcategory(name: String!, description: String, imageUrl: [Upload!]! ,categoryId: ID!, meta:MetaInput): Subcategory
    updateSubcategory(id: ID!, name: String, description: String, imageUrl: [Upload!]! , categoryId: ID! , meta:MetaInput): Subcategory
    deleteSubcategory(subcategoryId: ID!, categoryId: ID!): DeletionResponse!

  }
`;  

module.exports = subcategoryType;

const { gql } = require('apollo-server-express');

const categoryType = gql`
scalar Upload 
  type Category {
    id: ID!
    name: String!
    description: String
    subcategories: [Subcategory]
    products: [Product]
    imageUrl: [String]
  }
  
   type DeletionResponse {
    success: Boolean!
    message: String
  }

  extend type Query {
    getCategories: [Category]
    getCategoryById(id: ID!): Category
  }
  
  extend type Mutation {
    createCategory(name: String!, description: String, imageUrl: Upload): Category
    updateCategory(id: ID!, name: String, description: String, imageUrl: Upload): Category
    deleteCategory(id: ID!): DeletionResponse!
  }
`;

module.exports = categoryType;

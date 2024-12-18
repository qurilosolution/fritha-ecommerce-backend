const { gql } = require('apollo-server-express');

const subcategoryType = gql`
scalar Upload
  type Subcategory {
    id: ID!
    name: String!
    description: String
    imageUrl: [String]
    category: Category
    products: [Product]
  }
  type DeletionResponse {
    success: Boolean!
    message: String
  }
  extend type Query {
    getSubcategories: [Subcategory]
    getSubcategoryById(id: ID!): Subcategory
  }

  extend type Mutation {  
    createSubcategory(name: String!, description: String, imageUrl: Upload ,categoryId: ID!): Subcategory
    updateSubcategory(id: ID!, name: String, description: String, imageUrl: Upload , categoryId: ID!): Subcategory
    deleteSubcategory(subcategoryId: ID!, categoryId: ID!): DeletionResponse!
  }
`;  

module.exports = subcategoryType;

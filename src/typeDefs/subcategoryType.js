const { gql } = require('apollo-server-express');

const subcategoryType = gql`
scalar Upload
  type Subcategory {
    id: ID!
    name: String!
    description: String
    imageUrl: [String]
    category: Category!
    products: [Product]
    
  }

  extend type Query {
   
    getSubcategories: [Subcategory]

   
    getSubcategoryById(id: ID!): Subcategory
  }

  extend type Mutation {
    createSubcategory(name: String!, description: String, imageUrl: Upload ,categoryId: ID!): Subcategory
    updateSubcategory(id: ID!, name: String, description: String, imageUrl: Upload): Subcategory
    deleteSubcategory(id: ID!): Boolean
  }
`;

module.exports = subcategoryType;

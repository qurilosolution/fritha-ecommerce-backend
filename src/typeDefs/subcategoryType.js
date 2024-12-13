// const { gql } = require('apollo-server-express');

// const subcategoryType = gql`
// scalar Upload
//   type Subcategory {
//     id: ID!
//     name: String!
//     description: String
//     imageUrl: [String]
//     category: Category!
//     products: [Product]
    
//   }

//   extend type Query {
   
//     getSubcategories: [Subcategory]

   
//     getSubcategoryById(id: ID!): Subcategory
//   }

//   extend type Mutation {
//     createSubcategory(name: String!, description: String, imageUrl: Upload ,categoryId: ID!): Subcategory
//     updateSubcategory(id: ID!, name: String, description: String, imageUrl: Upload): Subcategory
//     deleteSubcategory(id: ID!): Boolean
//   }
// `;

// module.exports = subcategoryType;


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
    userId: ID! # Added userId to track the user
  }

  extend type Query {
    getSubcategories: [Subcategory]
    getSubcategoryById(id: ID!): Subcategory
  }

  extend type Mutation {
    createSubcategory(
      name: String!
      description: String
      imageUrl: Upload
      categoryId: ID!
      userId: ID! # Added userId as a required input for creation
    ): Subcategory

    updateSubcategory(
      id: ID!
      name: String
      description: String
      imageUrl: Upload
      userId: ID! # Added userId as an optional input for update
    ): Subcategory

    deleteSubcategory(
      id: ID!
      userId: ID! # Added userId for tracking user performing the deletion
    ): Boolean
  }
`;

module.exports = subcategoryType;

// const { gql } = require('apollo-server-express');

// const categoryType = gql`
// scalar Upload 
//   type Category {
//     id: ID!
//     name: String!
//     description: String
//     subcategories: [Subcategory]
//     products: [Product]
//     imageUrl: [String]
//   }

//   extend type Query {
//     getCategories: [Category]
//     getCategoryById(id: ID!): Category
//   }
  
//   extend type Mutation {
//     createCategory(name: String!, description: String, imageUrl: Upload): Category
//     updateCategory(id: ID!, name: String, description: String, imageUrl: Upload): Category
//     deleteCategory(id: ID!): Boolean
//   }
// `;

// module.exports = categoryType;




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
    userId: ID!  # Added userId field
  }

  extend type Query {
    getCategories: [Category]
    getCategoryById(id: ID!): Category
  }
  
  extend type Mutation {
    createCategory(name: String!, description: String, imageUrl: Upload, userId: ID!): Category # Added userId argument
    updateCategory(id: ID!, name: String, description: String, imageUrl: Upload, userId: ID): Category # Added userId argument
    deleteCategory(id: ID!): Boolean
  }
`;

module.exports = categoryType;

const { gql } = require('apollo-server-express');

const reviewType = gql`
  type Review {
    id: ID!
    productId: ID!
    userId: ID!
    rating: Int
    title: String!
    description: String!
    createdAt: String!
  }

  input ReviewInput {
    productId: ID!
    rating: Int 
    userId: ID! 
    rating: Int
    title: String!
    description: String!
  }

  extend type Query {
    getReviewsByProduct(productId: ID!): [Review]
    getReviewById(id: ID!): Review
  }

  extend type Mutation {
    createReview(input: ReviewInput): Review
  }
`;

module.exports = reviewType;

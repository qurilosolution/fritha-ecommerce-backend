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
    title: String!
    description: String!
  }

  type ReviewPage {
    reviews: [Review]!
    totalCount: Int!
    page: Int!
    totalPages: Int!
  }

  extend type Query {
    getReviewsByProduct(productId: ID!, page: Int, limit: Int): ReviewPage
    getReviewById(id: ID!): Review
  }

  extend type Mutation {
    createReview(input: ReviewInput): Review
    updateReview(id: ID!, input: ReviewInput): Review
  }
`;

module.exports = reviewType;

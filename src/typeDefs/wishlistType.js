const { gql } = require('apollo-server-express');

const wishlistType = gql`
  type WishlistItem {
    id: ID!
    userId: ID!
    productId: ID!
    addedAt: String!
  }

  type Query {
    getWishlistByUser(userId: ID!): [WishlistItem!]!
    getWishlistItemById(id: ID!): WishlistItem
  }

  type Mutation {
    addToWishlist(userId: ID!, productId: ID!): WishlistItem!
    removeFromWishlist(userId: ID!, productId: ID!): WishlistItem!
  }
`;

module.exports = wishlistType;

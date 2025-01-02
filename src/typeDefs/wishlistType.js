const { gql } = require("apollo-server-express");

const wishlistType = gql`
  type WishlistItem {
    product:Product!
    variant: Variant
    addedAt: String!
  }

  type Wishlist {
    id: ID!
    userId: ID!
    items: [WishlistItem!]!
  }

  input WishlistItemInput {
    product: ID!
    variant: ID # variant is now optional
  }

   type Query {
    getWishlist: Wishlist # userId is now inferred from context
  }

  type Mutation {
    addToWishlist(item: WishlistItemInput!): Wishlist # userId is now inferred from context
    removeFromWishlist(productId: ID!, variantId: ID!): Wishlist # userId is now inferred from context
    clearWishlist: Wishlist # userId is now inferred from context
  }

`;

module.exports = wishlistType;

 
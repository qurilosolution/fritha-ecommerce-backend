 

// const { gql } = require("apollo-server-express");

// const wishlistType = gql`
//  type WishlistItem {
//     product: ID!
//     variant: ID!
//     addedAt: String!
//   }

//   type Wishlist {
//     id: ID!
//     userId: ID!
//     items: [WishlistItem!]!
//   }

//   input WishlistItemInput {
//     product: ID!
//     variant: ID!
//   }

//   type Query {
//     getWishlist(userId: ID!): Wishlist
//   }

//   type Mutation {
//     addToWishlist(userId: ID!, item: WishlistItemInput!): Wishlist
//     removeFromWishlist(userId: ID!, productId: ID!): Wishlist
//     clearWishlist(userId: ID!): Wishlist
//   }
// `;

// module.exports = wishlistType;


const { gql } = require("apollo-server-express");

const wishlistType = gql`
  type WishlistItem {
    product: ID!
    variant: ID
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
    getWishlist(userId: ID!): Wishlist
  }

  type Mutation {
    addToWishlist(userId: ID!, item: WishlistItemInput!): Wishlist
  removeFromWishlist(userId: ID!, productId: ID!, variantId: ID!): Wishlist
    clearWishlist(userId: ID!): Wishlist
  }
`;

module.exports = wishlistType;

// const { gql } = require("apollo-server-express");

// const wishlistType = gql`
// type WishlistItem {
//   productIds: [ID!]!  # Change to 'productIds' to match the data structure
//   addedAt: String!
// }



//   type Wishlist {
//     userId: ID!
//     items: [WishlistItem!]!
//   }

//   type Query {
//     getWishlistByUser(userId: ID!): Wishlist!
//     getWishlistItemById(id: ID!): WishlistItem
//   }

//   type Mutation {
//     addToWishlist(userId: ID!, productIds: [ID!]!): Wishlist!
//     removeFromWishlist(userId: ID!, productId: ID!): Wishlist!
//   }
// `;

// module.exports = wishlistType;


const { gql } = require("apollo-server-express");

const wishlistType = gql`
  type Product {
    id: ID!
    name: String!
   }

  type WishlistItem {
    products: [Product!]!  
    addedAt: String!
  }

  type Wishlist {
    userId: ID!
    items: [WishlistItem!]!
  }

  type Query {
    getWishlistByUser(userId: ID!): Wishlist!
    getWishlistItemById(id: ID!): WishlistItem
  }

  type Mutation {
    addToWishlist(userId: ID!, productIds: [ID!]!): Wishlist!
    removeFromWishlist(userId: ID!, productId: ID!): Wishlist!
  }
`;

module.exports = wishlistType;

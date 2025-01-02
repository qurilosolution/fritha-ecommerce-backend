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
    getWishlist(userId: ID!): Wishlist
  }

  type Mutation {
    addToWishlist(userId: ID!, item: WishlistItemInput!): Wishlist
    removeFromWishlist(userId: ID!, productId: ID!, variantId: ID!): Wishlist
    clearWishlist(userId: ID!): Wishlist
  }
`;

module.exports = wishlistType;



// const { gql } = require("apollo-server-express");

// const wishlistType = gql`
// type Product {
//   id: ID!
//   name: String!
// }

// type Variant {
//   id: ID!
//   pack: Int
// }

// type WishlistItem {
//   product: Product!
//   variant: Variant
//   addedAt: String!
// }

// type Wishlist {
//   id: ID!
//   userId: ID!
//   items: [WishlistItem]
// }


//   type Wishlist {
//     id: ID!
//     userId: ID!
//     items: [WishlistItem!]!
//   }

//   input WishlistItemInput {
//     product: ID!
//     variant: ID
//   }

//   type Query {
//     getWishlist(userId: ID!): Wishlist
//   }

//   type Mutation {
//     addToWishlist(userId: ID!, item: WishlistItemInput!): Wishlist
//     removeFromWishlist(userId: ID!, productId: ID!, variantId: ID!): Wishlist
//     clearWishlist(userId: ID!): Wishlist
//   }
// `;

// module.exports = wishlistType;



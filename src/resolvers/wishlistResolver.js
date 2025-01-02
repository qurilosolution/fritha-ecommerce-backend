const WishlistService = require("../services/wishlistService");

const wishlistResolver = {
  Query: {

    getWishlist: (_, { userId }) => {
       return WishlistService.getWishlist(userId);
    },
  },

  Mutation: {
    addToWishlist: (_, { userId, item }) => {
      return WishlistService.addToWishlist(userId, item);
    },


  removeFromWishlist: (_, { userId, productId, variantId }) => {
    return WishlistService.removeFromWishlist(userId, productId, variantId);
  },

  
    clearWishlist: (_, { userId }) => {
      return WishlistService.clearWishlist(userId);
    },
  },
};

module.exports = wishlistResolver;

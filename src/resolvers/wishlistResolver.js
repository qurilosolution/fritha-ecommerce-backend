const WishlistService = require("../services/wishlistService");

const wishlistResolver = {
  Query: {
    getWishlist: async (_, __, context) => {
      const userId = context.user?.id; // Extract `id` from the `user` object in context
      console.log(userId, "Fetching wishlist");
    
      if (!userId) {
        throw new Error("You must be logged in to view the wishlist");
      }
    
      return WishlistService.getWishlist(userId);
    },
    
  },

  Mutation: {

    // addToWishlist: (_, { userId, item }) => {
    //   return WishlistService.addToWishlist(userId, item);
    // },


    addToWishlist: async (_, { item }, context) => {
      const userId = context.user?.id; // Extract `id` from the `user` object in context
      console.log(userId,"llll")

      if (!userId) {
        throw new Error("You must be logged in to add to the wishlist");
      }
    
      return WishlistService.addToWishlist(userId, item);
    },
    



    // removeFromWishlist: (_, { userId, productId, variantId },) => {
    //   return WishlistService.removeFromWishlist(userId, productId, variantId);
    // },


    removeFromWishlist: async (_, { productId, variantId }, context) => {
      const userId = context.user?.id; // Extract `id` from the `user` object in context
      console.log(userId, "Removing from wishlist");
    
      if (!userId) {
        throw new Error("You must be logged in to remove items from the wishlist");
      }
    
      return WishlistService.removeFromWishlist(userId, productId, variantId);
    },
    





    clearWishlist: (_, { userId }) => {
      return WishlistService.clearWishlist(userId);
    },
  },
};

module.exports = wishlistResolver;

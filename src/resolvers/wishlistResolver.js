// const WishlistService = require('../services/wishlistService');

// const wishlistResolvers = {
//   Query: {
//     async getWishlistByUser(_, { userId },context) {

//         console.log(context.user);
//         if(!context.user)
//           throw Error("You must be logged in to create a wishlist");
//         if(!context.user.role.includes("admin"))
//           throw Error("You must be an admin to create a category");
  

//       try {
//         return await WishlistService.getWishlistByUser(userId);
//       } catch (error) {
//         throw new Error('Error fetching wishlist items for user: ' + error.message);
//       }
//     },
//     async getWishlistItemById(_, { id }) {
//       try {
//         return await WishlistService.getWishlistItemById(id);
//       } catch (error) {
//         throw new Error('Error fetching wishlist item by ID: ' + error.message);
//       }
//     },
//   },
//   Mutation: {
//     async addToWishlist(_, { userId, productId }) {
//       try {
//         return await WishlistService.addToWishlist(userId, productId);
//       } catch (error) {
//         throw new Error('Error adding item to wishlist: ' + error.message);
//       }
//     },
//     async removeFromWishlist(_, { userId, productId }) {
//       try {
//         return await WishlistService.removeFromWishlist(userId, productId);
//       } catch (error) {
//         throw new Error('Error removing item from wishlist: ' + error.message);
//       }
//     },
//   },
// };

// module.exports = wishlistResolvers;








const jwt = require('jsonwebtoken');
const WishlistService = require('../services/wishlistService');

const wishlistResolvers = {
  Query: {
    async getWishlistByUser(_, { userId }, context) {
      if (!context.user) {
        throw new Error('You must be logged in to create a wishlist');
      }
      if (!context.user.role.includes('admin')) {
        throw new Error('You must be an admin to access this');
      }

      try {
        return await WishlistService.getWishlistByUser(userId);
      } catch (error) {
        throw new Error('Error fetching wishlist items for user: ' + error.message);
      }
    },

    async getWishlistItemById(_, { id }) {
      try {
        return await WishlistService.getWishlistItemById(id);
      } catch (error) {
        throw new Error('Error fetching wishlist item by ID: ' + error.message);
      }
    },
  },

  Mutation: {
    async addToWishlist(_, { userId, productId }, context) {
      if (!context.user) {
        throw new Error('You must be logged in to add items to the wishlist');
      }

      try {
        return await WishlistService.addToWishlist(userId, productId);
      } catch (error) {
        throw new Error('Error adding item to wishlist: ' + error.message);
      }
    },

    async removeFromWishlist(_, { userId, productId }, context) {
      if (!context.user) {
        throw new Error('You must be logged in to remove items from the wishlist');
      }

      try {
        return await WishlistService.removeFromWishlist(userId, productId);
      } catch (error) {
        throw new Error('Error removing item from wishlist: ' + error.message);
      }
    },
  },
};

module.exports = wishlistResolvers;

const WishlistService = require('../services/WishlistService');  
 
const wishlistResolvers = {
  Query: {
    // Get wishlist for a specific user
    async getWishlistByUser(_, { userId }, context) {
      console.log(context.user,"llolololol")

      // Check if the user is logged in
      if (!context.user) {
        throw new Error('You must be logged in to view the wishlist');
      }

      // Check if the user is an admin or if they are requesting their own wishlist
      // if (context.user!== userId && !context.user.role.includes('admin')) {
      //   throw new Error('You must be an admin or the user to access this');
      // }

      try {
        // Fetch wishlist items for the user from the WishlistService
        return await WishlistService.getWishlistByUser(userId);
      } catch (error) {
        throw new Error('Error fetching wishlist items for user: ' + error.message);
      }
    },

    // Get a specific item from the wishlist by its ID
    async getWishlistItemById(_, { id }, context) {
      try {
        // Fetch the specific wishlist item by ID
        return await WishlistService.getWishlistItemById(id);
      } catch (error) {
        throw new Error('Error fetching wishlist item by ID: ' + error.message);
      }
    },
  },

  Mutation: {
    // Add a product to the wishlist
    async addToWishlist(_, { userId, productIds }, context) {
      // Check if the user is logged in
      if (!context.user) {
        throw new Error('You must be logged in to add items to the wishlist');
      }
    
      try {
        // Add multiple products to the user's wishlist using the WishlistService
        return await WishlistService.addToWishlist(userId, productIds);
      } catch (error) {
        throw new Error('Error adding item to wishlist: ' + error.message);
      }
    },

    // Remove a product from the wishlist
    async removeFromWishlist(_, { userId, productId }, context) {
      // Check if the user is logged in
      if (!context.user) {
        throw new Error('You must be logged in to remove items from the wishlist');
      }

      try {
        // Remove the product from the user's wishlist using the WishlistService
        return await WishlistService.removeFromWishlist(userId, productId);
      } catch (error) {
        throw new Error('Error removing item from wishlist: ' + error.message);
      }
    },
  },
};

module.exports = wishlistResolvers;

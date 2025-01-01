// wishlistService.js
const WishlistItem = require("../models/wishlistModel");  // Assuming you have a models folder where your database models are located
const mongoose = require('mongoose');

const WishlistService = {




  getWishlist: async (userId) => {
    try {
      // Fetch the user's wishlist from the database
      const wishlist = await WishlistItem.findOne({ userId });
      
      return {
        id: wishlist.id, // Include the ID field
        userId: wishlist.userId, // Include the userId field
        items: wishlist.items
      };
      
      // assuming the items are stored in a field called 'items'
    } catch (error) {
      throw new Error(`Error fetching wishlist: ${error.message}`);
    }
  },







  // addToWishlist: async (userId, item) => {
  //   try {
  //     // Check if the variant is a valid ObjectId
  //     if (!mongoose.Types.ObjectId.isValid(item.variant)) {
  //       throw new Error('Invalid variant ID');
  //     }

  //     // Convert variant to ObjectId if valid
  //     const variantObjectId = new mongoose.Types.ObjectId(item.variant);

  //     // Find the user's wishlist
  //     let wishlist = await WishlistItem.findOne({ userId }); // Use Wishlist model here

  //     // If no wishlist exists, create one
  //     if (!wishlist) {
  //       wishlist = await WishlistItem.create({ userId, items: [] });
  //     }

  //     // Add the new item to the wishlist
  //     wishlist.items.push({ ...item, variant: variantObjectId });
  //     await wishlist.save();

  //     return wishlist;
  //   } catch (error) {
  //     throw new Error(`Error adding item to wishlist: ${error.message}`);
  //   }
  // },



  addToWishlist: async (userId, item) => {
    try {
      // Check if variant is provided and if it's a valid ObjectId
      let variantObjectId = null;
      if (item.variant) {
        if (!mongoose.Types.ObjectId.isValid(item.variant)) {
          throw new Error('Invalid variant ID');
        }
        // Convert variant to ObjectId if valid
        variantObjectId = new mongoose.Types.ObjectId(item.variant);
      }
  
      // Find the user's wishlist
      let wishlist = await WishlistItem.findOne({ userId });
  
      // If no wishlist exists, create one
      if (!wishlist) {
        wishlist = await WishlistItem.create({ userId, items: [] });
      }
  
      // Add the new item to the wishlist with variant or null if no variant
      wishlist.items.push({ ...item, variant: variantObjectId });
      await wishlist.save();
  
      return wishlist;
    } catch (error) {
      throw new Error(`Error adding item to wishlist: ${error.message}`);
    }
  },
  










  // removeFromWishlist: async (userId, productId) => {
  //   console.log(productId, "llolololo")
  //   try {
  //     // Find the user's wishlist
  //     const wishlist = await WishlistItem.findOne({ userId });
  
  //     if (!wishlist) {
  //       throw new Error("Wishlist not found");
  //     }
  
  //     // Remove the item from the wishlist by matching the product ID correctly
  //     const updatedItems = wishlist.items.filter(item => item.product.toString() !== productId);
  
  //     // If no items remain, you might want to clear the items array entirely
  //     wishlist.items = updatedItems;
  //     await wishlist.save();
  
  //     // Return the updated wishlist with its ID and userId
  //     return {
  //       id: wishlist.id, // Include the ID field
  //       userId: wishlist.userId, // Include the userId field
  //       items: wishlist.items
  //     };
  //   } catch (error) {
  //     throw new Error(`Error removing item from wishlist: ${error.message}`);
  //   }
  // },
  
  
  removeFromWishlist: async (userId, productId, variantId) => {
    console.log(productId, variantId, "Removing from wishlist");
    try {
      // Find the user's wishlist
      const wishlist = await WishlistItem.findOne({ userId });
  
      if (!wishlist) {
        throw new Error("Wishlist not found");
      }
  
      // Remove the item from the wishlist by matching both productId and variantId
      const updatedItems = wishlist.items.filter(item => 
        item.product.toString() !== productId || item.variant.toString() !== variantId
      );
  
      // If no items remain, you might want to clear the items array entirely
      wishlist.items = updatedItems;
      await wishlist.save();
  
      // Return the updated wishlist with its ID and userId
      return {
        id: wishlist.id, // Include the ID field
        userId: wishlist.userId, // Include the userId field
        items: wishlist.items
      };
    } catch (error) {
      throw new Error(`Error removing item from wishlist: ${error.message}`);
    }
  },
  



  clearWishlist: async (userId) => {
    try {
      // Find the user's wishlist and clear it
      const wishlist = await WishlistItem.findOne({ where: { userId } });

      if (!wishlist) {
        throw new Error("Wishlist not found");
      }

      wishlist.items = [];
      await wishlist.save();

      return wishlist.items;
    } catch (error) {
      throw new Error(`Error clearing wishlist: ${error.message}`);
    }
  },
};

module.exports = WishlistService;

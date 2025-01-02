// wishlistService.js
const WishlistItem = require("../models/wishlistModel");  // Assuming you have a models folder where your database models are located
const mongoose = require('mongoose');
const Product = require("../models/Product");
const Variant = require("../models/Variant");


const WishlistService = {



 
  getWishlist: async (userId) => {
    try {
      console.log(userId, "Fetching Wishlist");
  
      // Fetch the user's wishlist and populate product and variant data
      const wishlist = await WishlistItem.findOne({ userId })
        .populate({
          path: 'items.product', // Correct path for the product
          model: 'Product', // Explicitly mention the model (optional but good practice)
          select: 'name', // Only fetch the name of the product
        })
        .populate({
          path: 'items.variant', // Correct path for the variant
          model: 'Variant', // Explicitly mention the model (optional but good practice)
          select: 'pack', // Only fetch the pack of the variant
        });
  
      if (!wishlist) {
        throw new Error('Wishlist not found');
      }
  
      return {
        id: wishlist.id,
        userId: wishlist.userId,
        items: wishlist.items.map(item => ({
          product: item.product, // Populated product data
          variant: item.variant, // Populated variant data
          addedAt: item.addedAt, // Include the addedAt field
        })),
      };
    } catch (error) {
      throw new Error(`Error fetching wishlist: ${error.message}`);
    }
  },
  















  // addToWishlist: async (userId, item) => {
  //   try {
  //     // Check if variant is provided and if it's a valid ObjectId
  //     let variantObjectId = null;
  //     if (item.variant) {
  //       if (!mongoose.Types.ObjectId.isValid(item.variant)) {
  //         throw new Error('Invalid variant ID');
  //       }
  //       // Convert variant to ObjectId if valid
  //       variantObjectId = new mongoose.Types.ObjectId(item.variant);
  //     }
  
  //     // Find the user's wishlist
  //     let wishlist = await WishlistItem.findOne({ userId });
  
  //     // If no wishlist exists, create one
  //     if (!wishlist) {
  //       wishlist = await WishlistItem.create({ userId, items: [] });
  //     }
  
  //     // Add the new item to the wishlist with variant or null if no variant
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
  
      // Populate the product and variant fields
      wishlist = await wishlist.populate([
        {
          path: 'items.product',
          select: 'name description price', // Add other product fields you want
        },
        {
          path: 'items.variant',
          select: 'size pack', // Add other variant fields you want
        }
      ]);
  
      return wishlist;
    } catch (error) {
      throw new Error(`Error adding item to wishlist: ${error.message}`);
    }
  },
  

















  
  removeFromWishlist: async (userId, productId, variantId) => {
    console.log(productId, variantId, "Removing from wishlist");
    try {
      // Check if productId and variantId are valid
      if (!productId || !variantId) {
        throw new Error("Product ID or Variant ID is missing");
      }
  
      // Find the user's wishlist and populate the product and variant
      const wishlist = await WishlistItem.findOne({ userId }).populate('items.product').populate('items.variant');
  
      if (!wishlist) {
        throw new Error("Wishlist not found");
      }
  
      // Remove the item from the wishlist by matching both productId and variantId
      const updatedItems = wishlist.items.filter(item => 
        item.product && item.product._id.toString() !== productId.toString() || 
        item.variant && item.variant._id.toString() !== variantId.toString()
      );
  
      // If no items remain, clear the items array entirely
      wishlist.items = updatedItems;
      await wishlist.save();
  
      // Return the updated wishlist with its ID and userId
      return {
        id: wishlist.id, // Include the ID field
        userId: wishlist.userId, // Include the userId field
        items: wishlist.items.map(item => ({
          product: item.product ? {
            id: item.product._id,
            name: item.product.name
          } : null, // Ensure product is not null
          variant: item.variant ? {
            id: item.variant._id,
            pack: item.variant.pack
          } : null, // Ensure variant is not null
          addedAt: item.addedAt,
        })),
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

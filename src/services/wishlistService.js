const WishlistItem = require("../models/wishlistModel");

// Fetch wishlist items by user
async function getWishlistByUser(userId) {
  try {
    return await WishlistItem.find({ userId });
  } catch (error) {
    throw new Error('Error fetching wishlist items for user: ' + error.message);
  }
}

// Add an item to the wishlist
async function addToWishlist(userId, productId) {
  try {
    const wishlistItem = new WishlistItem({ userId, productId });
    await wishlistItem.save();
    return wishlistItem;
  } catch (error) {
    throw new Error('Error adding item to wishlist: ' + error.message);
  }
}

// Remove an item from the wishlist
async function removeFromWishlist(userId, productId) {
  try {
    const deletedItem = await WishlistItem.findOneAndDelete({ userId, productId });
    if (!deletedItem) {
      throw new Error('Wishlist item not found');
    }
    return deletedItem;
  } catch (error) {
    throw new Error('Error removing item from wishlist: ' + error.message);
  }
}

// Fetch a specific wishlist item by ID
async function getWishlistItemById(id) {
  try {
    return await WishlistItem.findById(id);
  } catch (error) {
    throw new Error('Error fetching wishlist item by ID: ' + error.message);
  }
}

module.exports = {
  getWishlistByUser,
  addToWishlist,
  removeFromWishlist,
  getWishlistItemById,
};

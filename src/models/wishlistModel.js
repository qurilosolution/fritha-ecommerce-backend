const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Wishlist schema
const WishlistItemSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  addedAt: { type: Date, default: Date.now },
});

// Create the Wishlist model
const WishlistItem = mongoose.model('WishlistItem', WishlistItemSchema);

module.exports = WishlistItem;

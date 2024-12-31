const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the WishlistItem schema
const WishlistItemSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  items: [
    {
      productIds: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: 'Product' },  // Change to 'productIds' (array)
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

// Create the Wishlist model
const WishlistItem = mongoose.model('Wishlist', WishlistItemSchema);

module.exports = WishlistItem;

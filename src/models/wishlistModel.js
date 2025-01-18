const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the WishlistItem schema
const WishlistSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }, 
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

// Create the Wishlist model
const WishlistModel = mongoose.model('Wishlist', WishlistSchema);
module.exports = WishlistModel;

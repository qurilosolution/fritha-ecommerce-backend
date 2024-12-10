const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String, // Example: "Tan Removal Face Wash"
      required: true,
      trim: true,
    },
    description: {
      type: String, // Example: "Products specialized in tan removal"
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Links to the parent category
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Links products to this subcategory
      },
    ],
    imageUrl: {
      type: [String], // Optional image for the subcategory
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

module.exports = mongoose.model('Subcategory', subcategorySchema);

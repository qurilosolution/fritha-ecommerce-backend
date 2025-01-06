
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true,
      trim: true,
    },
    description: {
      type: String, 
      trim: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory', // Links to the Subcategory schema
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Links products to this category
      },
    ],
    variants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Variant',
    }],
    bannerImageUrl: {
      type: [String], // Optional images for the category
      trim: true,
    },
    cardImageUrl: {
      type: [String], // Optional images for the category
      trim: true,
    },
    
  },
  {

    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

module.exports = mongoose.model('Category', categorySchema);

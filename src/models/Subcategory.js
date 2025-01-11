const mongoose = require('mongoose');


const subcategorySchema = new mongoose.Schema(
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    imageUrl: {
      type: [String],
      trim: true,
    },
    meta: {
      title: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      keywords: {
        type: [String], // Array to store multiple keywords
        trim: true,
      },
    }
   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subcategory', subcategorySchema);

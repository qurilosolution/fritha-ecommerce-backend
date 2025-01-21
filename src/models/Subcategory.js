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
    bannerImageUrl: {
      type: [String], 
      trim: true,
    },
    cardImageUrl: {
      type: [String], 
      trim: true,
    },
    cardPublicIds:{
      type: [String]
    },
    bannerPublicIds:{
      type: [String]
    },
    deletedAt: {
      type: Date,
      default: null,
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

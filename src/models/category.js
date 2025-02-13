
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true,
      trim: true,
    },
    categorySlugName: {
      type: String,
      unique: true,
    },
    description: {
      type: String, 
      trim: true,
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory', 
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',       },
    ],
    variants:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Variant',
    }],
    bannerImageUrl: {
      type: [String],
      trim: true,
    },
    cardImageUrl: {
      type: [String], // Optional images for the category
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

    },
    
  },
  {

    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

categorySchema.pre("save", function (next) {
  // Generate slugName based on name
  if (this.isModified("name")) {
    this.categorySlugName = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with '-'
      .replace(/^-+|-+$/g, ""); // Remove leading or trailing '-'
  }
  next();
});


module.exports = mongoose.model('Category', categorySchema);

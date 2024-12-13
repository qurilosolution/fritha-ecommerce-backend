// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String, // Example: "Face Wash"
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String, // Example: "Products for facial cleansing"
//       trim: true,
//     },
//     subcategories: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Subcategory', // Links to the Subcategory schema
//       },
//     ],
//     products: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product', // Links products to this category
//       },
//     ],
//     imageUrl: {
//       type: [String], // Optional image for the category
//       trim: true,
//     },
//   },
//   {
//     timestamps: true, // Automatically add createdAt and updatedAt
//   }
// );

// module.exports = mongoose.model('Category', categorySchema);


const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String, // Example: "Face Wash"
      required: true,
      trim: true,
    },
    description: {
      type: String, // Example: "Products for facial cleansing"
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
    imageUrl: {
      type: [String], // Optional images for the category
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, // User who created the category
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

module.exports = mongoose.model('Category', categorySchema);

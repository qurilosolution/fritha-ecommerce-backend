const mongoose = require('mongoose');

// const subcategorySchema = new mongoose.Schema(
//   {
//     name: {
//       type: String, // Example: "Tan Removal Face Wash"
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String, // Example: "Products specialized in tan removal"
//       trim: true,
//     },
//     category: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Category', // Links to the parent category
//       required: true,
//     },
//     products: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product', // Links products to this subcategory
//       },
//     ],
//     imageUrl: {
//       type: [String], // Optional image for the subcategory
//       trim: true,
//     },
//   },
//   {
//     timestamps: true, // Automatically add createdAt and updatedAt
//   }
// );

// module.exports = mongoose.model('Subcategory', subcategorySchema);

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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the User collection
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subcategory', subcategorySchema);

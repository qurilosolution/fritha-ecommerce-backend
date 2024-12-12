// const mongoose = require('mongoose');
// const Product = require('./Product'); // Import Product model

// const reviewSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true,
//   },
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Assuming User is another collection
//     defalult:null
//    },
//   rating: {
//     type: Number,
//     required: false,
//     min: 1,
//     max: 5,
//   },
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Post middleware to update product reviews
// reviewSchema.post('save', async function () {
//     try {
//       // Aggregate reviews for the specific product
//       const result = await mongoose.model('Review').aggregate([
//         { $match: { productId: this.productId } },
//         {
//           $group: {
//             _id: '$productId',
//             totalReviews: { $sum: 1 },
//             averageRating: { $avg: '$rating' },
//           },
//         },
//       ]);
  
//       if (result.length > 0) {
//         const { totalReviews, averageRating } = result[0];
  
//         // Update the product with total reviews, average rating, and best seller status
//         await Product.findByIdAndUpdate(this.productId, {
//           $set: {
//             totalReviews,
//             averageRating: averageRating.toFixed(2), // Rounded to 2 decimal places
//             isBestSeller: averageRating >= 4, // Mark as best seller if rating is 4 or above
//           },
//         });
//       }
//     } catch (err) {
//       console.error('Error updating product rating:', err);
//     }
//   });
  
// module.exports = mongoose.model('Review', reviewSchema);


const mongoose = require('mongoose');
const Product = require('./Product');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming User is another collection
    default: null,
  },
  rating: {
    type: Number,
    required: false,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware for updating product statistics
reviewSchema.post('save', async function () {
  try {
    const result = await mongoose.model('Review').aggregate([
      { $match: { productId: this.productId } },
      {
        $group: {
          _id: '$productId',
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    if (result.length > 0) {
      const { totalReviews, averageRating } = result[0];

      await Product.findByIdAndUpdate(this.productId, {
        $set: {
          totalReviews,
          averageRating: averageRating.toFixed(2),
          isBestSeller: averageRating >= 4,
        },
      });
    }
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

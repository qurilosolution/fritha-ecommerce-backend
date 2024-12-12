// const ReviewService = require('../services/reviewService');

// const reviewResolvers = {
//   Query: {
//     async getReviewsByProduct(_, { productId }) {
//       return ReviewService.getReviewsByProduct(productId);
//     },
//     async getReviewById(_, { id }) {
//       return ReviewService.getReviewById(id);
//     },
//   },
//   Mutation: {
//     async createReview(_, { input }) {
//       try {
//         return await ReviewService.createReview(input);
//       } catch (error) {
//         throw new Error('Error creating review: ' + error.message);
//       }
//     },
//   },
// };

// module.exports = reviewResolvers;



const ReviewService = require('../services/reviewService');

const reviewResolvers = {
  Query: {
    async getReviewsByProduct(_, { productId }) {
      return ReviewService.getReviewsByProduct(productId);
    },
    async getReviewById(_, { id }) {
      return ReviewService.getReviewById(id);
    },
  },
  Mutation: {
    async createReview(_, { input }) {
      try {
        return await ReviewService.createReview(input);
      } catch (error) {
        throw new Error('Error creating review: ' + error.message);
      }
    },
  },
};

module.exports = reviewResolvers;




// const mongoose = require('mongoose');
// const Review = require('../models/Review');

// class ReviewService {
//   static async createReview(input) {
//     try {
//       const { productId, userId, rating, title, description } = input;

//       // Convert productId and userId to ObjectId
//       const review = new Review({
//         productId: mongoose.Types.ObjectId(productId),
//         userId: mongoose.Types.ObjectId(userId),
//         rating,
//         title,
//         description,
//         createdAt: new Date().toISOString(),
//       });

//       return await review.save();
//     } catch (error) {
//       throw new Error('Error creating review: ' + error.message);
//     }
//   }

//   static async getReviewsByProduct(productId) {
//     return Review.find({ productId: mongoose.Types.ObjectId(productId) });
//   }

//   static async getReviewById(id) {
//     return Review.findById(mongoose.Types.ObjectId(id));
//   }
// }

// module.exports = ReviewService;

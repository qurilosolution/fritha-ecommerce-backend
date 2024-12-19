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
const ReviewService = require('../services/reviewService');
const reviewResolvers = {
  Query: {
    async getReviewsByProduct(_, { productId , page = 1 }) {
      return ReviewService.getReviewsByProduct(productId ,  page);
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
    async updateReview(id, input) {
    try {
      const updatedReview = await Review.findByIdAndUpdate(id, input, {
        new: true, // Return the updated document
      });

      if (!updatedReview) {
        throw new Error('Review not found');
      }

      return updatedReview;
    } catch (error) {
      throw new Error('Error updating review: ' + error.message);
    }
  },
  async updateReview(_, { id, input }) {
    try {
      return await ReviewService.updateReview(id, input);
    } catch (error) {
      throw new Error('Error updating review: ' + error.message);
    }
  },
  },
};
module.exports = reviewResolvers;
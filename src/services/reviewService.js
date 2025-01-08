const Review =require("../models/review");
const Product = require('../models/Product');
async function getReviewsByProduct(productId) {
  try {
    return await Review.find({ productId });
  } catch (error) {
    throw new Error('Error fetching reviews by product: ' + error.message);
  }
}


async function getReviewById(id) {
  try {
    return await Review.findById(id);
  } catch (error) {
    throw new Error('Error fetching review by ID: ' + error.message);
  }
}


async function createReview(input) {
  try {
    const newReview = new Review(input);
    await newReview.save();

    // Add the review ID to the associated product's `reviews` field
    await Product.findByIdAndUpdate(input.productId, {
      $push: { reviews: newReview._id },
    });

    return newReview;
  } catch (error) {
    throw new Error('Error creating review: ' + error.message);
  }
}


module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
};

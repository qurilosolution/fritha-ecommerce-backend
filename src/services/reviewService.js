const Review =require("../models/review");

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
    console.log(newReview);
    await newReview.save();
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

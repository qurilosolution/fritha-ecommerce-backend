const Review =require("../models/review");
const Product = require('../models/Product');



async function getReviewsByProduct(productId, page = 1) {
  const limit = 5;
  const skip = (page - 1) * limit;

  try {
    // Fetch reviews for the product with pagination
    const reviews = await Review.find({ productId })
      .skip(skip)
      .limit(limit);

    // Fetch the total number of reviews for the product
    const totalCount = await Review.countDocuments({ productId });

    // Calculate total number of pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      reviews, 
      totalCount,
      page,
      totalPages,
    };
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
};
async function updateReview(id, input) {
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
};


module.exports = {
  getReviewsByProduct,
  getReviewById,
  createReview,
  updateReview
};

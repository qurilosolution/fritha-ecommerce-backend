const mongoose = require("mongoose");
const Product = require("./Product");

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
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

// Post middleware to update product reviews
reviewSchema.post("save", async function () {
 
  try {
    const result = await mongoose.model("Review").aggregate([
      { $match: { productId: this.productId } },
      {
        $group: {
          _id: "$productId",
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    console.log("Aggregation result:", result);

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
    console.error("Error in post-save middleware:", err);
  }
});


module.exports = mongoose.model('Review', reviewSchema);


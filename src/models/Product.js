const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slugName: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
      },
    ],
    
    specialPrice: {
      type: Number,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
    },
    mrp: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    inclusiveOfTaxes: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
    },
    keyBenefits: [
      {
        type: String,
      },
    ],
    isStock: {
      type: Boolean,
      default: true,
    },
    imageUrl: { type: [String], default: [] },
    netContent: {
      type: String,
    },
    usp: {
      type: String,
    },
    ingredients: [
      {
        type: String,
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    keyFeatures: {
      type: String,
    },
    additionalDetails: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    publicIds: [{ type: String }],
    newImages: [{ type: String }],
  },
  { timestamps: true }
);

// Middleware to calculate dynamic values before saving a product
productSchema.pre("save", function (next) {
  // Generate slugName based on name
  if (this.isModified("name")) {
    this.slugName = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with '-'
      .replace(/^-+|-+$/g, ""); // Remove leading or trailing '-'
  }

  // Update isStock based on stock
  if (!this.stock || this.stock === 0) {
    this.isStock = false;
  } else {
    this.isStock = true;
  }

  next();
});

productSchema.pre("remove", async function (next) {
  try {
    await Variant.deleteMany({ productId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Product", productSchema);

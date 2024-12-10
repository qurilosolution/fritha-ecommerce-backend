const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: {
    type: Number, // Example: 50 (denoting 50ml)
    required: false,
  },
  pack: {
    type: Number, // Example : 2
    required: false, 
  },
  discountPrice: {
    type: Number, // Example: Calculated based on the discount 
  },
  mrp: {
    type: Number, // Example: 269 (before discount) 
    required: false,
  },
  discount: {
    type: Number, // Example: Calculated as a percentage
  },
  pricePerUnit: {
    type: Number, // Example: ₹2.29 per ml (calculated based on size and price)
  },
  pricePerUnitDiscount: {
    type: Number, // Price per unit based on discount price
  },
  combo: {
    type: String, // Example: "250 ml (Pack of 2)"
  },
  isOutOfStock: {
    type: Boolean,
    default: false, // Default to in stock
  },
  imageUrl: {
    type: [String], // Array of image URLs
    required: false,
  },
  netContent: {
    type: String,
    default: 'ml', // Default unit is "ml" but can be changed
  },
  salePrice: { type: Number },  
  saleStartDate: { type: Date }, 
  saleEndDate: { type: Date },   
  isOnSale: { type: Boolean, default: false }, 
});

// Middleware to calculate dynamic values before saving
variantSchema.pre('save', function (next) {
  // Calculate discount price and percentage
  if (this.mrp && this.discountPrice) {
    this.discount = (
      ((this.mrp - this.discountPrice) / this.mrp) *
      100
    ).toFixed(2); // Rounded to 2 decimal places
  }

  // Calculate price per unit
  if (this.discountPrice && this.size) {
    this.pricePerUnit = (this.discountPrice / this.size).toFixed(2);
  }
  
  // Calculate the compo (combination of size and pack)
  if (this.size && this.pack) {
    this.combo = `${this.size} ml (Pack of ${this.pack})`; 
  }
  // Calculate price per unit discount based on compo (or size and pack)
  if (this.discountPrice && this.combo) {
    this.pricePerUnitDiscount = (this.discountPrice / this.combo).toFixed(2); // Adjust calculation logic if needed
  }
  
  // Calculate remaining sale time
  if (this.saleEndDate) {
    const currentTime = new Date();
    const timeLeft = this.saleEndDate - currentTime; // Time left in milliseconds

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      this.remainingTime = `${hours}h : ${minutes}m : ${seconds}s`;
    } else {
      this.remainingTime = 'Sale Ended';
    }
  }

  next();
});

const PriceDetailsSchema = new mongoose.Schema({
  specialPrice: Number,
  mrp: Number,
  inclusiveOfTaxes: Boolean,
});

const productSchema = new mongoose.Schema({
  name: {
    type: String, // Example: "Rice Face Wash With Rice Water & Niacinamide"
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Link to the category collection
    required: true,
  },
  Subcategory: 
  { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: false },

  description: {
    type: String, // Long description of the product
  },
  keyBenefits: [
    {
      type: String, // Example: "Gently Cleanses Skin", "Hydrates Skin"
    },
  ],
  
  imageUrl: [String],
  netContent: {
    type: String, // Example: "100ml"
  },
  priceDetails: PriceDetailsSchema,
  variants: [variantSchema], // Array of available variants
  usp: {
    type: String, // Example: "₹2.29/ml"
  },
  ingredients: [
    {
      type: String, // Example: "Turmeric", "Saffron", "Carrot Seed Oil"
    },
  ],
  keyFeatures: {
    type: String, // Example: Highlights for promotion
  },
  additionalDetails: {
    type: String, // Details like "No Silicones, Parabens, mineral oil & dyes"
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
    default: false, // Initially, not a best seller
  },
  
}); 
module.exports = mongoose.model('Product', productSchema);








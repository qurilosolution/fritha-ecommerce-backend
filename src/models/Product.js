
const mongoose = require('mongoose');

// Variant Schema
const variantSchema = new mongoose.Schema({
  
   size: {
    type: Number,
    required: false,
  },
  pack: {
    type: Number, 
    required: false, 
  },
  price: {
    type: Number,
  },
  mrp: {
    type: Number, 
    required: true,
  },
  stock:{
    type:Number,
    required:true,
     default:10
  },
  discount: {
    type: Number, // Example: Calculated as a percentage
  },
  pricePerUnit: {
    type: Number, // Example: ₹2.29 per ml (calculated)
  },
  pricePerUnitDiscount: {
    type: Number, // Price per unit based on discount price
  },
  combo: {
    type: String, // Example: "250 ml (Pack of 2)"
  },
  isStock: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: [String], // Array of image URLs
    default: [],
  },
  netContent: {
    type: String,
    default: 'ml',
  },
  
  isOnSale: {
    type: Boolean,
    default: false,
  },
  salePrice: { type: Number },  
  saleStartDate: { type: Date }, 
  saleEndDate: { type: Date },   
  isOnSale: { type: Boolean, default: false }, 
  publicIds:[{ type: String }],
  newImages:[{type:String}]
  
});

// Middleware to calculate dynamic values before saving a variant
variantSchema.pre('save', function (next) {
  if (this.mrp && this.discountPrice) {
    this.discount = +(((this.mrp - this.discountPrice) / this.mrp) * 100).toFixed(2); // Calculate discount percentage
  }

  if (this.discountPrice && this.size) {
    this.pricePerUnit = +(this.discountPrice / this.size).toFixed(2); // Calculate price per unit
  }

  if (this.size && this.pack) {
    this.combo = `${this.size} ml (Pack of ${this.pack})`; // Generate combo description
  }

  if (this.discountPrice && this.size) {
    this.pricePerUnitDiscount = +(this.discountPrice / this.size).toFixed(2);
  }

  if (this.saleEndDate) {
    const currentTime = new Date();
    const timeLeft = this.saleEndDate - currentTime;

    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      this.remainingTime = `${hours}h : ${minutes}m : ${seconds}s`;
    } else {
      this.remainingTime = 'Sale Ended';
    }
  }
   
  if (!this.stock || this.stock === 0) {
    this.isStock = false;
  } else {
    this.isStock = true;
  }

  next();
});

// Price Details Schema


// Product Schema
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

  subcategory: 
  { type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subcategory', 
    required: true
  },
  specialPrice: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  stock:{
    type:Number,
    required:true,
     default:10
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
    type: String, // Long description of the product
  },
  keyBenefits: [
    {
      type: String, // Example: "Gently Cleanses Skin", "Hydrates Skin"
    },
  ],

  isStock: {
    type: Boolean,
    default: true,
  },
  
  imageUrl: { type: [String], default: [] },

  netContent: {
    type: String, // Example: "100ml"
  },
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






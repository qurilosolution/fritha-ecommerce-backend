const mongoose = require('mongoose');

// Variant Schema
const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
    required: true,
  },
  
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
  usp:{
    type: String,
  },
  mrp: {
    type: Number,
  
  },
  stock: {
    type: Number,
    required: true,
    default: 10,
  },
  discount: {
    type: Number,
  },
  pricePerUnit: {
    type: Number,
  },
  pricePerUnitDiscount: {
    type: Number,
  },
  combo: {
    type: String,
  },
  isStock: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: [String],
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
  salePrice: {
    type: Number,
  },
  saleStartDate: {
    type: Date,
  },
  saleEndDate: {
    type: Date,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  publicIds: [{ type: String }]
 
}, { timestamps: true });


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

  
module.exports = mongoose.model('Variant', variantSchema);

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },  // Coupon code (e.g., "SUMMER25")
  discountValue:{type: Number,min: 0 },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],  // List of applicable products
  couponType: { type: String, enum: ['flat', 'percentage'], required: true }, 
  startDate: { type: Date, required: true },  // Coupon start date
  endDate: { type: Date, required: true },  // Coupon expiry date
  maxUsage: { type: Number, default: 1 },  // Max usage per coupon
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },  // Coupon status
  deletedAt: { type: Date, default: null },  // Timestamp for soft deletion
});

const Couponinfo = mongoose.model('Coupon', couponSchema);

module.exports = Couponinfo;

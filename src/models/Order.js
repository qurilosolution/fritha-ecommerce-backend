const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, required: true },
        mrp: { type: Number, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending','Shipping', 'Delivered'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Middleware to update the `updatedAt` field before saving
OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});



module.exports = mongoose.model('Order', OrderSchema);

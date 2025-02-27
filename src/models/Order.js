const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ShippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
});
const billingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
});

function generateInvoiceNo() {
  const prefix = 'FRITHA';
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase(); // Random 5 chars
  const timestamp = Date.now().toString().slice(-5); // Last 5 digits of the timestamp

  return `${prefix}${randomString}${timestamp}`;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, required: true },
        mrp: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMode: { type: String, enum: ['COD', 'Online' ,'Card'], required: true },
    paymentStatus: { type: String, enum: ['Unpaid', 'Processing', 'Paid', 'Refund', 'Failed'], default: 'Unpaid' },
    status: { type: String, enum: ['Pending', 'Placed', 'Cancelled', 'Shipped', 'Packaging', 'In Progress', 'Completed' ,'Delivered'], default: 'Pending' },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    billingAddress: { type: billingAddressSchema, required: true },
    orderId: { type: String, default: uuidv4 },
    paymentId: { type: String },
    invoiceNo: { type: String, default: generateInvoiceNo },
    invoiceUrl: { type :String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true }
);



module.exports = mongoose.model('Order', OrderSchema);

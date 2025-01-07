const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  
  isDefault: { type: Boolean, default: false },
  type: { type: String, required: true , enum: ['Home', 'Work', 'Other'] },
})
const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String  , required: false},
  password: { type: String, required: true },
  gender: { type: String , required:false },
  
  birthDate: { type: String  , required:false},
  addresses:[{type:AddressSchema}]
});

const CustomerModel = mongoose.model('Customer', customerSchema);
module.exports = { CustomerModel };
  
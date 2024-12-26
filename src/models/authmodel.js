const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String  , required: false},
  password: { type: String, required: true },
  gender: { type: String , required:false },
  
  birthDate: { type: String  , required:false},
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

const AuthModel = mongoose.model('Auth', authSchema);

module.exports = { AuthModel };
  
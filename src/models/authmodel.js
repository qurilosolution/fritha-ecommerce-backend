const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phoneNumber: { type: String },
  password: { type: String, required: true },
  gender: { type: String },
  birthDate: { type: String },
});

const AuthModel = mongoose.model('Auth', authSchema);

module.exports = { AuthModel };

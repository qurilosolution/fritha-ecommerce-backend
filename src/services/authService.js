// const jwt = require('jsonwebtoken');
// const { AuthModel } = require('../models/authmodel');
// const { genPassword, comparePassword } = require('../utils/auth');
// const { v4: uuidv4 } = require('uuid');
// const sendMail = require('../utils/mailer');
// const { generateToken, verifyToken } = require('../utils/token');
// require('dotenv').config();
// console.log(process.env.SECRET_KEY,"secret")
// const otpStore = {};
// const OTP_EXPIRY_TIME = 3 * 60 * 1000; // 3 minutes expiry

// // Function to handle user signup
// async function signupService({ firstName, lastName, email, phoneNumber, password, gender, birthDate }) {
//   const existingUser = await AuthModel.findOne({ email });
//   if (existingUser) throw new Error('User already exists with this email');

//   const hashedPassword = await genPassword(password);
//   const newUser = new AuthModel({
//     firstName,
//     lastName,
//     email,
//     phoneNumber,
//     password: hashedPassword,
//     gender,
//     birthDate,
//   });

//   await newUser.save();
//   return newUser;
// }

// // Function to handle user login
// async function loginService(email, password) {
//   const user = await AuthModel.findOne({ email});
//   if (!user) {
//     console.log(`No user found with email: ${email}`);
//     throw new Error('User not found');
//   }

//   const isPasswordMatch = await comparePassword(user.password, password);
//   if (!isPasswordMatch) {
//     console.log(`Password mismatch for user: ${email}`);
//     throw new Error('Invalid credentials');
//   }

//   const token = jwt.sign({ user_id: user._id, email: user.email }, process.env.SECRET_KEY, {
//     expiresIn: '1h',
//   });

//   console.log(`User logged in successfully: ${email}`);
//   return { user, token };
// }


// // Function to send OTP
// async function sendOtpService(email) {
//   const user = await AuthModel.findOne({ email });
//   if (!user) throw new Error('User not found');

//   const otp = uuidv4().slice(0, 6).toUpperCase();
//   const otpExpiration = Date.now() + OTP_EXPIRY_TIME;
//   otpStore[email] = { otp, expiry: otpExpiration };

//   const subject = 'Your OTP for Password Reset';
//   const html = `<p>Your OTP is <b>${otp}</b>. It is valid for 3 minutes.</p>`;
//   await sendMail(email, subject, null, html);

//   return { otp };
// }

// // Function to verify OTP
// function verifyOtpService(email, otp) {
//   const storedOtp = otpStore[email];
//   if (!storedOtp || storedOtp.otp !== otp) throw new Error('Invalid OTP');
//   if (Date.now() > storedOtp.expiry) {
//     delete otpStore[email];
//     throw new Error('OTP has expired');
//   }

//   return generateToken({ email }, '10m'); // Token valid for 10 minutes
// }

// // Function to reset password with OTP
// async function resetPasswordWithOtpService(email, newPassword) {
//   const user = await AuthModel.findOne({ email });
//   if (!user) throw new Error('User not found');

//   const hashedPassword = await genPassword(newPassword);
//   user.password = hashedPassword;
//   await user.save();
// }

// // Function to reset password with old password
// async function resetPasswordService(userId, oldPassword, newPassword) {
//   const user = await AuthModel.findById(userId);
//   if (!user) throw new Error('User not found');

//   const isOldPasswordValid = await comparePassword(user.password, oldPassword);
//   if (!isOldPasswordValid) throw new Error('Invalid old password');

//   const hashedPassword = await genPassword(newPassword);
//   user.password = hashedPassword;
//   await user.save();
// }

// module.exports = {
//   signupService,
//   loginService,
//   sendOtpService,
//   verifyOtpService,
//   resetPasswordWithOtpService,
//   resetPasswordService,
// };

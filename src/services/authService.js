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

const AdminModel = require("../models/adminModel");
const { genPassword, comparePassword } = require("../utils/auth");
const jwt=require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY=process.env.SECRET_KEY
console.log(JWT_SECRET_KEY,"jwt secret key");
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

exports.adminSignup=async(firstName,lastName,email,password)=>{
    try{
    const existingUser = await AdminModel.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists with this email");
    }
    console.log(email,password)
    const hashedPassword = await genPassword(password);
    const newUser = new AdminModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });
    await newUser.save();
    return {
        success: true,
        message: "Admin User  created successfully",
        user: newUser,
    };
  }
    catch (error) {
        throw new Error(`Error during signup: ${error.message}`);

        }
}
exports.adminLogin=async(email,password)=>{
    try{
        const adminUser=await AdminModel.findOne({email});
        if(!adminUser)
            throw new Error('User not Found');
        const isPasswordMatch=await comparePassword(adminUser.password,password);
        if(!isPasswordMatch)
            throw new Error('Password do not match');
        const token=jwt.sign({
            id:adminUser.id,
            name:adminUser.firstName+adminUser.lastName,
            email:adminUser.email,
            role:"admin"
        },JWT_SECRET_KEY,{expiresIn:'24h'})
        return {
            success:true,
            message:"Login Succesfully",
            user:adminUser,
            token:token
        }
    }    
    catch(error){
        throw new Error(`Error in login ${error.message}`)
        }
    }



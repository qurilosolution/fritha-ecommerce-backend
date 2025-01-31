const jwt = require("jsonwebtoken");
require("dotenv").config();
const { CustomerModel } = require("../models/customerModel");
const { genPassword, comparePassword } = require("../utils/auth");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../utils/mailer"); // Adjusted to use the sendMail function
const { generateToken, generateOtp } = require("../utils/token");
const { verifyToken } = require("../utils/token");
const AuthService=require('../services/authService');
const { get } = require("mongoose");
const forgotPasswordEmail = require("../services/emailService");
const OTP_EXPIRY_TIME = 3 * 60 * 1000; // 3 minute expiry
const authResolvers = {
  Query: {
   
    getUser: async (_, __, context) => {
      console.log(context, "Context received");
    
      try {
        // Check if the user object exists in the context
        if (!context.user) {
          throw new Error("Authentication token is missing. Please log in.");
        }
    
        // Verify that `context.user` is an object
        if (typeof context.user !== "object") {
          throw new Error("Invalid user context: Expected an object.");
        }
    
        // Extract user information from the context
        const { id } = context.user;
    
        // Find the user in the database using the extracted ID
        const user = await CustomerModel.findById(id);
    
        if (!user) {
          throw new Error("User not found");
        }
    
        // Return the user data
        return user;
      } catch (error) {
        console.error("Error fetching user:", error.message);
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },

    getUsers: async (_, { page = 1, limit = 10 }) => {
      try {
        
    
        // Fetch the total count of users (for pagination)
        const totalUsers = await CustomerModel.countDocuments();
    
        // Calculate how many users to skip (for pagination)
        const skip = (page - 1) * limit;
    
        // Fetch users with pagination (skip and limit)
        const users = await CustomerModel.find()
          .skip(skip)
          .limit(limit)
          .sort({ lastLogin: -1 });  // Optional: Sort by lastLogin or other field
    
        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / limit);
    
        // Return users along with pagination data
        return {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers
          }
        };
      } catch (error) {
        console.error("Error fetching users:", error.message);
        throw new Error(`Error fetching users: ${error.message}`);
      }
    },    
    
    getProfile: async (_,{},context) => {
      try {
        if (!context.user) {
          throw new Error("User not authenticated");
        }
        console.log(context.user);
        const userId = context.user.id;
        const profile = await CustomerModel.findById(userId).select("firstName lastName email phoneNumber gender birthDate");

        return {
          success: true,
          message: "Profile fetched successfully",
          profile,
        };
      } catch (error) {
        throw new Error(`Error fetching profile: ${error.message}`);
      }
    },

  },
  Mutation: {
    signup: async (
      _,
      { firstName, lastName, email, phoneNumber, password, gender, birthDate }
    ) => {
      try {
        const existingUser = await CustomerModel.findOne({ email });
        if (existingUser) {
          throw new Error("User already exists with this email");
        }
        const isAdmin = email.includes("admin"); 
        const hashedPassword = await genPassword(password);
        const newUser = new CustomerModel({
          firstName,
          lastName,
          email,
          phoneNumber,
          password: hashedPassword,
          gender,
          birthDate,
          lastLogin: new Date(),
          
        });
        await newUser.save();
        return {
          success: true,
          message: "User registered successfully",
          user: newUser,
        };
      } catch (error) {
        throw new Error(`Error during signup: ${error.message}`);
      }
    },
    adminSignup:async(_,{firstName,lastName,email,password})=>{
      try {
        
        const response=await AuthService.adminSignup(firstName,lastName,email,password);
        return response
      } catch (error) {
        throw new Error(`Error during signup: ${error.message}`);
      }
    },
    login: async (_, { email, password }, { res }) => {
      try {
        const user = await CustomerModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        console.log(user);
        const isPasswordMatch = await comparePassword(user.password, password);
        if (!isPasswordMatch) {
          throw new Error("Invalid credentials");
        }

        // Update lastLogin each time a user logs in
        user.lastLogin = new Date();
        await user.save();

        
        const token = jwt.sign(
          {
            id: user._id,
            name: user.firstName + user.lastName,
            email: user.email,
            role: "customer",
          },
          process.env.SECRET_KEY,
          { expiresIn: "24h" }
        );

        return {
          success: true,
          message: "Login successful",
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            gender: user.gender,
            birthDate: user.birthDate,
            lastLogin:user.lastLogin,
          },  
          token,
          
        };
       
      } catch (error) {
        throw new Error(`Error during login: ${error.message}`);
      }
    },
    adminLogin: async (_, { email, password }, { res }) => {
      try{
        const response=await AuthService.adminLogin(email,password);
        return response;
      }
      catch(error){
        throw new Error(`Error during login:${error.message}`)
      }
    },
    sendOtp: async (_, { email }, { res }) => {
      try {
        const user = await CustomerModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        const otp = generateOtp();
        user.otp = otp;
        user.expiry=Date.now() + OTP_EXPIRY_TIME;
        await user.save();
        await forgotPasswordEmail(email, otp);
        return {
          success: true,
          message: "OTP sent successfully",
        };
      } catch (error) {
        throw new Error(`Error sending OTP: ${error.message}`);
    }
  },
    verifyOtp: async (_, { email, otp }, { res }) => {
      try {
        const user=await CustomerModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");  
        } 
        if (!user.otp || user.otp !== otp) {
          throw new Error("Invalid OTP");
        }
        if (Date.now() > user.expiry) {
          user.otp = null; // Expired OTP, remove it from storage
          user.expiry=null;
          throw new Error("OTP has expired");
        }
        // OTP is valid, generate a token
        const token = generateToken({ email }, "10m"); // Token valid for 10 minutes
        // Set the token in a secure, HTTP-only cookie
        // res.cookie("resetToken", token, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === "production", // Use secure flag in production
        //   maxAge: 10 * 60 * 1000, // 10 minutes
        // });
        user.otp = null; // OTP has been verified, remove it from storage
        user.expiry=null;
        await user.save();
        return {
          success: true,
          message: "OTP verified successfully",
          token
        };
      } catch (error) {
        throw new Error(`Error verifying OTP: ${error.message}`);
      }
    },

    
    resetPassword: async (_, { newPassword,token}, { req }) => {
      try {
        // Get the token from cookies
        
        if (!token) {
          throw new Error("Authorization token is missing");
        }
        // Verify the token
        const decoded = verifyToken(token);
        // Retrieve the email from the token payload
        const { email } = decoded;
        // Fetch the user
        const user = await CustomerModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        // Hash the new password
        const hashedPassword = await genPassword(newPassword);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
       
        return {
          success: true,
          message: "Password updated successfully",
        };
      } catch (error) {
        console.error("Error resetting password with OTP:", error);
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },
    changePassword: async (_, { oldPassword, newPassword },context) => {
      try {
        // Extract the token from cookies
        if (!context.user) {
          throw new Error("User not authenticated");
        }
        const userId = context.user.id;
        const user = await CustomerModel.findById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        // Verify the old password (if applicable)
        const isOldPasswordValid = await comparePassword(
          user.password,
          oldPassword
        );
        if (!isOldPasswordValid) {
          throw new Error("Invalid old password");
        }
        // Hash the new password
        const hashedPassword = await genPassword(newPassword);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        return {
          success: true,
          message: "Password updated successfully",
        };
      } catch (error) {
        console.error("Error resetting password:", error);
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },
 
  updateProfile: async (_,{firstName,lastName,email,phoneNumber,gender,birthDate , lastLogin},context) => {
    try {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const userId = context.user.id;
      // const updatedProfile = await CustomerModel.findByIdAndUpdate(
      //   userId,
      //   { firstName, lastName, email, phoneNumber, gender, birthDate ,lastLogin },
      //   { new: true }
      // ).select("firstName lastName email phoneNumber gender birthDate lastLogin");
      // If lastLogin is provided in the update, use the new date (or set it as null)
    const updatedData = { firstName, lastName, email, phoneNumber, gender, birthDate };
    if (lastLogin !== undefined) {
      updatedData.lastLogin = lastLogin ? new Date(lastLogin) : new Date();  // Use new Date() if lastLogin is empty or null
    }

    const updatedProfile = await CustomerModel.findByIdAndUpdate(
      userId,
      updatedData,
      { new: true }
    ).select("firstName lastName email phoneNumber gender birthDate lastLogin")
      return {
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      };
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  },
  },
};
module.exports = authResolvers;

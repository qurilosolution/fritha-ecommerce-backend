const jwt = require("jsonwebtoken");
require("dotenv").config();
const { AuthModel } = require("../models/authmodel");
const { genPassword, comparePassword } = require("../utils/auth");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../utils/mailer"); // Adjusted to use the sendMail function
const { generateToken } = require("../utils/token");
const { verifyToken } = require("../utils/token");

const otpStore = {};
const OTP_EXPIRY_TIME = 3 * 60 * 1000; // 1 minute expiry
const authResolvers = {
  Query: {
    getUser: async (_, { email },context) => {
      try {
        console.log(context.user);
        if(!context.user)
          throw Error("You must be logged in to get user info");
        if(!context.user.role.includes("admin"))
          throw Error("You must be an admin to create a  user");
        
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },
  },
  Mutation: {
    signup: async (
      _,
      { firstName, lastName, email, phoneNumber, password, gender, birthDate }
    ) => {
      try {
        const existingUser = await AuthModel.findOne({ email });
        if (existingUser) {
          throw new Error("User already exists with this email");
        }
        const hashedPassword = await genPassword(password);
        const newUser = new AuthModel({
          firstName,
          lastName,
          email,
          phoneNumber,
          password: hashedPassword,
          gender,
          birthDate,
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
    login: async (_, { email, password }, { res }) => {
      try {
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        const isPasswordMatch = await comparePassword(user.password, password);
        if (!isPasswordMatch) {
          throw new Error("Invalid credentials");
        }
        const token = jwt.sign(
          {
            id: user._id,
            name: user.firstName + user.lastName,
            email: user.email,
            role: "admin",
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
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
          },
          token,
        };
      } catch (error) {
        throw new Error(`Error during login: ${error.message}`);
      }
    },

    verifyOtp: async (_, { email, otp }, { res }) => {
      try {
        const storedOtp = otpStore[email];
        if (!storedOtp || storedOtp.otp !== otp) {
          throw new Error("Invalid OTP");
        }
        if (Date.now() > storedOtp.expiry) {
          delete otpStore[email]; // Expired OTP, remove it from storage
          throw new Error("OTP has expired");
        }
        // OTP is valid, generate a token
        const token = generateToken({ email }, "50m"); // Token valid for 10 minutes
        // Set the token in a secure, HTTP-only cookie
        res.cookie("resetToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure flag in production
          maxAge: 50 * 60 * 1000, // 10 minutes
        });
        return {
          success: true,
          message: "OTP verified successfully",
        };
      } catch (error) {
        throw new Error(`Error verifying OTP: ${error.message}`);
      }
    },

    resetPasswordWithOtp: async (_, { newPassword }, { req }) => {
      try {
        // Get the token from cookies
        const token = req.cookies.resetToken;
        if (!token) {
          throw new Error("Authorization token is missing");
        }
        // Verify the token
        const decoded = verifyToken(token);
        // Retrieve the email from the token payload
        const { email } = decoded;
        // Fetch the user
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error("User not found");
        }
        // Hash the new password
        const hashedPassword = await genPassword(newPassword);
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        // Clear the reset token cookie
        req.res.clearCookie("resetToken");
        return {
          success: true,
          message: "Password updated successfully",
        };
      } catch (error) {
        console.error("Error resetting password with OTP:", error);
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },
    resetPassword: async (_, { oldPassword, newPassword }, { req }) => {
      try {
        // Extract the token from cookies
        const token = req.cookies.token;
        if (!token) {
          throw new Error("User not authenticated");
        }
        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.user_id;
        // Find the user in the database
        const user = await AuthModel.findById(userId);
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
  },
};
module.exports = authResolvers;

// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { AuthModel } = require('../models/authmodel');
// const { genPassword, comparePassword } = require('../utils/auth'); // Ensure these return Promises

 
// const authResolvers = {
//   Query: {
//     getUser: async (_, { email }) => {
//       try {
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }
//         return user;
//       } catch (error) {
//         throw new Error(`Error fetching user: ${error.message}`);
//       }
//     },
//   },
//   Mutation: {
//     signup: async (_, { firstName, lastName, email, phoneNumber, password, gender, birthDate }) => {
//       try {
//         // Check if user already exists
//         const existingUser = await AuthModel.findOne({ email });
//         if (existingUser) {
//           throw new Error('User already exists with this email');
//         }

//         // Hash password
//         const hashedPassword = await genPassword(password);

//         // Create new user
//         const newUser = new AuthModel({
//           firstName,
//           lastName,
//           email,
//           phoneNumber,
//           password: hashedPassword,
//           gender,
//           birthDate,
//         });

//         await newUser.save();

//         return {
//           success: true,
//           message: 'User registered successfully',
//           user: newUser,
//         };
//       } catch (error) {
//         throw new Error(`Error during signup: ${error.message}`);
//       }
//     },

//     login: async (_, { email, password }, { res }) => {
//       try {
//         // Find user by email
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         // Verify password
//         const isPasswordMatch = await comparePassword(user.password, password);
//         if (!isPasswordMatch) {
//           throw new Error('Invalid credentials');
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//           { user_id: user._id, email: user.email },
//           process.env.SECRET_KEY,
//           { expiresIn: '1h' }
//         );

//         // Set the token in an HTTP-only cookie
//         res.cookie('token', token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           maxAge: 3600000, // 1-hour expiration
//         });

//         return {
//           success: true,
//           message: 'Login successful',
//           user: {
//             id: user._id,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             email: user.email,
//             phoneNumber: user.phoneNumber,
//             gender: user.gender,
//             birthDate: user.birthDate,
//           },
//           token,
//         };
//       } catch (error) {
//         throw new Error(`Error during login: ${error.message}`);
//       }
//     },

//     resetPassword: async (_, { email, oldPassword, newPassword }) => {
//       try {
//         // Find user by email
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         // Verify old password
//         const isOldPasswordMatch = await comparePassword(user.password, oldPassword);
//         if (!isOldPasswordMatch) {
//           throw new Error('Old password is incorrect');
//         }

//         // Hash new password
//         const hashedNewPassword = await genPassword(newPassword);

//         // Update the password in the database
//         user.password = hashedNewPassword;
//         await user.save();

//         return {
//           success: true,
//           message: 'Password updated successfully',
//         };
//       } catch (error) {
//         throw new Error(`Error resetting password: ${error.message}`);
//       }
//     },
//   },
// };

// module.exports = { authResolvers };

// authResolvers.js



const jwt = require('jsonwebtoken');
require('dotenv').config();
const { AuthModel } = require('../models/authmodel');
const { genPassword, comparePassword } = require('../utils/auth'); // Ensure these return Promises
const { v4: uuidv4 } = require('uuid');
const transporter = require('../utils/mailer'); // Import the transporter from mailer.js

// Temporary storage for OTPs (Consider using a proper cache like Redis for production)
const otpStore = {};
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes expiry

const authResolvers = {
  Query: {
    getUser: async (_, { email }) => {
      try {
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },
  },
  Mutation: {
    signup: async (_, { firstName, lastName, email, phoneNumber, password, gender, birthDate }) => {
      try {
        const existingUser = await AuthModel.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists with this email');
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
          message: 'User registered successfully',
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
          throw new Error('User not found');
        }

        const isPasswordMatch = await comparePassword(user.password, password);
        if (!isPasswordMatch) {
          throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
          { user_id: user._id, email: user.email },
          process.env.SECRET_KEY,
          { expiresIn: '1h' }
        );

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600000, // 1-hour expiration
        });

        return {
          success: true,
          message: 'Login successful',
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

    sendOtp: async (_, { email }) => {
      try {
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }

        // Generate OTP and store it with an expiry time
        const otp = uuidv4().slice(0, 6).toUpperCase(); // Generate a 6-character OTP
        const otpExpiration = Date.now() + OTP_EXPIRY_TIME; // OTP expiry time
        otpStore[email] = { otp, expiry: otpExpiration };

        // Send OTP to user's email
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your OTP for Password Reset',
          text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
        });

        return {
          success: true,
          message: 'OTP sent to your email',
        };
      } catch (error) {
        throw new Error(`Error sending OTP: ${error.message}`);
      }
    },

    verifyOtp: async (_, { email, otp }) => {
      try {
        // Check if the OTP is valid and not expired
        const storedOtp = otpStore[email];
        if (!storedOtp || storedOtp.otp !== otp) {
          throw new Error('Invalid OTP');
        }

        if (Date.now() > storedOtp.expiry) {
          delete otpStore[email]; // Expired OTP, remove it from storage
          throw new Error('OTP has expired');
        }

        // OTP is valid, remove it from the store
        delete otpStore[email];

        return {
          success: true,
          message: 'OTP verified successfully',
        };
      } catch (error) {
        throw new Error(`Error verifying OTP: ${error.message}`);
      }
    },

    resetPasswordWithOtp: async (_, { email, newPassword }) => {
      try {
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }

        // Hash the new password
        const hashedPassword = await genPassword(newPassword);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return {
          success: true,
          message: 'Password updated successfully',
        };
      } catch (error) {
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },
  },
};

module.exports = { authResolvers };







// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// require('dotenv').config();
// const { AuthModel } = require('../models/authmodel');
// const { genPassword, comparePassword } = require('../utils/auth');
// const { v4: uuidv4 } = require('uuid');

// // Temporary storage for OTPs (Consider using a proper cache like Redis for production)
// const otpStore = {};

// // Configure Nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail', // or any email service you use
//   auth: {
//     user: process.env.EMAIL_USER, // Add your email
//     pass: process.env.EMAIL_PASSWORD, // Add your email password
//   },
// });

// const authResolvers = {
//   Mutation: {
//     sendOtp: async (_, { email }) => {
//       try {
//         // Check if user exists
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         // Generate OTP and store it
//         const otp = uuidv4().slice(0, 6).toUpperCase(); // Generate a 6-character OTP
//         otpStore[email] = otp;

//         // Send OTP to user's email
//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: email,
//           subject: 'Your OTP for Password Reset',
//           text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
//         });

//         return {
//           success: true,
//           message: 'OTP sent to your email',
//         };
//       } catch (error) {
//         throw new Error(`Error sending OTP: ${error.message}`);
//       }
//     },

//     verifyOtp: async (_, { email, otp }) => {
//       try {
//         if (!otpStore[email] || otpStore[email] !== otp) {
//           throw new Error('Invalid or expired OTP');
//         }

//         // OTP is valid, remove it from the store
//         delete otpStore[email];

//         return {
//           success: true,
//           message: 'OTP verified successfully',
//         };
//       } catch (error) {
//         throw new Error(`Error verifying OTP: ${error.message}`);
//       }
//     },

//     resetPasswordWithOtp: async (_, { email, newPassword }) => {
//       try {
//         // Find the user
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         // Hash the new password
//         const hashedPassword = await genPassword(newPassword);

//         // Update the user's password
//         user.password = hashedPassword;
//         await user.save();

//         return {
//           success: true,
//           message: 'Password updated successfully',
//         };
//       } catch (error) {
//         throw new Error(`Error resetting password: ${error.message}`);
//       }
//     },
//   },
// };

// module.exports = { authResolvers };

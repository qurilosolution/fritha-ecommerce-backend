// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { AuthModel } = require('../models/authmodel');
// const { genPassword, comparePassword } = require('../utils/auth'); // Ensure these return Promises
// const { v4: uuidv4 } = require('uuid');
// const transporter = require('../utils/mailer'); // Import the transporter from mailer.js

// // Temporary storage for OTPs (Consider using a proper cache like Redis for production)
// const otpStore = {};
// const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes expiry
// console.log(transporter);


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
//         const existingUser = await AuthModel.findOne({ email });
//         if (existingUser) {
//           throw new Error('User already exists with this email');
//         }

//         const hashedPassword = await genPassword(password);

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
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         const isPasswordMatch = await comparePassword(user.password, password);
//         if (!isPasswordMatch) {
//           throw new Error('Invalid credentials');
//         }

//         const token = jwt.sign(
//           { user_id: user._id, email: user.email },
//           process.env.SECRET_KEY,
//           { expiresIn: '1h' }
//         );

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

//     sendOtp: async (_, { email }) => {
//       try {
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         // Generate OTP and store it with an expiry time
//         const otp = uuidv4().slice(0, 6).toUpperCase(); // Generate a 6-character OTP
//         const otpExpiration = Date.now() + OTP_EXPIRY_TIME; // OTP expiry time
//         otpStore[email] = { otp, expiry: otpExpiration };

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
//         // Check if the OTP is valid and not expired
//         const storedOtp = otpStore[email];
//         if (!storedOtp || storedOtp.otp !== otp) {
//           throw new Error('Invalid OTP');
//         }

//         if (Date.now() > storedOtp.expiry) {
//           delete otpStore[email]; // Expired OTP, remove it from storage
//           throw new Error('OTP has expired');
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


const jwt = require('jsonwebtoken');
require('dotenv').config();
const { AuthModel } = require('../models/authmodel');
const { genPassword, comparePassword } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('../utils/mailer'); // Adjusted to use the sendMail function
const { generateToken } = require('../utils/newpasswordtoken');
const { verifyToken } = require('../utils/newpasswordtoken');



// Temporary storage for OTPs (Consider using a proper cache like Redis for production)
const otpStore = {};
const OTP_EXPIRY_TIME = 3 * 60 * 1000; // 1 minute expiry

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




    // sendOtp: async (_, { email }) => {
    //   try {
    //     const user = await AuthModel.findOne({ email });
    //     if (!user) {
    //       throw new Error('User not found');
    //     }

    //     // Generate OTP
    //     const otp = uuidv4().slice(0, 6).toUpperCase();
    //     const otpExpiration = Date.now() + OTP_EXPIRY_TIME; // OTP expiry time
    //     otpStore[email] = { otp, expiry: otpExpiration };

    //     // Email content
    //     const subject = 'Your OTP for Password Reset';
    //     const html = `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`;
       
    //     // Send OTP to user's email
    //     await sendMail(email, subject, null, html);

    //     return {
    //       success: true,
    //       message: 'OTP sent to your email',
    //     };
    //   } catch (error) {
    //     console.error('Error in sendOtp:', error.message);
    //     throw new Error(`Error sending OTP: ${error.message}`);
    //   }
    // },


    
    // verifyOtp: async (_, { email, otp }) => {
    //   try {
    //     // Check if the OTP is valid and not expired
    //     const storedOtp = otpStore[email];
    //     if (!storedOtp || storedOtp.otp !== otp) {
    //       throw new Error('Invalid OTP');
    //     }

    //     if (Date.now() > storedOtp.expiry) {
    //       delete otpStore[email]; // Expired OTP, remove it from storage
    //       throw new Error('OTP has expired');
    //     }

    //     // OTP is valid, remove it from the store
    //     delete otpStore[email];

    //     return {
    //       success: true,
    //       message: 'OTP verified successfully',
    //     };
    //   } catch (error) {
    //     throw new Error(`Error verifying OTP: ${error.message}`);
    //   }
    // },

    // resetPasswordWithOtp: async (_, { email, newPassword }) => {
    //   try {
    //     const user = await AuthModel.findOne({ email });
    //     if (!user) {
    //       throw new Error('User not found');
    //     }

    //     // Hash the new password
    //     const hashedPassword = await genPassword(newPassword);

    //     // Update the user's password
    //     user.password = hashedPassword;
    //     await user.save();

    //     return {
    //       success: true,
    //       message: 'Password updated successfully',
    //     };
    //   } catch (error) {
    //     throw new Error(`Error resetting password: ${error.message}`);
    //   }
    // },




    
    // resetPasswordWithOtp: async (_, { email, newPassword }) => {
    //   try {
    //     console.log(newPassword,"lloollollo")
    //     // Check if OTP exists in store for the provided email
    //     const storedOtp = otpStore[email];
    //     if (!storedOtp) {
    //       throw new Error('OTP not generated or expired'); // OTP was not found
    //     }
    
    //     // Check if the OTP has expired
    //     if (Date.now() > storedOtp.expiry) {
    //       delete otpStore[email]; // Remove expired OTP
    //       throw new Error('OTP has expired');
    //     }
    
    //     // Verify the OTP (Here we compare the provided OTP with the stored OTP)
    //     // Assuming the client will send the OTP they received as a separate field
    //     if (storedOtp.otp !== otp) {
    //       throw new Error('Invalid OTP'); // OTP doesn't match
    //     }
    
    //     // OTP is valid, proceed with password reset
    //     const user = await AuthModel.findOne({ email });
    //     if (!user) {
    //       throw new Error('User not found');
    //     }
    
    //     // Hash the new password
    //     const hashedPassword = await genPassword(newPassword);
    
    //     // Update the user's password
    //     user.password = hashedPassword;
    //     await user.save();
    
    //     // Remove OTP from the store after successful password reset
    //     delete otpStore[email];
    
    //     return {
    //       success: true,
    //       message: 'Password updated successfully',
    //     };
    //   } catch (error) {
    //     console.error('Error resetting password with OTP:', error);
    //     throw new Error(`Error resetting password: ${error.message}`);
    //   }
    // },
    


    sendOtp: async (_, { email }) => {
      try {
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }

        // Generate OTP
        const otp = uuidv4().slice(0, 6).toUpperCase();
        const otpExpiration = Date.now() + OTP_EXPIRY_TIME; // OTP expiry time set to 1 minute
        otpStore[email] = { otp, expiry: otpExpiration };

        // Email content
        const subject = 'Your OTP for Password Reset';
        const html = `<p>Your OTP is <b>${otp}</b>. It is valid for 3 minute.</p>`;
        
        // Send OTP to user's email
        await sendMail(email, subject, null, html);

        return {
          success: true,
          message: 'OTP sent to your email',
        };
      } catch (error) {
        console.error('Error in sendOtp:', error.message);
        throw new Error(`Error sending OTP: ${error.message}`);
      }
    },

    // verifyOtp: async (_, { email, otp }) => {
    //   try {
    //     // Check if the OTP is valid and not expired
    //     const storedOtp = otpStore[email];
    //     if (!storedOtp || storedOtp.otp !== otp) {
    //       throw new Error('Invalid OTP');
    //     }

    //     if (Date.now() > storedOtp.expiry) {
    //       delete otpStore[email]; // Expired OTP, remove it from storage
    //       throw new Error('OTP has expired');
    //     }

    //     // OTP is valid, remove it from the store
    //     delete otpStore[email];

    //     return {
    //       success: true,
    //       message: 'OTP verified successfully',
    //     };
    //   } catch (error) {
    //     throw new Error(`Error verifying OTP: ${error.message}`);
    //   }
    // },


    verifyOtp: async (_, { email, otp }, { res }) => {
      try {
        const storedOtp = otpStore[email];
        if (!storedOtp || storedOtp.otp !== otp) {
          throw new Error('Invalid OTP');
        }
    
        if (Date.now() > storedOtp.expiry) {
          delete otpStore[email]; // Expired OTP, remove it from storage
          throw new Error('OTP has expired');
        }
    
        // OTP is valid, generate a token
        const token = generateToken({ email }, '10m'); // Token valid for 10 minutes
    
        // Set the token in a secure, HTTP-only cookie
        res.cookie('resetToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure flag in production
          maxAge: 10 * 60 * 1000, // 10 minutes
        });
    
        return {
          success: true,
          message: 'OTP verified successfully',
        };
      } catch (error) {
        throw new Error(`Error verifying OTP: ${error.message}`);
      }
    },


    // resetPasswordWithOtp: async (_, { email, otp, newPassword }) => {
    //   try {
    //     console.log(otp,";;lllkkk")
    //     // Check if OTP exists in store for the provided email
    //     const storedOtp = otpStore[email];
    //     if (!storedOtp) {
    //       throw new Error('OTP not generated or expired'); // OTP was not found
    //     }
    
    //     // Check if the OTP has expired
    //     if (Date.now() > storedOtp.expiry) {
    //       delete otpStore[email]; // Remove expired OTP
    //       throw new Error('OTP has expired');
    //     }
    
    //     // Verify the OTP (Here we compare the provided OTP with the stored OTP)
    //     if (storedOtp.otp !== otp) {
    //       throw new Error('Invalid OTP'); // OTP doesn't match
    //     }
    
    //     // OTP is valid, proceed with password reset
    //     const user = await AuthModel.findOne({ email });
    //     if (!user) {
    //       throw new Error('User not found');
    //     }
    
    //     // Hash the new password
    //     const hashedPassword = await genPassword(newPassword);
    
    //     // Update the user's password
    //     user.password = hashedPassword;
    //     await user.save();
    
    //     // Remove OTP from the store after successful password reset
    //     delete otpStore[email];
    
    //     return {
    //       success: true,
    //       message: 'Password updated successfully',
    //     };
    //   } catch (error) {
    //     console.error('Error resetting password with OTP:', error);
    //     throw new Error(`Error resetting password: ${error.message}`);
    //   }
    // },


    resetPasswordWithOtp: async (_, { newPassword }, { req }) => {
      try {
        // Get the token from cookies
        const token = req.cookies.resetToken;
        if (!token) {
          throw new Error('Authorization token is missing');
        }
    
        // Verify the token
        const decoded = verifyToken(token);
    
        // Retrieve the email from the token payload
        const { email } = decoded;
    
        // Fetch the user
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }
    
        // Hash the new password
        const hashedPassword = await genPassword(newPassword);
    
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
    
        // Clear the reset token cookie
        req.res.clearCookie('resetToken');
    
        return {
          success: true,
          message: 'Password updated successfully',
        };
      } catch (error) {
        console.error('Error resetting password with OTP:', error);
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },









    resetPassword: async (_, { oldPassword, newPassword }, { req }) => {
      try {
        // Extract the token from cookies
        const token = req.cookies.token;
        if (!token) {
          throw new Error('User not authenticated');
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decoded.user_id;

        // Find the user in the database
        const user = await AuthModel.findById(userId);
        if (!user) {
          throw new Error('User not found');
        }

        // Verify the old password (if applicable)
        const isOldPasswordValid = await comparePassword(user.password, oldPassword);
        if (!isOldPasswordValid) {
          throw new Error('Invalid old password');
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
        console.error("Error resetting password:", error);
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },
  },
};

module.exports = authResolvers;

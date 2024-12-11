// src/resolvers/authResolvers.js

// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { AuthModel } = require('../models/authmodel');
// const { genPassword, comparePassword } = require('../utils/auth');  // Password utilities

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
//         throw new Error(error.message);
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

//         const hashedPassword = genPassword(password);

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
//         throw new Error('Error during signup: ' + error.message);
//       }
//     },

//     login: async (_, { email, password }, { res }) => {
//       try {
//         const user = await AuthModel.findOne({ email });
//         if (!user) {
//           throw new Error('User not found');
//         }

//         const isPasswordMatch = comparePassword(user.password, password);
//         if (!isPasswordMatch) {
//           throw new Error('Invalid credentials');
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//           { user_id: user._id, email: user.email },
//           process.env.SECRET_KEY,
//           { expiresIn: '1h' } // Token expiration time
//         );

//         // Set the token in the cookie
//         res.cookie('token', token, {
//           httpOnly: true, // Makes the cookie accessible only by the server
//           secure: process.env.NODE_ENV === 'production', // Set to true if you're using HTTPS
//           maxAge: 3600000, // 1 hour expiration time
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
//           token, // Optionally return the token here if needed
//         };
//       } catch (error) {
//         throw new Error('Error during login: ' + error.message);
//       }
//     },
//   },
// };

// module.exports = { authResolvers };


const jwt = require('jsonwebtoken');
require('dotenv').config();
const { AuthModel } = require('../models/authmodel');
const { genPassword, comparePassword } = require('../utils/auth'); // Ensure these return Promises

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
        // Check if user already exists
        const existingUser = await AuthModel.findOne({ email });
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        // Hash password
        const hashedPassword = await genPassword(password);

        // Create new user
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

    // login: async (_, { email, password }, { res }) => {
    //   try {
    //     // Find user by email
    //     const user = await AuthModel.findOne({ email });
    //     if (!user) {
    //       throw new Error('User not found');
    //     }

    //     // Verify password
    //     const isPasswordMatch = await comparePassword(password, user.password);
    //     if (!isPasswordMatch) {
    //       throw new Error('Invalid credentials');
    //     }

    //     // Generate JWT token
    //     const token = jwt.sign(
    //       { user_id: user._id, email: user.email },
    //       process.env.SECRET_KEY,
    //       { expiresIn: '1h' } // Token expiration time
    //     );

    //     // Set the token in an HTTP-only cookie
    //     res.cookie('token', token, {
    //       httpOnly: true, // Accessible only by the server
    //       secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    //       maxAge: 3600000, // 1-hour expiration
    //     });

    //     return {
    //       success: true,
    //       message: 'Login successful',
    //       user: {
    //         id: user._id,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //         email: user.email,
    //         phoneNumber: user.phoneNumber,
    //         gender: user.gender,
    //         birthDate: user.birthDate,
    //       },
    //       token, // Optionally return the token for client-side storage
    //     };
    //   } catch (error) {
    //     throw new Error(`Error during login: ${error.message}`);
    //   }
    // },


    login: async (_, { email, password }, { res }) => {
      try {
        // Find user by email
        const user = await AuthModel.findOne({ email });
        if (!user) {
          throw new Error('User not found');
        }
    
        // Verify password
        const isPasswordMatch = await comparePassword(user.password, password); // Await the comparison
        if (!isPasswordMatch) {
          console.log(`Password mismatch for user: ${email}`);
          throw new Error('Invalid credentials');
        }
    
        // Generate JWT token
        const token = jwt.sign(
          { user_id: user._id, email: user.email },
          process.env.SECRET_KEY,
          { expiresIn: '1h' } // Token expiration time
        );
    
        // Set the token in an HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true, // Accessible only by the server
          secure: process.env.NODE_ENV === 'production', // HTTPS only in production
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
          token, // Optionally return the token for client-side storage
        };
      } catch (error) {
        console.log(`Error during login for email: ${email}`, error);
        throw new Error(`Error during login: ${error.message}`);
      }
    }
    












  },
};

module.exports = { authResolvers };

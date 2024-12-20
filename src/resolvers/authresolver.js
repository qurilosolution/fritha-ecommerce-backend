const {
  signupService,
  loginService,
  sendOtpService,
  verifyOtpService,
  resetPasswordWithOtpService,
  resetPasswordService,
} = require('../services/authService');
const jwt = require('jsonwebtoken');
const { AuthModel } = require('../models/authmodel');


const authResolvers = {
  Query: {
    getUser: async (_, { email} ) => {

      try {
        const user = await AuthModel.findOne({email});
        if (!user) throw new Error('User not found');
        return user;
      } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },
  },
  Mutation: {
    signup: async (_, args) => {
      try {
        const user = await signupService(args);
        return {
          success: true,
          message: 'User registered successfully',
          user,
        };
      } catch (error) {
        throw new Error(`Error during signup: ${error.message}`);
      }
    },

    login: async (_, { email, password }, { res }) => {
      try {
        const { user, token } = await loginService(email, password);

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3600000, // 1 hour
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
        const { otp } = await sendOtpService(email);
        return {
          success: true,
          message: 'OTP sent to your email',
        };
      } catch (error) {
        throw new Error(`Error sending OTP: ${error.message}`);
      }
    },

    verifyOtp: async (_, { email, otp }, { res }) => {
      try {
        const token = verifyOtpService(email, otp);

        res.cookie('resetToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
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

    resetPasswordWithOtp: async (_, { newPassword }, { req }) => {
      try {
        const token = req.cookies.resetToken;
        if (!token) throw new Error('Authorization token is missing');

        const { email } = jwt.verify(token, process.env.SECRET_KEY);
        await resetPasswordWithOtpService(email, newPassword);

        req.res.clearCookie('resetToken');
        return {
          success: true,
          message: 'Password updated successfully',
        };
      } catch (error) {
        throw new Error(`Error resetting password: ${error.message}`);
      }
    },

    resetPassword: async (_, { oldPassword, newPassword }, { req }) => {
      try {
        const token = req.cookies.token;
        if (!token) throw new Error('User not authenticated');

        const { user_id } = jwt.verify(token, process.env.SECRET_KEY);
        await resetPasswordService(user_id, oldPassword, newPassword);

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

module.exports = authResolvers;

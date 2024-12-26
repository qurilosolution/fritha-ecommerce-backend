const jwt = require('jsonwebtoken');
const { AuthModel } = require('../models/authmodel');
require('dotenv').config();

const authMiddleware = async ({ req }) => {
  console.log('req.headers:', req.headers); 

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization; 
    if (!authHeader) {
      console.log('No Authorization header found');
      return { user: null };
    }

    // Get token from 'Bearer token' format
    const authToken = authHeader.split(' ')[1]; 
    console.log('Extracted Token:', authToken);
    if (!authToken) {
      console.log('No auth token found in Authorization header');
      return { user: null };
    }
    // Token verification logic
    const userInfo = jwt.verify(authToken, process.env.SECRET_KEY);
    console.log('Decoded User Info:', userInfo);

  
     
    return { user:userInfo }; 
    
  } catch (err) {
    console.log('Error verifying token:', err);
    return { user: null };
  }
};

module.exports = { authMiddleware };

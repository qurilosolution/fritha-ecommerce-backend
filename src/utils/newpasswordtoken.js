const jwt = require('jsonwebtoken');

// Secret for JWT token generation (keep this secure in your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

/**
 * Generate a JWT token.
 * @param {Object} payload - Data to encode in the token.
 * @param {String} expiresIn - Expiration time for the token (e.g., '10m').
 * @returns {String} - The generated token.
 */
const generateToken = (payload, expiresIn = '10m') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token.
 * @param {String} token - The token to verify.
 * @returns {Object} - The decoded payload.
 * @throws {Error} - If the token is invalid or expired.
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};

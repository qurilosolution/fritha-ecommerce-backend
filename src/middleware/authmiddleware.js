
// authMiddleware.js
const jwt = require('jsonwebtoken');

const AuthMiddleware = async (req, res, next) => {
  try {
    // Get the token from cookies
    const authToken = req.cookies.token;
    if (!authToken) {
      return res.status(403).json({ status: 'failed', message: 'Unauthorized userrrr!' });
    }

    // Verify the token
    const userInfo = jwt.verify(authToken, process.env.SECRET_KEY);
    if (userInfo) {
      req.user_id = userInfo.user_id; // Store user_id in the request
      next(); // Allow the request to proceed
    } else {
      return res.status(403).json({ status: 'failed', message: 'Unauthorized user!' });
    }
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: 'failed', message: 'Unauthorized user!' });
  }
};

module.exports = { AuthMiddleware };


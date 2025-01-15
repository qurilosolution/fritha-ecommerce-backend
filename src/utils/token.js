const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


const generateToken = (payload, expiresIn = '10m') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
const generateOtp=()=>{
  return Math.floor(1000 + Math.random() * 9000);
}
module.exports = {
  generateToken,
  verifyToken,
  generateOtp
};



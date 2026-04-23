const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 * @param {string} userId 
 * @param {string} role 
 * @returns {string} token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { _id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
  );
};



/**
 * Verify Access or Refresh Token
 * @param {string} token 
 * @param {string} secret 
 * @returns {object} decoded payload
 */
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateAccessToken,
  verifyToken
};

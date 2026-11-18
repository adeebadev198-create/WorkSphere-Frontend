// backend/src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'worksphere_jwt_secret_super_secure_key_2026'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 401, 'User account no longer exists');
      }

      if (!user.isActive) {
        return errorResponse(res, 403, 'User account has been deactivated');
      }

      req.user = user;
      next();
    } catch (error) {
      return errorResponse(res, 401, 'Not authorized, token failed or expired');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, token is missing');
  }
};

module.exports = {
  protect,
};


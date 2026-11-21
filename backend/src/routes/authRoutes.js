// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken); // SRS: POST /api/v1/auth/refresh-token

// Protected Routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
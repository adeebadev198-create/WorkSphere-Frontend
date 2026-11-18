// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin, // <-- Yeh add karein
  getMe,
  forgotPassword,
  resetPassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin); // <-- Yeh naya route add karein
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
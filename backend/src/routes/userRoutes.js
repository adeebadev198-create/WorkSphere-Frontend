// backend/src/routes/userRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileAvatar,
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed'), false);
    }
  },
});

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/profile/avatar', upload.single('avatar'), uploadProfileAvatar);
router.patch('/profile/avatar', upload.single('avatar'), uploadProfileAvatar);
router.patch('/change-password', changePassword);

module.exports = router;

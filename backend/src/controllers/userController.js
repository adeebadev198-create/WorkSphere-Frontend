// backend/src/controllers/userController.js
const User = require('../models/User');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, 200, 'Profile retrieved', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PATCH /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, title, profilePicture } = req.body;
    const user = await User.findById(req.user._id);

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (title !== undefined) user.title = title;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PATCH /api/v1/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide current and new password');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture to Cloudinary and save URL in MongoDB
// @route   POST /api/v1/users/profile/avatar
// @access  Private
const uploadProfileAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please select an image file to upload');
    }

    if (!isCloudinaryConfigured()) {
      return errorResponse(
        res,
        500,
        'Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env'
      );
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'worksphere/avatars',
          public_id: `user_${req.user._id}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.profilePicture = uploadResult.secure_url;
    await user.save();

    return successResponse(res, 200, 'Profile picture uploaded successfully', {
      profilePicture: user.profilePicture,
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileAvatar,
};


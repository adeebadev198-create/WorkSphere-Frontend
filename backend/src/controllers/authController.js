const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');
const { generateToken } = require('../utils/token');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { createNotification } = require('../utils/activityLogger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body || {};

    if (!fullName || !email || !password) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    if (confirmPassword && password !== confirmPassword) {
      return errorResponse(res, 400, 'Passwords do not match');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters long');
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return errorResponse(res, 400, 'An account with this email already exists');
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
      profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      title: 'Team Member',
    });

    // Check if user has a pending invitation
    const pendingInvitation = await WorkspaceInvitation.findOne({
      email: email.toLowerCase(),
      status: 'Pending',
      expiresAt: { $gt: Date.now() },
    })
      .populate('workspace')
      .populate('invitedBy', 'fullName');

    let assignedWorkspace = null;

    if (pendingInvitation && pendingInvitation.workspace && !pendingInvitation.workspace.isArchived) {
      // User was invited: assign invited role (default: Member)
      const invitedRole = pendingInvitation.role || 'Member';
      await WorkspaceMember.create({
        workspace: pendingInvitation.workspace._id,
        user: user._id,
        role: invitedRole,
        status: 'Active',
      });

      pendingInvitation.status = 'Accepted';
      pendingInvitation.acceptedAt = Date.now();
      await pendingInvitation.save();

      const inviterName = pendingInvitation.invitedBy?.fullName || 'Workspace Owner';
      await createNotification({
        recipient: user._id,
        workspace: pendingInvitation.workspace._id,
        type: 'WorkspaceInvitation',
        title: 'Workspace Invitation',
        message: `${inviterName} (Owner) invited and added you to "${pendingInvitation.workspace.name}" as ${invitedRole}.`,
        relatedEntity: {
          entityType: 'Workspace',
          entityId: pendingInvitation.workspace._id,
        },
      });

      assignedWorkspace = {
        ...pendingInvitation.workspace.toObject(),
        memberRole: invitedRole,
      };
    } else {
      // Rule 1: Every newly registered user must automatically receive the Member role.
      // Never assign Owner, Manager, Admin, or elevated permissions automatically.
      let primaryWorkspace = await Workspace.findOne({
        name: /Software Engineering & Product/i,
        isArchived: { $ne: true },
      });

      if (!primaryWorkspace) {
        const adminUser = await User.findOne({ email: 'admin@worksphere.com' });
        if (adminUser) {
          primaryWorkspace = await Workspace.findOne({
            owner: adminUser._id,
            isArchived: { $ne: true },
          });
        }
      }

      if (!primaryWorkspace) {
        primaryWorkspace = await Workspace.findOne({
          isArchived: { $ne: true },
        }).sort({ createdAt: -1 });
      }

      if (primaryWorkspace) {
        await WorkspaceMember.create({
          workspace: primaryWorkspace._id,
          user: user._id,
          role: 'Member', // Strictly 'Member'
          status: 'Active',
        });

        assignedWorkspace = {
          ...primaryWorkspace.toObject(),
          memberRole: 'Member',
        };
      } else {
        // Fallback only if no workspace exists in database at all
        const firstWorkspace = await Workspace.create({
          name: `${fullName.split(' ')[0]}'s Workspace`,
          description: 'Default personal workspace',
          owner: user._id,
          status: 'Active',
        });

        await WorkspaceMember.create({
          workspace: firstWorkspace._id,
          user: user._id,
          role: 'Member',
          status: 'Active',
        });

        assignedWorkspace = {
          ...firstWorkspace.toObject(),
          memberRole: 'Member',
        };
      }
    }

    const token = generateToken(user._id);

    return successResponse(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        title: user.title,
      },
      workspace: assignedWorkspace,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    const token = generateToken(user._id);

    const memberships = await WorkspaceMember.find({
      user: user._id,
      status: 'Active',
    }).populate('workspace');

    const workspaces = memberships
      .map((m) => {
        if (!m.workspace || m.workspace.isArchived) return null;
        return {
          ...m.workspace.toObject(),
          memberRole: m.role,
        };
      })
      .filter(Boolean);

    return successResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        title: user.title,
      },
      workspaces,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/v1/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body || {};

    if (!credential) {
      return errorResponse(res, 400, 'Google credential token is required');
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        fullName: name,
        email: email.toLowerCase(),
        password: crypto.randomBytes(16).toString('hex'),
        profilePicture: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        title: 'Team Member',
      });

      // Check if user has a pending invitation
      const pendingInvitation = await WorkspaceInvitation.findOne({
        email: email.toLowerCase(),
        status: 'Pending',
        expiresAt: { $gt: Date.now() },
      })
        .populate('workspace')
        .populate('invitedBy', 'fullName');

      if (pendingInvitation && pendingInvitation.workspace && !pendingInvitation.workspace.isArchived) {
        const invitedRole = pendingInvitation.role || 'Member';
        await WorkspaceMember.create({
          workspace: pendingInvitation.workspace._id,
          user: user._id,
          role: invitedRole,
          status: 'Active',
        });
        pendingInvitation.status = 'Accepted';
        pendingInvitation.acceptedAt = Date.now();
        await pendingInvitation.save();

        const inviterName = pendingInvitation.invitedBy?.fullName || 'Workspace Owner';
        await createNotification({
          recipient: user._id,
          workspace: pendingInvitation.workspace._id,
          type: 'WorkspaceInvitation',
          title: 'Workspace Invitation',
          message: `${inviterName} (Owner) invited and added you to "${pendingInvitation.workspace.name}" as ${invitedRole}.`,
          relatedEntity: {
            entityType: 'Workspace',
            entityId: pendingInvitation.workspace._id,
          },
        });
      } else {
        // Rule 1: Every newly registered user receives Member role in the primary workspace
        let primaryWorkspace = await Workspace.findOne({
          name: /Software Engineering & Product/i,
          isArchived: { $ne: true },
        });

        if (!primaryWorkspace) {
          const adminUser = await User.findOne({ email: 'admin@worksphere.com' });
          if (adminUser) {
            primaryWorkspace = await Workspace.findOne({
              owner: adminUser._id,
              isArchived: { $ne: true },
            });
          }
        }

        if (!primaryWorkspace) {
          primaryWorkspace = await Workspace.findOne({
            isArchived: { $ne: true },
          }).sort({ createdAt: -1 });
        }

        if (primaryWorkspace) {
          await WorkspaceMember.create({
            workspace: primaryWorkspace._id,
            user: user._id,
            role: 'Member',
            status: 'Active',
          });
        }
      }
    }

    const token = generateToken(user._id);

    const memberships = await WorkspaceMember.find({
      user: user._id,
      status: 'Active',
    }).populate('workspace');

    const workspaces = memberships
      .map((m) => {
        if (!m.workspace || m.workspace.isArchived) return null;
        return {
          ...m.workspace.toObject(),
          memberRole: m.role,
        };
      })
      .filter(Boolean);

    return successResponse(res, 200, 'Google Login successful', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        title: user.title,
      },
      workspaces,
      token,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return errorResponse(res, 401, 'Google authentication failed. Invalid token.');
  }
};

// @desc    Get current user profile & workspaces
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const memberships = await WorkspaceMember.find({
      user: user._id,
      status: 'Active',
    }).populate('workspace');

    const workspaces = memberships
      .map((m) => {
        if (!m.workspace || m.workspace.isArchived) return null;
        return {
          ...m.workspace.toObject(),
          memberRole: m.role,
        };
      })
      .filter(Boolean);

    return successResponse(res, 200, 'Profile loaded successfully', {
      user,
      workspaces,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return errorResponse(res, 400, 'Please provide registered email');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return successResponse(res, 200, 'If that email is registered, a reset token has been generated.');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Password reset token generated successfully', {
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body || {};
    if (!resetToken || !newPassword) {
      return errorResponse(res, 400, 'Please provide token and new password');
    }

    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 400, 'Invalid or expired password reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return successResponse(res, 200, 'Password has been reset successfully. You can now login.');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res) => {
  return successResponse(res, 200, 'Logged out successfully');
};

// @desc    Refresh JWT — issue a new token for a valid, non-expired existing token
// @route   POST /api/v1/auth/refresh-token
// @access  Public (requires valid Bearer token in header)
const refreshToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'No token provided. Please include a Bearer token.');
    }

    const oldToken = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(
        oldToken,
        process.env.JWT_SECRET || 'worksphere_jwt_secret_super_secure_key_2026'
      );
    } catch (jwtErr) {
      // Token is invalid or expired — require fresh login
      return errorResponse(res, 401, 'Token is invalid or has expired. Please login again.');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 401, 'User account no longer exists.');
    }
    if (!user.isActive) {
      return errorResponse(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    // Issue new token with fresh expiry
    const newToken = generateToken(user._id);

    return successResponse(res, 200, 'Token refreshed successfully', {
      token: newToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        title: user.title,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
};
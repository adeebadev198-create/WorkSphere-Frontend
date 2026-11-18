const mongoose = require('mongoose');

const workspaceInvitationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['Manager', 'Member'],
      default: 'Member',
    },
    token: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Expired', 'Revoked'],
      default: 'Pending',
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

workspaceInvitationSchema.index({ workspace: 1, email: 1, status: 1 });

module.exports = mongoose.model('WorkspaceInvitation', workspaceInvitationSchema);


// backend/src/controllers/memberController.js
const crypto = require('crypto');
const User = require('../models/User');
const WorkspaceMember = require('../models/WorkspaceMember');
const WorkspaceInvitation = require('../models/WorkspaceInvitation');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// @desc    Get all members of workspace
// @route   GET /api/v1/workspaces/:workspaceId/members
// @access  Private (Workspace member)
const getMembers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;
    const filter = {
      workspace: req.workspace._id,
      status: status && status !== 'All' ? status : 'Active',
    };

    if (role) filter.role = role;

    const members = await WorkspaceMember.find(filter)
      .populate('user', 'fullName email profilePicture phone title')
      .sort({ createdAt: -1 });

    let filtered = members;
    if (search) {
      const q = search.toLowerCase();
      filtered = members.filter(
        (m) =>
          m.user &&
          (m.user.fullName.toLowerCase().includes(q) ||
            m.user.email.toLowerCase().includes(q))
      );
    }

    return successResponse(res, 200, 'Members retrieved', filtered);
  } catch (error) {
    next(error);
  }
};

// @desc    Invite or add a member
// @route   POST /api/v1/workspaces/:workspaceId/invitations
// @access  Private (Owner only)
const inviteMember = async (req, res, next) => {
  try {
    // 4.4 Permission Matrix: Invite members - Owner: Yes, Manager: No, Member: No
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Only workspace owners can invite members');
    }

    const { email, role = 'Member' } = req.body;
    if (!email) {
      return errorResponse(res, 400, 'Employee email is required');
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });

    // Check if user is already a workspace member
    if (existingUser) {
      const existingMember = await WorkspaceMember.findOne({
        workspace: req.workspace._id,
        user: existingUser._id,
      });

      if (existingMember && existingMember.status === 'Active') {
        return errorResponse(res, 400, 'This user is already an active member of this workspace');
      }

      // If registered user was inactive/new, add directly or activate
      if (existingMember) {
        existingMember.status = 'Active';
        existingMember.role = role;
        await existingMember.save();
      } else {
        await WorkspaceMember.create({
          workspace: req.workspace._id,
          user: existingUser._id,
          role,
          status: 'Active',
        });
      }

      await logActivity({
        actor: req.user._id,
        workspace: req.workspace._id,
        action: 'MEMBER_ADDED',
        description: `${req.user.fullName} added ${existingUser.fullName} as ${role}`,
      });

      await createNotification({
        recipient: existingUser._id,
        workspace: req.workspace._id,
        type: 'WorkspaceInvitation',
        title: 'Added to Workspace',
        message: `${req.user.fullName} (Owner) invited and added you to "${req.workspace.name}" as ${role}.`,
        relatedEntity: {
          entityType: 'Workspace',
          entityId: req.workspace._id,
        },
      });

      return successResponse(res, 201, 'Member added to workspace successfully', {
        user: existingUser,
        role,
        status: 'Active',
      });
    }

    // If user is not yet registered on platform, handle Scenario 12 (Duplicate Invitation Prevention)
    const activeInvitation = await WorkspaceInvitation.findOne({
      workspace: req.workspace._id,
      email: cleanEmail,
      status: 'Pending',
      expiresAt: { $gt: Date.now() },
    });

    if (activeInvitation) {
      return errorResponse(
        res,
        400,
        'A pending invitation has already been sent to this email. You can resend it instead.'
      );
    }

    const token = crypto.randomBytes(24).toString('hex');
    const invitation = await WorkspaceInvitation.create({
      workspace: req.workspace._id,
      email: cleanEmail,
      invitedBy: req.user._id,
      role,
      token,
      status: 'Pending',
    });

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      action: 'INVITATION_SENT',
      description: `${req.user.fullName} sent an invitation to ${cleanEmail}`,
    });

    return successResponse(res, 201, 'Invitation created successfully', invitation);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept invitation
// @route   POST /api/v1/invitations/accept
// @access  Private
const acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return errorResponse(res, 400, 'Invitation token is required');
    }

    const invitation = await WorkspaceInvitation.findOne({
      token,
      status: 'Pending',
      expiresAt: { $gt: Date.now() },
    });

    if (!invitation) {
      return errorResponse(res, 400, 'Invalid or expired invitation token');
    }

    // Add or update workspace member
    let member = await WorkspaceMember.findOne({
      workspace: invitation.workspace,
      user: req.user._id,
    });

    if (!member) {
      member = await WorkspaceMember.create({
        workspace: invitation.workspace,
        user: req.user._id,
        role: invitation.role,
        status: 'Active',
      });
    } else {
      member.status = 'Active';
      member.role = invitation.role;
      await member.save();
    }

    invitation.status = 'Accepted';
    invitation.acceptedAt = Date.now();
    await invitation.save();

    await logActivity({
      actor: req.user._id,
      workspace: invitation.workspace,
      action: 'INVITATION_ACCEPTED',
      description: `${req.user.fullName} accepted the workspace invitation`,
    });

    await createNotification({
      recipient: req.user._id,
      workspace: invitation.workspace,
      type: 'WorkspaceInvitation',
      title: 'Workspace Joined',
      message: `You joined the workspace as ${invitation.role}.`,
      relatedEntity: {
        entityType: 'Workspace',
        entityId: invitation.workspace,
      },
    });

    if (invitation.invitedBy) {
      await createNotification({
        recipient: invitation.invitedBy,
        workspace: invitation.workspace,
        type: 'WorkspaceInvitation',
        title: 'Invitation Accepted',
        message: `${req.user.fullName} accepted your invitation and joined as ${invitation.role}.`,
        relatedEntity: {
          entityType: 'Workspace',
          entityId: invitation.workspace,
        },
      });
    }

    return successResponse(res, 200, 'Invitation accepted successfully', member);
  } catch (error) {
    next(error);
  }
};

// @desc    Update member role
// @route   PATCH /api/v1/workspaces/:workspaceId/members/:userId/role
// @access  Private (Owner only)
const updateMemberRole = async (req, res, next) => {
  try {
    // 4.4 Permission Matrix: Assign workspace roles - Owner: Yes, Manager: No, Member: No
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Only workspace owners can assign workspace roles');
    }

    const { role } = req.body;
    const { userId } = req.params;

    if (!['Owner', 'Manager', 'Member'].includes(role)) {
      return errorResponse(res, 400, 'Invalid workspace role');
    }

    const member = await WorkspaceMember.findOne({
      workspace: req.workspace._id,
      user: userId,
    });

    if (!member) {
      return errorResponse(res, 404, 'Workspace member not found');
    }

    // BR-005: Workspace must retain at least one owner
    if (member.role === 'Owner' && role !== 'Owner') {
      const ownerCount = await WorkspaceMember.countDocuments({
        workspace: req.workspace._id,
        role: 'Owner',
        status: 'Active',
      });
      if (ownerCount <= 1) {
        return errorResponse(
          res,
          400,
          'Cannot demote the last workspace owner. Assign another owner first.'
        );
      }
    }

    const oldRole = member.role;
    member.role = role;
    await member.save();

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      action: 'ROLE_CHANGED',
      description: `${req.user.fullName} changed member role from ${oldRole} to ${role}`,
      oldValue: oldRole,
      newValue: role,
    });

    await createNotification({
      recipient: userId,
      workspace: req.workspace._id,
      type: 'WorkspaceInvitation',
      title: 'Workspace Role Updated',
      message: `${req.user.fullName} (Owner) updated your role in "${req.workspace.name}" from ${oldRole} to ${role}.`,
      relatedEntity: {
        entityType: 'Workspace',
        entityId: req.workspace._id,
      },
    });

    return successResponse(res, 200, 'Member role updated successfully', member);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from workspace
// @route   DELETE /api/v1/workspaces/:workspaceId/members/:userId
// @access  Private (Owner only)
const removeMember = async (req, res, next) => {
  try {
    // 4.4 Permission Matrix: Workspace management / membership - Owner only
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Only workspace owners can remove members');
    }

    const { userId } = req.params;

    const member = await WorkspaceMember.findOne({
      workspace: req.workspace._id,
      user: userId,
    });

    if (!member) {
      return errorResponse(res, 404, 'Workspace member not found');
    }

    // BR-005: Last workspace owner cannot be removed
    if (member.role === 'Owner') {
      const ownerCount = await WorkspaceMember.countDocuments({
        workspace: req.workspace._id,
        role: 'Owner',
        status: 'Active',
      });
      if (ownerCount <= 1) {
        return errorResponse(res, 400, 'Cannot remove the last workspace owner');
      }
    }

    // Soft removal per BR-011 (do not destroy historical activity)
    member.status = 'Inactive';
    await member.save();

    // Check tasks that may need reassignment (Scenario 07)
    const uncompletedTasksCount = await Task.countDocuments({
      workspace: req.workspace._id,
      assignedTo: userId,
      status: { $ne: 'Completed' },
      isArchived: false,
    });

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      action: 'MEMBER_REMOVED',
      description: `${req.user.fullName} removed a member from the workspace`,
    });

    return successResponse(res, 200, 'Member removed from workspace', {
      uncompletedTasksNeedingReassignment: uncompletedTasksCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending invitations
// @route   GET /api/v1/workspaces/:workspaceId/invitations
// @access  Private (Owner only)
const getInvitations = async (req, res, next) => {
  try {
    const invitations = await WorkspaceInvitation.find({
      workspace: req.workspace._id,
    })
      .populate('invitedBy', 'fullName email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Invitations retrieved', invitations);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend invitation
// @route   POST /api/v1/invitations/:id/resend
// @access  Private (Owner only)
const resendInvitation = async (req, res, next) => {
  try {
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Only workspace owners can resend invitations');
    }

    const invitation = await WorkspaceInvitation.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });
    if (!invitation) return errorResponse(res, 404, 'Invitation not found');

    const crypto = require('crypto');
    const rawToken = crypto.randomBytes(32).toString('hex');
    invitation.tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invitation.status = 'Pending';
    await invitation.save();

    return successResponse(res, 200, 'Invitation resent successfully', {
      invitation,
      invitationToken: rawToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Revoke invitation
// @route   DELETE /api/v1/invitations/:id
// @access  Private (Owner only)
const deleteInvitation = async (req, res, next) => {
  try {
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Only workspace owners can delete invitations');
    }

    const invitation = await WorkspaceInvitation.findOneAndDelete({
      _id: req.params.id,
      workspace: req.workspace._id,
    });
    if (!invitation) return errorResponse(res, 404, 'Invitation not found');

    return successResponse(res, 200, 'Invitation cancelled successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  inviteMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  getInvitations,
  resendInvitation,
  deleteInvitation,
};


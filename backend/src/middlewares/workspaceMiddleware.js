// backend/src/middlewares/workspaceMiddleware.js
const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const { errorResponse } = require('../utils/responseHandler');

const verifyWorkspaceAccess = async (req, res, next) => {
  try {
    const workspaceId =
      req.headers['x-workspace-id'] ||
      req.query.workspaceId ||
      req.params.workspaceId ||
      req.body.workspace;

    if (!workspaceId) {
      return errorResponse(res, 400, 'Workspace ID is required (header: x-workspace-id or param)');
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return errorResponse(res, 400, 'Invalid Workspace ID format');
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return errorResponse(res, 404, 'Workspace not found');
    }

    // Check if user is the direct owner or a member
    let memberRole = null;

    if (workspace.owner.toString() === req.user._id.toString()) {
      memberRole = 'Owner';
    } else {
      const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.user._id,
        status: 'Active',
      });

      if (!membership) {
        return errorResponse(
          res,
          403,
          'Access denied: You are not an active member of this workspace'
        );
      }
      memberRole = membership.role;
    }

    req.workspace = workspace;
    req.memberRole = memberRole;
    next();
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const requireRole = (allowedRoles = ['Owner', 'Manager']) => {
  return (req, res, next) => {
    if (!req.memberRole || !allowedRoles.includes(req.memberRole)) {
      return errorResponse(
        res,
        403,
        `Permission denied: Requires role [${allowedRoles.join(', ')}]. Your role is ${req.memberRole || 'None'}`
      );
    }
    next();
  };
};

module.exports = {
  verifyWorkspaceAccess,
  requireRole,
};


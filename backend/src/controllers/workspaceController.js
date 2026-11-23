// backend/src/controllers/workspaceController.js
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const Project = require('../models/Project');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all accessible workspaces
// @route   GET /api/v1/workspaces
// @access  Private
const getWorkspaces = async (req, res, next) => {
  try {
    const memberships = await WorkspaceMember.find({
      user: req.user._id,
      status: 'Active',
    }).populate('workspace');

    const workspacesWithStats = await Promise.all(
      memberships.map(async (m) => {
        if (!m.workspace || m.workspace.isArchived) return null;

        const memberCount = await WorkspaceMember.countDocuments({
          workspace: m.workspace._id,
          status: 'Active',
        });
        const projectCount = await Project.countDocuments({
          workspace: m.workspace._id,
          isArchived: false,
        });

        return {
          ...m.workspace.toObject(),
          memberRole: m.role,
          totalMembers: memberCount,
          totalProjects: projectCount,
        };
      })
    );

    return successResponse(
      res,
      200,
      'Workspaces retrieved',
      workspacesWithStats.filter(Boolean)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workspace
// @route   POST /api/v1/workspaces
// @access  Private
const createWorkspace = async (req, res, next) => {
  try {
    const { name, description, logo } = req.body;
    if (!name) {
      return errorResponse(res, 400, 'Workspace name is required');
    }

    const workspace = await Workspace.create({
      name,
      description: description || '',
      logo: logo || '',
      owner: req.user._id,
      status: 'Active',
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: 'Owner',
      status: 'Active',
    });

    await logActivity({
      actor: req.user._id,
      workspace: workspace._id,
      action: 'WORKSPACE_CREATED',
      description: `${req.user.fullName} created workspace "${workspace.name}"`,
    });

    return successResponse(res, 201, 'Workspace created successfully', {
      ...workspace.toObject(),
      memberRole: 'Owner',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workspace
// @route   GET /api/v1/workspaces/:id
// @access  Private
const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate(
      'owner',
      'fullName email profilePicture'
    );
    if (!workspace) {
      return errorResponse(res, 404, 'Workspace not found');
    }

    const memberCount = await WorkspaceMember.countDocuments({
      workspace: workspace._id,
      status: 'Active',
    });
    const projectCount = await Project.countDocuments({
      workspace: workspace._id,
      isArchived: false,
    });

    return successResponse(res, 200, 'Workspace details retrieved', {
      ...workspace.toObject(),
      totalMembers: memberCount,
      totalProjects: projectCount,
      memberRole: req.memberRole,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workspace
// @route   PATCH /api/v1/workspaces/:id
// @access  Private (Owner only)
const updateWorkspace = async (req, res, next) => {
  try {
    // 4.4 Permission Matrix: Workspace management - Owner: Full, Manager: No, Member: No
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Workspace management is restricted to workspace owners');
    }

    const { name, description, logo, status } = req.body;
    const workspace = req.workspace;

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (logo !== undefined) workspace.logo = logo;
    if (status) workspace.status = status;

    await workspace.save();

    await logActivity({
      actor: req.user._id,
      workspace: workspace._id,
      action: 'WORKSPACE_UPDATED',
      description: `${req.user.fullName} updated workspace settings`,
    });

    return successResponse(res, 200, 'Workspace updated successfully', workspace);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / Archive workspace
// @route   DELETE /api/v1/workspaces/:id
// @access  Private (Owner only)
const deleteWorkspace = async (req, res, next) => {
  try {
    // 4.4 Permission Matrix: Workspace management - Owner: Full, Manager: No, Member: No
    if (req.memberRole !== 'Owner') {
      return errorResponse(res, 403, 'Permission denied: Workspace deletion is restricted to workspace owners');
    }

    const workspace = req.workspace;

    // BR-005 & Soft delete per FR-WS-004
    workspace.isArchived = true;
    workspace.status = 'Archived';
    await workspace.save();

    await logActivity({
      actor: req.user._id,
      workspace: workspace._id,
      action: 'WORKSPACE_ARCHIVED',
      description: `${req.user.fullName} archived workspace "${workspace.name}"`,
    });

    return successResponse(res, 200, 'Workspace archived successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};


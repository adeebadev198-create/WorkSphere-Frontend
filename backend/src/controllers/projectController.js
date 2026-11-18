// backend/src/controllers/projectController.js
const Project = require('../models/Project');
const Task = require('../models/Task');
const WorkspaceMember = require('../models/WorkspaceMember');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// Helper to calculate progress percentage (BR-007)
const calculateProjectProgress = async (projectId) => {
  const totalTasks = await Task.countDocuments({
    project: projectId,
    isArchived: false,
  });
  if (totalTasks === 0) return 0;

  const completedTasks = await Task.countDocuments({
    project: projectId,
    status: 'Completed',
    isArchived: false,
  });

  return Math.round((completedTasks / totalTasks) * 100);
};

// @desc    Get all projects in workspace
// @route   GET /api/v1/projects
// @access  Private (Workspace member)
const getProjects = async (req, res, next) => {
  try {
    const { status, priority, search, isArchived } = req.query;
    const filter = {
      workspace: req.workspace._id,
      isArchived: isArchived === 'true' ? true : false,
    };

    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;

    let query = Project.find(filter)
      .populate('manager', 'fullName email profilePicture')
      .populate('members', 'fullName email profilePicture title')
      .sort({ createdAt: -1 });

    const projects = await query.exec();

    // Calculate dynamic progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (p) => {
        const progress = await calculateProjectProgress(p._id);
        const totalTasks = await Task.countDocuments({ project: p._id, isArchived: false });
        const completedTasks = await Task.countDocuments({
          project: p._id,
          status: 'Completed',
          isArchived: false,
        });

        return {
          ...p.toObject(),
          progress,
          totalTasks,
          completedTasks,
        };
      })
    );

    let filtered = projectsWithProgress;
    if (search) {
      const q = search.toLowerCase();
      filtered = projectsWithProgress.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return successResponse(res, 200, 'Projects retrieved successfully', filtered);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project details
// @route   GET /api/v1/projects/:id
// @access  Private (Workspace member)
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.workspace._id, // BR-015 isolate by workspace
    })
      .populate('manager', 'fullName email profilePicture title')
      .populate('members', 'fullName email profilePicture title')
      .populate('createdBy', 'fullName email');

    if (!project) {
      return errorResponse(res, 404, 'Project not found in this workspace');
    }

    const progress = await calculateProjectProgress(project._id);
    const tasks = await Task.find({
      project: project._id,
      isArchived: false,
    })
      .populate('assignedTo', 'fullName email profilePicture')
      .sort({ order: 1, createdAt: -1 });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks = totalTasks - completedTasks;

    return successResponse(res, 200, 'Project details retrieved', {
      ...project.toObject(),
      progress,
      totalTasks,
      completedTasks,
      pendingTasks,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/v1/projects
// @access  Private (Owner, Manager)
const createProject = async (req, res, next) => {
  try {
    const { name, description, manager, members = [], startDate, endDate, priority } = req.body;

    if (!name || !endDate) {
      return errorResponse(res, 400, 'Project name and deadline date are required');
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return errorResponse(res, 400, 'Start date cannot be after deadline date');
    }

    const managerId = manager || req.user._id;

    // BR-003: Verify manager is an active member of this workspace
    const isManagerMember = await WorkspaceMember.findOne({
      workspace: req.workspace._id,
      user: managerId,
      status: 'Active',
    });
    if (!isManagerMember && req.workspace.owner.toString() !== managerId.toString()) {
      return errorResponse(res, 400, 'Selected project manager must be a member of this workspace');
    }

    const project = await Project.create({
      workspace: req.workspace._id, // BR-001
      name,
      description: description || '',
      manager: managerId,
      members: Array.isArray(members) ? members : [],
      startDate: startDate || Date.now(),
      endDate,
      priority: priority || 'Medium',
      status: 'Planning',
      createdBy: req.user._id,
    });

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: project._id,
      action: 'PROJECT_CREATED',
      description: `${req.user.fullName} created project "${project.name}"`,
    });

    // Notify assigned manager
    if (managerId.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: managerId,
        workspace: req.workspace._id,
        type: 'ProjectAdded',
        title: 'New Project Assigned',
        message: `You were assigned as manager for project "${project.name}".`,
        relatedEntity: {
          entityType: 'Project',
          entityId: project._id,
        },
      });
    }

    return successResponse(res, 201, 'Project created successfully', project);
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PATCH /api/v1/projects/:id
// @access  Private (Owner, Project Manager)
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!project) {
      return errorResponse(res, 404, 'Project not found in this workspace');
    }

    // Role check: Only Owner or the designated project manager can update
    if (
      req.memberRole !== 'Owner' &&
      project.manager.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Only workspace owner or assigned manager can update this project');
    }

    const { name, description, manager, members, startDate, endDate, priority, status } = req.body;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (manager) project.manager = manager;
    if (members) project.members = members;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (priority) project.priority = priority;

    // BR-017: A project cannot be completed while required tasks remain incomplete
    if (status === 'Completed' && project.status !== 'Completed') {
      const incompleteCount = await Task.countDocuments({
        project: project._id,
        status: { $ne: 'Completed' },
        isArchived: false,
      });
      if (incompleteCount > 0) {
        return errorResponse(
          res,
          400,
          `Cannot mark project as Completed: ${incompleteCount} task(s) are still incomplete.`
        );
      }
    }
    if (status) project.status = status;

    await project.save();

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: project._id,
      action: 'PROJECT_UPDATED',
      description: `${req.user.fullName} updated project "${project.name}"`,
    });

    return successResponse(res, 200, 'Project updated successfully', project);
  } catch (error) {
    next(error);
  }
};

// @desc    Archive / Soft-Delete Project
// @route   PATCH /api/v1/projects/:id/archive or DELETE /api/v1/projects/:id
// @access  Private (Owner only or authorized Manager)
const archiveProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!project) {
      return errorResponse(res, 404, 'Project not found');
    }

    if (
      req.memberRole !== 'Owner' &&
      project.manager.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, 'Permission denied to archive project');
    }

    project.isArchived = true;
    project.status = 'Cancelled';
    await project.save();

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: project._id,
      action: 'PROJECT_ARCHIVED',
      description: `${req.user.fullName} archived project "${project.name}"`,
    });

    return successResponse(res, 200, 'Project archived successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
};


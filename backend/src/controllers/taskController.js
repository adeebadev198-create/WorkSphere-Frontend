// backend/src/controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const ActivityLog = require('../models/ActivityLog');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// @desc    Get all tasks in workspace
// @route   GET /api/v1/tasks
// @access  Private (Workspace member)
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo, search, sortBy } = req.query;

    const filter = {
      workspace: req.workspace._id,
      isArchived: false,
    };

    // 4.4 Permission Matrix: View assigned tasks
    // If user is a Member, scope tasks to those assigned to them or in projects they belong to
    if (req.memberRole === 'Member') {
      const memberProjects = await Project.find({
        workspace: req.workspace._id,
        members: req.user._id,
      }).select('_id');
      const memberProjectIds = memberProjects.map((p) => p._id);

      filter.$or = [
        { assignedTo: req.user._id },
        { project: { $in: memberProjectIds } },
      ];
    }

    if (project) filter.project = project;
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    let sortOptions = { order: 1, createdAt: -1 };
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };
    if (sortBy === 'dueDate') sortOptions = { dueDate: 1 };
    if (sortBy === 'priority') sortOptions = { priority: -1 };

    let query = Task.find(filter)
      .populate('project', 'name status priority')
      .populate('assignedTo', 'fullName email profilePicture title')
      .populate('createdBy', 'fullName email')
      .sort(sortOptions);

    const tasks = await query.exec();

    let filtered = tasks;
    if (search) {
      const q = search.toLowerCase();
      filtered = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return successResponse(res, 200, 'Tasks retrieved successfully', filtered);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks assigned to logged-in user
// @route   GET /api/v1/tasks/my-tasks
// @access  Private
const getMyTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const filter = {
      workspace: req.workspace._id,
      assignedTo: req.user._id,
      isArchived: false,
    };

    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('project', 'name status priority')
      .populate('assignedTo', 'fullName email profilePicture')
      .sort({ dueDate: 1 });

    return successResponse(res, 200, 'My tasks retrieved successfully', tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task details
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    })
      .populate('project', 'name status priority manager members')
      .populate('assignedTo', 'fullName email profilePicture title')
      .populate('createdBy', 'fullName email')
      .populate('dependencies', 'title status dueDate');

    if (!task) {
      return errorResponse(res, 404, 'Task not found in this workspace');
    }

    // 4.4 Permission Matrix: Member view access check
    if (req.memberRole === 'Member') {
      const isAssignee = task.assignedTo.some(
        (u) => (u._id || u).toString() === req.user._id.toString()
      );
      const isProjectMember =
        task.project &&
        task.project.members &&
        task.project.members.some(
          (m) => (m._id || m).toString() === req.user._id.toString()
        );

      if (!isAssignee && !isProjectMember) {
        return errorResponse(res, 403, 'Permission denied: You do not have access to view this task');
      }
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'fullName email profilePicture')
      .sort({ createdAt: 1 });

    const activityHistory = await ActivityLog.find({ task: task._id })
      .populate('actor', 'fullName email profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    return successResponse(res, 200, 'Task details retrieved', {
      ...task.toObject(),
      comments,
      activityHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/v1/tasks
// @access  Private (Owner, Manager)
const createTask = async (req, res, next) => {
  try {
    // 4.4 Permission Matrix: Assign tasks / Create tasks - Owner: Yes, Manager: Yes, Member: No
    if (!['Owner', 'Manager'].includes(req.memberRole)) {
      return errorResponse(
        res,
        403,
        'Permission denied: Only workspace owners and managers can create/assign tasks'
      );
    }

    const {
      project,
      title,
      description,
      assignedTo = [],
      priority,
      status,
      startDate,
      dueDate,
      labels,
      dependencies,
    } = req.body;

    if (!project || !title || !dueDate) {
      return errorResponse(res, 400, 'Project, title, and due date are required');
    }

    // BR-001 & BR-002: Verify project exists in workspace
    const projectDoc = await Project.findOne({
      _id: project,
      workspace: req.workspace._id,
    });

    if (!projectDoc) {
      return errorResponse(res, 404, 'Selected project does not exist in this workspace');
    }

    // BR-008: Archived projects cannot accept new tasks
    if (projectDoc.isArchived || projectDoc.status === 'Cancelled') {
      return errorResponse(res, 400, 'Cannot add tasks to an archived or cancelled project');
    }

    // BR-012: Due date validation
    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      return errorResponse(res, 400, 'Task start date cannot be later than due date');
    }

    const task = await Task.create({
      workspace: req.workspace._id,
      project,
      title,
      description: description || '',
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo].filter(Boolean),
      createdBy: req.user._id,
      priority: priority || 'Medium',
      status: status || 'To Do',
      startDate: startDate || Date.now(),
      dueDate,
      labels: Array.isArray(labels) ? labels : labels ? labels.split(',').map((l) => l.trim()) : [],
      dependencies: Array.isArray(dependencies) ? dependencies : [],
    });

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: projectDoc._id,
      task: task._id,
      action: 'TASK_CREATED',
      description: `${req.user.fullName} created task "${task.title}"`,
    });

    // Notify assigned users (Scenario 02)
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const assigneeId of task.assignedTo) {
        if (assigneeId.toString() !== req.user._id.toString()) {
          await createNotification({
            recipient: assigneeId,
            workspace: req.workspace._id,
            type: 'TaskAssigned',
            title: 'New Task Assigned',
            message: `You were assigned to task "${task.title}" in project "${projectDoc.name}".`,
            relatedEntity: {
              entityType: 'Task',
              entityId: task._id,
            },
          });
        }
      }
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'fullName email profilePicture')
      .populate('project', 'name');

    return successResponse(res, 201, 'Task created successfully', populatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task (with Optimistic Concurrency Check - Scenario 10)
// @route   PATCH /api/v1/tasks/:id
// @access  Private (Owner, Manager, or Assigned Member)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      startDate,
      dueDate,
      labels,
      dependencies,
      version, // Optimistic Concurrency - Scenario 10
    } = req.body || {};

    // Authorization check
    const isOwnerOrManager = ['Owner', 'Manager'].includes(req.memberRole);
    const isAssignee = task.assignedTo.some(
      (uid) => uid.toString() === req.user._id.toString()
    );

    // 4.4 Permission Matrix: Update task status - Owner: Yes, Manager: Yes, Member: Assigned tasks
    // 4.4 Permission Matrix: Assign tasks - Owner: Yes, Manager: Yes, Member: No
    if (!isOwnerOrManager) {
      if (!isAssignee) {
        return errorResponse(res, 403, 'Permission denied: Members can only update tasks assigned to them');
      }
      // Members are strictly restricted to updating task status on their assigned tasks
      if (title || assignedTo || priority || startDate || dueDate || dependencies) {
        return errorResponse(
          res,
          403,
          'Permission denied: Members cannot modify task assignments or project parameters'
        );
      }
    }

    // Check version conflict if client sent version
    if (version !== undefined && task.version !== version) {
      return errorResponse(
        res,
        409,
        'Conflict: This task has been updated by another team member. Please refresh to load the latest changes.'
      );
    }

    const oldStatus = task.status;
    const oldPriority = task.priority;
    const oldDueDate = task.dueDate;

    if (title && isOwnerOrManager) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo && isOwnerOrManager) task.assignedTo = assignedTo;
    if (priority && isOwnerOrManager) task.priority = priority;
    if (startDate && isOwnerOrManager) task.startDate = startDate;
    if (dueDate && isOwnerOrManager) task.dueDate = dueDate;
    if (labels) task.labels = Array.isArray(labels) ? labels : labels.split(',').map((l) => l.trim());
    if (dependencies && isOwnerOrManager) task.dependencies = dependencies;
    if (status) task.status = status;

    // Increment version
    task.version = (task.version || 1) + 1;
    await task.save();

    // Log changes if status/priority/deadline changed
    if (status && status !== oldStatus) {
      await logActivity({
        actor: req.user._id,
        workspace: req.workspace._id,
        project: task.project,
        task: task._id,
        action: 'TASK_STATUS_UPDATED',
        description: `${req.user.fullName} changed task status from "${oldStatus}" to "${status}"`,
        oldValue: oldStatus,
        newValue: status,
      });
    }

    if (dueDate && new Date(dueDate).getTime() !== new Date(oldDueDate).getTime()) {
      await logActivity({
        actor: req.user._id,
        workspace: req.workspace._id,
        project: task.project,
        task: task._id,
        action: 'TASK_DEADLINE_UPDATED',
        description: `${req.user.fullName} updated task deadline`,
        oldValue: oldDueDate,
        newValue: dueDate,
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'fullName email profilePicture');

    return successResponse(res, 200, 'Task updated successfully', updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status specifically for Kanban Drag & Drop
// @route   PATCH /api/v1/tasks/:id/status
// @access  Private (Owner, Manager, or Assigned Member)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;
    const validStatuses = ['To Do', 'In Progress', 'In Review', 'Completed'];

    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    // Check permissions (Module 06 business rule)
    const isOwnerOrManager = ['Owner', 'Manager'].includes(req.memberRole);
    const isAssignee = task.assignedTo.some(
      (uid) => uid.toString() === req.user._id.toString()
    );

    if (!isOwnerOrManager && !isAssignee) {
      return errorResponse(
        res,
        403,
        'Permission denied: You can only update tasks assigned to you'
      );
    }

    // Check task dependencies (FR-TASK-010)
    if (status === 'Completed' && task.dependencies && task.dependencies.length > 0) {
      const incompleteDep = await Task.findOne({
        _id: { $in: task.dependencies },
        status: { $ne: 'Completed' },
      });
      if (incompleteDep) {
        return errorResponse(
          res,
          400,
          `Cannot complete task: Dependent task "${incompleteDep.title}" is not yet completed.`
        );
      }
    }

    const previousStatus = task.status;
    task.status = status;
    if (order !== undefined) task.order = order;
    task.version = (task.version || 1) + 1;
    await task.save();

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: task.project,
      task: task._id,
      action: 'KANBAN_STATUS_MOVED',
      description: `${req.user.fullName} moved task "${task.title}" to "${status}"`,
      oldValue: previousStatus,
      newValue: status,
    });

    // Notify assigned members
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const uid of task.assignedTo) {
        if (uid.toString() !== req.user._id.toString()) {
          await createNotification({
            recipient: uid,
            workspace: req.workspace._id,
            type: 'TaskStatusChanged',
            title: 'Task Status Updated',
            message: `Task "${task.title}" status changed to ${status}.`,
            relatedEntity: {
              entityType: 'Task',
              entityId: task._id,
            },
          });
        }
      }
    }

    return successResponse(res, 200, 'Task status updated successfully', task);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign users to task
// @route   PATCH /api/v1/tasks/:id/assign
// @access  Private (Owner, Manager)
const assignTask = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    if (!['Owner', 'Manager'].includes(req.memberRole)) {
      return errorResponse(res, 403, 'Only managers and owners can assign tasks');
    }

    task.assignedTo = Array.isArray(assignedTo) ? assignedTo : [assignedTo].filter(Boolean);
    task.version = (task.version || 1) + 1;
    await task.save();

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: task.project,
      task: task._id,
      action: 'TASK_REASSIGNED',
      description: `${req.user.fullName} updated assignees for "${task.title}"`,
    });

    const populated = await Task.findById(task._id).populate(
      'assignedTo',
      'fullName email profilePicture'
    );
    return successResponse(res, 200, 'Task assignees updated', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or Archive Task
// @route   DELETE /api/v1/tasks/:id
// @access  Private (Owner, Manager)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.workspace._id,
    });

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    if (!['Owner', 'Manager'].includes(req.memberRole)) {
      return errorResponse(res, 403, 'Permission denied: Only managers can delete tasks');
    }

    // Soft delete per FR-TASK-004
    task.isArchived = true;
    await task.save();

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: task.project,
      task: task._id,
      action: 'TASK_ARCHIVED',
      description: `${req.user.fullName} archived task "${task.title}"`,
    });

    return successResponse(res, 200, 'Task archived successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
};


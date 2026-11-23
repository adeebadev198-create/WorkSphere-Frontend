// backend/src/controllers/activityController.js
const ActivityLog = require('../models/ActivityLog');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse } = require('../utils/responseHandler');

// @desc    Get activity logs (SRS 4.4 Permission Matrix Enforced)
// @route   GET /api/v1/activities
// @access  Private (Workspace member)
const getActivities = async (req, res, next) => {
  try {
    const { projectId, taskId, limit = 20 } = req.query;
    const isOwner = req.memberRole === 'Owner';
    const isManager = req.memberRole === 'Manager';

    const filter = { workspace: req.workspace._id };

    if (!isOwner) {
      if (isManager) {
        // Manager: Assigned projects activity logs
        const managedProjects = await Project.find({
          workspace: req.workspace._id,
          $or: [{ manager: req.user._id }, { members: req.user._id }],
        }).select('_id');
        const pIds = managedProjects.map((p) => p._id);
        filter.project = { $in: pIds };
      } else {
        // Member: Relevant activities (own actions, assigned tasks, or member projects)
        const memberProjects = await Project.find({
          workspace: req.workspace._id,
          members: req.user._id,
        }).select('_id');
        const memberPIds = memberProjects.map((p) => p._id);

        const assignedTasks = await Task.find({
          workspace: req.workspace._id,
          assignedTo: req.user._id,
        }).select('_id');
        const assignedTaskIds = assignedTasks.map((t) => t._id);

        filter.$or = [
          { actor: req.user._id },
          { task: { $in: assignedTaskIds } },
          { project: { $in: memberPIds } },
        ];
      }
    }

    if (projectId) filter.project = projectId;
    if (taskId) filter.task = taskId;

    const activities = await ActivityLog.find(filter)
      .populate('actor', 'fullName email profilePicture')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return successResponse(res, 200, 'Activity logs retrieved', activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
};


// backend/src/controllers/activityController.js
const ActivityLog = require('../models/ActivityLog');
const { successResponse } = require('../utils/responseHandler');

// @desc    Get activity logs
// @route   GET /api/v1/activities
// @access  Private (Workspace member)
const getActivities = async (req, res, next) => {
  try {
    const { projectId, taskId, limit = 20 } = req.query;

    const filter = { workspace: req.workspace._id };
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


// backend/src/controllers/dashboardController.js
const Project = require('../models/Project');
const Task = require('../models/Task');
const WorkspaceMember = require('../models/WorkspaceMember');
const ActivityLog = require('../models/ActivityLog');
const { successResponse } = require('../utils/responseHandler');

// @desc    Get dashboard overview data (Role-aware)
// @route   GET /api/v1/dashboard/overview
// @access  Private
const getDashboardOverview = async (req, res, next) => {
  try {
    const workspaceId = req.workspace._id;
    const isOwner = req.memberRole === 'Owner';
    const isManager = req.memberRole === 'Manager';

    // Base filters
    let projectFilter = { workspace: workspaceId, isArchived: false };
    let taskFilter = { workspace: workspaceId, isArchived: false };

    // If Team Member, filter tasks assigned to them for personal stats
    if (!isOwner && !isManager) {
      taskFilter.assignedTo = req.user._id;
    } else if (isManager) {
      // For manager, find their managed or assigned projects
      const managedProjects = await Project.find({
        workspace: workspaceId,
        $or: [{ manager: req.user._id }, { members: req.user._id }],
      }).select('_id');
      const pIds = managedProjects.map((p) => p._id);
      // If they manage projects, filter by those projects
      if (pIds.length > 0) {
        projectFilter._id = { $in: pIds };
      }
    }

    // Projects stats
    const totalProjects = await Project.countDocuments(projectFilter);
    const activeProjects = await Project.countDocuments({
      ...projectFilter,
      status: { $in: ['Planning', 'In Progress'] },
    });
    const completedProjects = await Project.countDocuments({
      ...projectFilter,
      status: 'Completed',
    });

    // Tasks stats
    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'Completed',
    });
    const inProgressTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'In Progress',
    });
    const inReviewTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'In Review',
    });
    const pendingTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $ne: 'Completed' },
    });

    // BR-006: Completed tasks must not be counted as overdue
    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $ne: 'Completed' },
      dueDate: { $lt: now },
    });

    // Tasks completed in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const completedThisWeek = await Task.countDocuments({
      ...taskFilter,
      status: 'Completed',
      updatedAt: { $gte: oneWeekAgo },
    });

    // Tasks by Status
    const statusCounts = [
      { name: 'To Do', value: await Task.countDocuments({ ...taskFilter, status: 'To Do' }), color: '#94A3B8' },
      { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
      { name: 'In Review', value: inReviewTasks, color: '#F59E0B' },
      { name: 'Completed', value: completedTasks, color: '#10B981' },
    ];

    // Tasks by Priority
    const priorityCounts = [
      { name: 'Low', count: await Task.countDocuments({ ...taskFilter, priority: 'Low' }) },
      { name: 'Medium', count: await Task.countDocuments({ ...taskFilter, priority: 'Medium' }) },
      { name: 'High', count: await Task.countDocuments({ ...taskFilter, priority: 'High' }) },
      { name: 'Urgent', count: await Task.countDocuments({ ...taskFilter, priority: 'Urgent' }) },
    ];

    // Upcoming deadlines (within 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = await Task.find({
      ...taskFilter,
      status: { $ne: 'Completed' },
      dueDate: { $gte: now, $lte: nextWeek },
    })
      .populate('project', 'name')
      .populate('assignedTo', 'fullName email profilePicture')
      .sort({ dueDate: 1 })
      .limit(6);

    // Recent tasks
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'fullName email profilePicture title')
      .sort({ updatedAt: -1 })
      .limit(6);

    // Recent activities
    const recentActivities = await ActivityLog.find({ workspace: workspaceId })
      .populate('actor', 'fullName email profilePicture')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(6);

    // Monthly completion trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = await Promise.all(
      months.map(async (m, idx) => {
        const start = new Date(currentYear, idx, 1);
        const end = new Date(currentYear, idx + 1, 0, 23, 59, 59);
        const approved = await Task.countDocuments({
          ...taskFilter,
          status: 'Completed',
          updatedAt: { $gte: start, $lte: end },
        });
        const reviewed = await Task.countDocuments({
          ...taskFilter,
          status: 'In Review',
          updatedAt: { $gte: start, $lte: end },
        });
        return {
          month: m,
          completed: approved,
          inReview: reviewed,
          name: m,
          approved,
          reviewed,
        };
      })
    );

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse(res, 200, 'Dashboard overview loaded', {
      kpis: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        inReviewTasks,
        completedTasks,
        overdueTasks,
        completedThisWeek,
        completionRate: `${completionRate}%`,
      },
      charts: {
        statusBreakdown: statusCounts,
        priorityBreakdown: priorityCounts,
        monthlyCompletion: monthlyData,
      },
      upcomingDeadlines,
      recentTasks,
      recentActivities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
};


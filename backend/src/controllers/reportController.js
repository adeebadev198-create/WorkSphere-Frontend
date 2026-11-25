// backend/src/controllers/reportController.js
const { Parser } = require('json2csv');
const Project = require('../models/Project');
const Task = require('../models/Task');
const WorkspaceMember = require('../models/WorkspaceMember');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get detailed project report
// @route   GET /api/v1/reports/projects
// @access  Private
const getProjectReport = async (req, res, next) => {
  try {
    const isOwner = req.memberRole === 'Owner';
    const isManager = req.memberRole === 'Manager';

    const projectFilter = {
      workspace: req.workspace._id,
      isArchived: false,
    };

    if (!isOwner) {
      if (isManager) {
        projectFilter.$or = [{ manager: req.user._id }, { members: req.user._id }];
      } else {
        projectFilter.members = req.user._id;
      }
    }

    const projects = await Project.find(projectFilter)
      .populate('manager', 'fullName email')
      .populate('members', 'fullName email');

    const report = await Promise.all(
      projects.map(async (p) => {
        const total = await Task.countDocuments({ project: p._id, isArchived: false });
        const completed = await Task.countDocuments({
          project: p._id,
          status: 'Completed',
          isArchived: false,
        });
        const overdue = await Task.countDocuments({
          project: p._id,
          status: { $ne: 'Completed' },
          dueDate: { $lt: new Date() },
          isArchived: false,
        });
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          id: p._id,
          name: p.name,
          manager: p.manager ? p.manager.fullName : 'Unassigned',
          status: p.status,
          priority: p.priority,
          startDate: p.startDate,
          endDate: p.endDate,
          totalTasks: total,
          completedTasks: completed,
          overdueTasks: overdue,
          progress: `${progress}%`,
        };
      })
    );

    return successResponse(res, 200, 'Project report generated', report);
  } catch (error) {
    next(error);
  }
};

// @desc    Get task status and completion report
// @route   GET /api/v1/reports/tasks
// @access  Private
const getTaskReport = async (req, res, next) => {
  try {
    const { status, priority, projectId } = req.query;
    const isOwner = req.memberRole === 'Owner';
    const isManager = req.memberRole === 'Manager';

    const filter = { workspace: req.workspace._id, isArchived: false };

    if (!isOwner) {
      if (isManager) {
        const managedProjects = await Project.find({
          workspace: req.workspace._id,
          $or: [{ manager: req.user._id }, { members: req.user._id }],
        }).select('_id');
        const pIds = managedProjects.map((p) => p._id);
        filter.project = { $in: pIds };
      } else {
        // Member: Personal tasks only
        filter.assignedTo = req.user._id;
      }
    }

    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (projectId) {
      // If manager already filtered projects, check if projectId is within manager's projects
      if (isManager && filter.project && !filter.project.$in.some((id) => id.toString() === projectId)) {
        return successResponse(res, 200, 'Task report generated', []);
      }
      filter.project = projectId;
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'fullName email')
      .populate('createdBy', 'fullName email')
      .sort({ dueDate: 1 });

    const now = new Date();
    const formatted = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      project: t.project ? t.project.name : 'Unknown',
      assignees: t.assignedTo.map((u) => u.fullName).join(', ') || 'Unassigned',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'N/A',
      isOverdue: t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now,
      createdAt: t.createdAt.toISOString().split('T')[0],
    }));

    return successResponse(res, 200, 'Task report generated', formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get team member workload report
// @route   GET /api/v1/reports/team-performance
// @access  Private
const getTeamPerformanceReport = async (req, res, next) => {
  try {
    const isOwner = req.memberRole === 'Owner';
    const isManager = req.memberRole === 'Manager';

    let memberQuery = {
      workspace: req.workspace._id,
      status: 'Active',
    };

    if (!isOwner) {
      if (!isManager) {
        // Member: Only personal performance
        memberQuery.user = req.user._id;
      } else {
        // Manager: Members belonging to assigned projects
        const managedProjects = await Project.find({
          workspace: req.workspace._id,
          $or: [{ manager: req.user._id }, { members: req.user._id }],
        }).select('members manager');
        const userIds = new Set();
        userIds.add(req.user._id.toString());
        managedProjects.forEach((p) => {
          if (p.manager) userIds.add(p.manager.toString());
          (p.members || []).forEach((m) => userIds.add(m.toString()));
        });
        memberQuery.user = { $in: Array.from(userIds) };
      }
    }

    const members = await WorkspaceMember.find(memberQuery).populate('user', 'fullName email title');

    const performance = await Promise.all(
      members.map(async (m) => {
        if (!m.user) return null;
        const totalAssigned = await Task.countDocuments({
          workspace: req.workspace._id,
          assignedTo: m.user._id,
          isArchived: false,
        });
        const completed = await Task.countDocuments({
          workspace: req.workspace._id,
          assignedTo: m.user._id,
          status: 'Completed',
          isArchived: false,
        });
        const inProgress = await Task.countDocuments({
          workspace: req.workspace._id,
          assignedTo: m.user._id,
          status: 'In Progress',
          isArchived: false,
        });
        const overdue = await Task.countDocuments({
          workspace: req.workspace._id,
          assignedTo: m.user._id,
          status: { $ne: 'Completed' },
          dueDate: { $lt: new Date() },
          isArchived: false,
        });

        const rate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

        return {
          id: m.user._id,
          name: m.user.fullName,
          email: m.user.email,
          role: m.role,
          totalAssigned,
          inProgress,
          completed,
          overdue,
          completionRate: `${rate}%`,
        };
      })
    );

    return successResponse(
      res,
      200,
      'Team performance report generated',
      performance.filter(Boolean)
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Export data to CSV
// @route   GET /api/v1/reports/export
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    // SRS 4.4 Permission Matrix: Export reports - Owner: Yes, Manager: Yes, Member: No
    if (!['Owner', 'Manager'].includes(req.memberRole)) {
      return errorResponse(res, 403, 'Permission denied: Team members cannot export workspace reports');
    }

    const { type = 'tasks' } = req.query;
    const isOwner = req.memberRole === 'Owner';
    const isManager = req.memberRole === 'Manager';
    let data = [];
    let fields = [];

    if (type === 'tasks') {
      const taskFilter = {
        workspace: req.workspace._id,
        isArchived: false,
      };

      if (!isOwner) {
        if (isManager) {
          const managedProjects = await Project.find({
            workspace: req.workspace._id,
            $or: [{ manager: req.user._id }, { members: req.user._id }],
          }).select('_id');
          const pIds = managedProjects.map((p) => p._id);
          taskFilter.project = { $in: pIds };
        } else {
          taskFilter.assignedTo = req.user._id;
        }
      }

      const tasks = await Task.find(taskFilter)
        .populate('project', 'name')
        .populate('assignedTo', 'fullName')
        .sort({ createdAt: -1 });

      const now = new Date();
      data = tasks.map((t) => ({
        Task_Title: t.title,
        Project: t.project ? t.project.name : '',
        Status: t.status,
        Priority: t.priority,
        Assignees: t.assignedTo.map((u) => u.fullName).join('; '),
        Due_Date: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
        Is_Overdue: t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now ? 'Yes' : 'No',
      }));
      fields = ['Task_Title', 'Project', 'Status', 'Priority', 'Assignees', 'Due_Date', 'Is_Overdue'];
    } else if (type === 'projects') {
      const projectFilter = {
        workspace: req.workspace._id,
        isArchived: false,
      };

      if (!isOwner) {
        if (isManager) {
          projectFilter.$or = [{ manager: req.user._id }, { members: req.user._id }];
        } else {
          projectFilter.members = req.user._id;
        }
      }

      const projects = await Project.find(projectFilter).populate('manager', 'fullName');

      data = projects.map((p) => ({
        Project_Name: p.name,
        Manager: p.manager ? p.manager.fullName : 'Unassigned',
        Status: p.status,
        Priority: p.priority,
        Start_Date: p.startDate ? p.startDate.toISOString().split('T')[0] : '',
        Deadline: p.endDate ? p.endDate.toISOString().split('T')[0] : '',
      }));
      fields = ['Project_Name', 'Manager', 'Status', 'Priority', 'Start_Date', 'Deadline'];
    } else {
      return errorResponse(res, 400, 'Invalid export type. Supported: tasks, projects');
    }

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`worksphere_${type}_export_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectReport,
  getTaskReport,
  getTeamPerformanceReport,
  exportCSV,
};


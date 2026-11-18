// backend/src/utils/activityLogger.js
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const logActivity = async ({ actor, workspace, project, task, action, description, oldValue, newValue }) => {
  try {
    return await ActivityLog.create({
      actor,
      workspace,
      project,
      task,
      action,
      description,
      oldValue,
      newValue,
    });
  } catch (err) {
    console.error('Error logging activity:', err.message);
  }
};

const createNotification = async ({ recipient, workspace, type, title, message, relatedEntity }) => {
  try {
    return await Notification.create({
      recipient,
      workspace,
      type,
      title,
      message,
      relatedEntity,
    });
  } catch (err) {
    console.error('Error creating notification:', err.message);
  }
};

module.exports = {
  logActivity,
  createNotification,
};


// backend/src/controllers/commentController.js
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { logActivity, createNotification } = require('../utils/activityLogger');

// @desc    Get comments for task
// @route   GET /api/v1/tasks/:taskId/comments
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'fullName email profilePicture')
      .sort({ createdAt: 1 });

    return successResponse(res, 200, 'Comments retrieved', comments);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/v1/tasks/:taskId/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return errorResponse(res, 400, 'Comment content cannot be empty');
    }

    const task = await Task.findOne({
      _id: req.params.taskId,
      workspace: req.workspace._id,
    });

    if (!task) {
      return errorResponse(res, 404, 'Task not found');
    }

    const comment = await Comment.create({
      task: task._id,
      user: req.user._id,
      content: content.trim(),
    });

    await logActivity({
      actor: req.user._id,
      workspace: req.workspace._id,
      project: task.project,
      task: task._id,
      action: 'COMMENT_ADDED',
      description: `${req.user.fullName} commented on task "${task.title}"`,
    });

    // Notify task assignees
    if (task.assignedTo && task.assignedTo.length > 0) {
      for (const uid of task.assignedTo) {
        if (uid.toString() !== req.user._id.toString()) {
          await createNotification({
            recipient: uid,
            workspace: req.workspace._id,
            type: 'CommentAdded',
            title: 'New Comment on Task',
            message: `${req.user.fullName}: "${content.substring(0, 60)}..."`,
            relatedEntity: {
              entityType: 'Task',
              entityId: task._id,
            },
          });
        }
      }
    }

    const populated = await Comment.findById(comment._id).populate(
      'user',
      'fullName email profilePicture'
    );

    return successResponse(res, 201, 'Comment added successfully', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PATCH /api/v1/comments/:id
// @access  Private (Own comment)
const updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return errorResponse(res, 404, 'Comment not found');
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You can only edit your own comment');
    }

    comment.content = content.trim();
    await comment.save();

    return successResponse(res, 200, 'Comment updated', comment);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Author, Owner, Manager)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return errorResponse(res, 404, 'Comment not found');
    }

    const isAuthor = comment.user.toString() === req.user._id.toString();
    const isOwnerOrManager = ['Owner', 'Manager'].includes(req.memberRole);

    if (!isAuthor && !isOwnerOrManager) {
      return errorResponse(res, 403, 'Not authorized to delete this comment');
    }

    await comment.deleteOne();
    return successResponse(res, 200, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
};


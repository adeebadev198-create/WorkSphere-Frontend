// backend/src/routes/commentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.route('/tasks/:taskId/comments')
  .get(getComments)
  .post(addComment);

router.route('/comments/:id')
  .patch(updateComment)
  .delete(deleteComment);

module.exports = router;


// backend/src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess, requireRole } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.get('/my-tasks', getMyTasks);

router.route('/')
  .get(getTasks)
  .post(requireRole(['Owner', 'Manager']), createTask);

router.route('/:id')
  .get(getTaskById)
  .patch(updateTask)
  .delete(requireRole(['Owner', 'Manager']), deleteTask);

router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/assign', requireRole(['Owner', 'Manager']), assignTask);

module.exports = router;


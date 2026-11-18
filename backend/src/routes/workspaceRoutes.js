// backend/src/routes/workspaceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
} = require('../controllers/workspaceController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess, requireRole } = require('../middlewares/workspaceMiddleware');

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.route('/:id')
  .get(verifyWorkspaceAccess, getWorkspaceById)
  .patch(verifyWorkspaceAccess, requireRole(['Owner']), updateWorkspace)
  .delete(verifyWorkspaceAccess, requireRole(['Owner']), deleteWorkspace);

module.exports = router;


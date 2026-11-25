// backend/src/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  archiveProject,
  addProjectMember,
  removeProjectMember,
} = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess, requireRole } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.route('/')
  .get(getProjects)
  .post(requireRole(['Owner', 'Manager']), createProject);

router.route('/:id')
  .get(getProjectById)
  .patch(requireRole(['Owner', 'Manager']), updateProject)
  .delete(requireRole(['Owner']), archiveProject);

router.post('/:id/members', requireRole(['Owner', 'Manager']), addProjectMember);
router.delete('/:id/members/:userId', requireRole(['Owner', 'Manager']), removeProjectMember);
router.patch('/:id/archive', requireRole(['Owner']), archiveProject);

module.exports = router;


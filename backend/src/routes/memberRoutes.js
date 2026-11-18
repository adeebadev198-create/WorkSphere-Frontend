// backend/src/routes/memberRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getMembers,
  inviteMember,
  acceptInvitation,
  updateMemberRole,
  removeMember,
  getInvitations,
} = require('../controllers/memberController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess, requireRole } = require('../middlewares/workspaceMiddleware');

// Accept invitation (doesn't require current workspace context yet)
router.post('/invitations/accept', protect, acceptInvitation);

// Workspace specific member routes
router.use(protect);
router.use(verifyWorkspaceAccess);

router.get('/members', getMembers);
router.post('/invitations', requireRole(['Owner']), inviteMember);
router.get('/invitations', requireRole(['Owner']), getInvitations);
router.patch('/members/:userId/role', requireRole(['Owner']), updateMemberRole);
router.delete('/members/:userId', requireRole(['Owner']), removeMember);

module.exports = router;


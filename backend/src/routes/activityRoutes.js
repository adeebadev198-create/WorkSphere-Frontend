// backend/src/routes/activityRoutes.js
const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.get('/', getActivities);

module.exports = router;


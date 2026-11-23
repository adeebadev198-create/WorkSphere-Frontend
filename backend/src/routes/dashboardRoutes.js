// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getTaskStatistics,
  getProjectStatistics,
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.get('/overview', getDashboardOverview);
router.get('/task-statistics', getTaskStatistics);
router.get('/project-statistics', getProjectStatistics);

module.exports = router;


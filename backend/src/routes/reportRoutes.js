// backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getProjectReport,
  getTaskReport,
  getTeamPerformanceReport,
  exportCSV,
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.get('/projects', getProjectReport);
router.get('/tasks', getTaskReport);
router.get('/team-performance', getTeamPerformanceReport);
router.get('/export', exportCSV);

module.exports = router;


// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { verifyWorkspaceAccess } = require('../middlewares/workspaceMiddleware');

router.use(protect);
router.use(verifyWorkspaceAccess);

router.get('/overview', getDashboardOverview);

module.exports = router;


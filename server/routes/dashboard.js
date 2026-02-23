const express = require('express');
const router = express.Router();
const { getAdminDashboard, getSalesDashboard } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/admin', adminOnly, getAdminDashboard);
router.get('/sales', getSalesDashboard);

module.exports = router;

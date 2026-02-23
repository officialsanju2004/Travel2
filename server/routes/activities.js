const express = require('express');
const router = express.Router();
const { getActivitiesByLead, addActivity, deleteActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/lead/:leadId', getActivitiesByLead);
router.post('/lead/:leadId', addActivity);
router.delete('/:id', deleteActivity);

module.exports = router;

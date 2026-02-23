const express = require('express');
const router = express.Router();
const {
  getLeads, getLead, createLead, bulkCreateLeads, updateLead,
  deleteLead, assignLead, bulkAssignLeads
} = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', createLead);
router.post('/bulk', adminOnly, bulkCreateLeads);
router.put('/:id', updateLead);
router.delete('/:id', adminOnly, deleteLead);
router.patch('/:id/assign', adminOnly, assignLead);
router.post('/bulk-assign', adminOnly, bulkAssignLeads);

module.exports = router;

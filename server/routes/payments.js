const express = require('express');
const router = express.Router();
const { getPaymentsByLead, addPayment, updatePayment, deletePayment, getAllPayments, downloadInvoice } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/', adminOnly, getAllPayments);
router.get('/lead/:leadId', getPaymentsByLead);
router.post('/lead/:leadId', addPayment);
router.put('/:id', adminOnly, updatePayment);
router.delete('/:id', adminOnly, deletePayment);
router.get("/invoice/:id",downloadInvoice);

module.exports = router;

const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, resendOTP, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

module.exports = router;

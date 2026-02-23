const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/email');

const JWT_SECRET = process.env.JWT_SECRET || 'travelcrm_enterprise_secret_2024';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOTP = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    await OTP.deleteMany({ email: email.toLowerCase() });
    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

    const emailResult = await sendOTPEmail(email, otp, user.name);
    if (!emailResult.success) {
      console.log(`\n===== OTP for ${email}: ${otp} =====\n`);
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ success: false, message: 'Failed to send OTP. Check email config.' });
      }
    }

    res.json({ success: true, message: `OTP sent to ${email}`, ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), verified: false });
    if (!otpRecord) return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
    if (new Date() > otpRecord.expiresAt) { await OTP.deleteOne({ _id: otpRecord._id }); return res.status(400).json({ success: false, message: 'OTP expired. Please login again.' }); }

    otpRecord.attempts += 1;
    await otpRecord.save();
    if (otpRecord.attempts > 5) { await OTP.deleteOne({ _id: otpRecord._id }); return res.status(400).json({ success: false, message: 'Too many attempts. Login again.' }); }
    if (otpRecord.otp !== otp.toString()) return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.` });

    await OTP.deleteOne({ _id: otpRecord._id });
    const user = await User.findOne({ email: email.toLowerCase() });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, isActive: user.isActive, lastLogin: user.lastLogin } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await OTP.deleteMany({ email: email.toLowerCase() });
    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    const emailResult = await sendOTPEmail(email, otp, user.name);
    if (!emailResult.success) console.log(`\nResend OTP for ${email}: ${otp}\n`);

    res.json({ success: true, message: 'New OTP sent', ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try { const user = await User.findById(req.user.id); res.json({ success: true, user }); }
  catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

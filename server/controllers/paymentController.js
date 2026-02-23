const Payment = require('../models/Payment');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const generateInvoice = require('../utils/generateInvoice');


exports.getPaymentsByLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead || lead.isDeleted) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'sales' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payments = await Payment.find({ lead: req.params.leadId })
      .populate('receivedBy', 'name')
      .sort({ receivedAt: -1 });

    const totalReceived = payments
      .filter(p => p.status === 'received')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalRefunded = payments
      .filter(p => p.status === 'refunded')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({ success: true, payments, summary: { totalReceived, totalRefunded, netAmount: totalReceived - totalRefunded } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.downloadInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const lead = await Lead.findById(payment.lead);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    generateInvoice(res, payment, lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};
exports.addPayment = async (req, res) => {
  try {
    const { type, amount, paymentMethod, description, referenceNumber, notes, receivedAt } = req.body;

    const lead = await Lead.findById(req.params.leadId);
    if (!lead || lead.isDeleted) return res.status(404).json({ success: false, message: 'Lead not found' });

    if (req.user.role === 'sales' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payment = await Payment.create({
      lead: req.params.leadId,
      type,
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'cash',
      description,
      referenceNumber,
      notes,
      receivedBy: req.user._id,
      receivedAt: receivedAt || new Date(),
      status: 'received'
    });

    // Update lead revenue
    const allPayments = await Payment.find({ lead: req.params.leadId, status: 'received' });
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    await Lead.findByIdAndUpdate(req.params.leadId, { revenue: totalRevenue });

    // Log activity
    await Activity.create({
      lead: req.params.leadId,
      user: req.user._id,
      type: 'note',
      content: `Payment received: ${payment.invoiceNumber} — $${amount} (${type} — ${paymentMethod})`
    });

    const populated = await Payment.findById(payment._id).populate('receivedBy', 'name');
    res.status(201).json({ success: true, payment: populated, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('receivedBy', 'name');

    // Recalculate lead revenue
    const allPayments = await Payment.find({ lead: payment.lead, status: 'received' });
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    await Lead.findByIdAndUpdate(payment.lead, { revenue: totalRevenue });

    res.json({ success: true, payment: updated, message: 'Payment updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    await Payment.findByIdAndDelete(req.params.id);

    // Recalculate lead revenue
    const allPayments = await Payment.find({ lead: payment.lead, status: 'received' });
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);
    await Lead.findByIdAndUpdate(payment.lead, { revenue: totalRevenue });

    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(filter)
      .populate('lead', 'name phone destination')
      .populate('receivedBy', 'name')
      .sort({ receivedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);
    const totalAmount = await Payment.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      payments,
      totalRevenue: totalAmount[0]?.total || 0,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
